import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  socialSecurityId: text("social_security_id").notNull().unique(),
  role: text("role").notNull().default("patient"), // patient, doctor, admin
  email: text("email"),
  phone: text("phone"),
});

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Links to users table
  name: text("name").notNull(),
  specialtyId: integer("specialty_id").notNull(),
  isAvailable: boolean("is_available").default(true),
  licenseNumber: text("license_number"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  specialtyId: integer("specialty_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  reason: text("reason"),
  status: text("status").notNull().default("confirmed"), // confirmed, pending, cancelled, attended, no-show
  notes: text("notes"), // For doctor notes after appointment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  timeSlots: text("time_slots").array(), // Array of available time slots
  isHoliday: boolean("is_holiday").default(false),
  blockedHours: text("blocked_hours").array(), // Array of blocked time slots
});

export const medicalHistory = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  appointmentId: integer("appointment_id"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  medications: text("medications"),
  allergies: text("allergies"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertSpecialtySchema = createInsertSchema(specialties).omit({
  id: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;
export type Specialty = typeof specialties.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type MedicalHistory = typeof medicalHistory.$inferSelect;
