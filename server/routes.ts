import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all specialties
  app.get("/api/specialties", async (req, res) => {
    try {
      const specialties = await storage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch specialties" });
    }
  });

  // Get doctors by specialty
  app.get("/api/doctors/specialty/:specialtyId", async (req, res) => {
    try {
      const specialtyId = parseInt(req.params.specialtyId);
      if (isNaN(specialtyId)) {
        return res.status(400).json({ message: "Invalid specialty ID" });
      }
      
      const doctors = await storage.getDoctorsBySpecialty(specialtyId);
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  // Get doctor availability
  app.get("/api/availability/:doctorId/:date", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const date = req.params.date;
      
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }

      const availability = await storage.getAvailability(doctorId, date);
      if (!availability) {
        return res.json({ timeSlots: [] });
      }

      // Filter out booked slots
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      const bookedSlots = appointments
        .filter(apt => apt.date === date && apt.status !== "cancelled")
        .map(apt => apt.time);

      const availableSlots = availability.timeSlots?.filter(slot => !bookedSlots.includes(slot)) || [];
      
      res.json({ timeSlots: availableSlots });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Check if slot is still available
      const availability = await storage.getAvailability(validatedData.doctorId, validatedData.date);
      if (!availability || !availability.timeSlots?.includes(validatedData.time)) {
        return res.status(400).json({ message: "Selected time slot is not available" });
      }

      // Check if slot is already booked
      const existingAppointments = await storage.getAppointmentsByDoctor(validatedData.doctorId);
      const isSlotBooked = existingAppointments.some(apt => 
        apt.date === validatedData.date && 
        apt.time === validatedData.time && 
        apt.status !== "cancelled"
      );

      if (isSlotBooked) {
        return res.status(400).json({ message: "Selected time slot is already booked" });
      }

      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Get user appointments
  app.get("/api/appointments/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const appointments = await storage.getAppointmentsByUser(userId);
      
      // Enrich appointments with doctor and specialty info
      const enrichedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          const doctor = await storage.getDoctor(appointment.doctorId);
          const specialty = await storage.getSpecialty(appointment.specialtyId);
          return {
            ...appointment,
            doctorName: doctor?.name,
            specialtyName: specialty?.name
          };
        })
      );

      res.json(enrichedAppointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }

      if (!["confirmed", "pending", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const appointment = await storage.updateAppointmentStatus(id, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Get calendar availability for a month
  app.get("/api/calendar/:doctorId/:year/:month", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      if (isNaN(doctorId) || isNaN(year) || isNaN(month)) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      const daysInMonth = new Date(year, month, 0).getDate();
      const availabilityMap: Record<string, boolean> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) {
          availabilityMap[day.toString()] = false;
          continue;
        }

        const availability = await storage.getAvailability(doctorId, dateStr);
        const appointments = await storage.getAppointmentsByDoctor(doctorId);
        const bookedSlots = appointments
          .filter(apt => apt.date === dateStr && apt.status !== "cancelled")
          .map(apt => apt.time);

        const availableSlots = availability?.timeSlots?.filter(slot => !bookedSlots.includes(slot)) || [];
        availabilityMap[day.toString()] = availableSlots.length > 0;
      }

      res.json(availabilityMap);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calendar availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
