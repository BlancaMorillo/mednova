import { 
  users, specialties, doctors, appointments, availability, medicalHistory,
  type User, type InsertUser,
  type Specialty, type InsertSpecialty,
  type Doctor, type InsertDoctor,
  type Appointment, type InsertAppointment,
  type Availability, type InsertAvailability,
  type MedicalHistory, type InsertMedicalHistory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Specialty operations
  getSpecialties(): Promise<Specialty[]>;
  getSpecialty(id: number): Promise<Specialty | undefined>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;

  // Doctor operations
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]>;
  getDoctorByUserId(userId: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<Doctor>): Promise<Doctor | undefined>;

  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: number, status: string, notes?: string): Promise<Appointment | undefined>;

  // Availability operations
  getAvailability(doctorId: number, date: string): Promise<Availability | undefined>;
  getAvailabilityByDoctor(doctorId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(doctorId: number, date: string, timeSlots: string[], blockedHours?: string[], isHoliday?: boolean): Promise<Availability | undefined>;

  // Medical History operations
  getMedicalHistory(userId: number): Promise<MedicalHistory[]>;
  getMedicalHistoryByAppointment(appointmentId: number): Promise<MedicalHistory | undefined>;
  createMedicalHistory(history: InsertMedicalHistory): Promise<MedicalHistory>;
  updateMedicalHistory(id: number, history: Partial<MedicalHistory>): Promise<MedicalHistory | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private specialties: Map<number, Specialty> = new Map();
  private doctors: Map<number, Doctor> = new Map();
  private appointments: Map<number, Appointment> = new Map();
  private availability: Map<string, Availability> = new Map(); // key: doctorId-date
  private medicalHistory: Map<number, MedicalHistory> = new Map();
  private currentUserId: number = 1;
  private currentSpecialtyId: number = 1;
  private currentDoctorId: number = 1;
  private currentAppointmentId: number = 1;
  private currentAvailabilityId: number = 1;
  private currentMedicalHistoryId: number = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default patient user
    const patient = await this.createUser({
      username: "maria.gonzalez",
      password: "password123",
      fullName: "María González",
      socialSecurityId: "8-123-456",
      role: "patient",
      email: "maria@example.com",
      phone: "6000-0000"
    });

    // Create specialties
    const cardiology = await this.createSpecialty({ name: "Cardiología", description: "Especialidad del corazón y sistema cardiovascular" });
    const dermatology = await this.createSpecialty({ name: "Dermatología", description: "Especialidad de la piel" });
    const generalMedicine = await this.createSpecialty({ name: "Medicina General", description: "Atención médica general" });
    const neurology = await this.createSpecialty({ name: "Neurología", description: "Especialidad del sistema nervioso" });
    const ophthalmology = await this.createSpecialty({ name: "Oftalmología", description: "Especialidad de los ojos y la visión" });
    const traumatology = await this.createSpecialty({ name: "Traumatología", description: "Especialidad de huesos y articulaciones" });

    // Create doctor users
    const doctorUser1 = await this.createUser({
      username: "carlos.martinez",
      password: "doctor123",
      fullName: "Dr. Carlos Martínez",
      socialSecurityId: "8-111-111",
      role: "doctor",
      email: "carlos@example.com",
      phone: "6111-1111"
    });

    const doctorUser2 = await this.createUser({
      username: "ana.rodriguez",
      password: "doctor123",
      fullName: "Dra. Ana Rodríguez",
      socialSecurityId: "8-222-222",
      role: "doctor",
      email: "ana@example.com",
      phone: "6222-2222"
    });

    const doctorUser3 = await this.createUser({
      username: "miguel.lopez",
      password: "doctor123",
      fullName: "Dr. Miguel López",
      socialSecurityId: "8-333-333",
      role: "doctor",
      email: "miguel@example.com",
      phone: "6333-3333"
    });

    const doctorUser4 = await this.createUser({
      username: "laura.garcia",
      password: "doctor123",
      fullName: "Dra. Laura García",
      socialSecurityId: "8-444-444",
      role: "doctor",
      email: "laura@example.com",
      phone: "6444-4444"
    });

    const doctorUser5 = await this.createUser({
      username: "jose.fernandez",
      password: "doctor123",
      fullName: "Dr. José Fernández",
      socialSecurityId: "8-555-555",
      role: "doctor",
      email: "jose@example.com",
      phone: "6555-5555"
    });

    const doctorUser6 = await this.createUser({
      username: "carmen.silva",
      password: "doctor123",
      fullName: "Dra. Carmen Silva",
      socialSecurityId: "8-666-666",
      role: "doctor",
      email: "carmen@example.com",
      phone: "6666-6666"
    });

    // Create admin user
    const adminUser = await this.createUser({
      username: "admin",
      password: "admin123",
      fullName: "Administrador Sistema",
      socialSecurityId: "8-999-999",
      role: "admin",
      email: "admin@mednova.gov.pa",
      phone: "6999-9999"
    });

    // Create doctor profiles
    await this.createDoctor({ 
      userId: doctorUser1.id, 
      name: "Dr. Carlos Martínez", 
      specialtyId: cardiology.id, 
      isAvailable: true,
      licenseNumber: "MD-001"
    });
    await this.createDoctor({ 
      userId: doctorUser2.id,
      name: "Dra. Ana Rodríguez", 
      specialtyId: ophthalmology.id, 
      isAvailable: true,
      licenseNumber: "MD-002"
    });
    await this.createDoctor({ 
      userId: doctorUser3.id,
      name: "Dr. Miguel López", 
      specialtyId: generalMedicine.id, 
      isAvailable: true,
      licenseNumber: "MD-003"
    });
    await this.createDoctor({ 
      userId: doctorUser4.id,
      name: "Dra. Laura García", 
      specialtyId: dermatology.id, 
      isAvailable: true,
      licenseNumber: "MD-004"
    });
    await this.createDoctor({ 
      userId: doctorUser5.id,
      name: "Dr. José Fernández", 
      specialtyId: neurology.id, 
      isAvailable: true,
      licenseNumber: "MD-005"
    });
    await this.createDoctor({ 
      userId: doctorUser6.id,
      name: "Dra. Carmen Silva", 
      specialtyId: traumatology.id, 
      isAvailable: true,
      licenseNumber: "MD-006"
    });

    // Create sample availability
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
    
    for (const doctor of this.doctors.values()) {
      await this.createAvailability({
        doctorId: doctor.id,
        date: tomorrow.toISOString().split('T')[0],
        timeSlots,
        isHoliday: false,
        blockedHours: []
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "patient",
      email: insertUser.email || null,
      phone: insertUser.phone || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Specialty operations
  async getSpecialties(): Promise<Specialty[]> {
    return Array.from(this.specialties.values());
  }

  async getSpecialty(id: number): Promise<Specialty | undefined> {
    return this.specialties.get(id);
  }

  async createSpecialty(insertSpecialty: InsertSpecialty): Promise<Specialty> {
    const id = this.currentSpecialtyId++;
    const specialty: Specialty = { 
      ...insertSpecialty, 
      id,
      description: insertSpecialty.description || null
    };
    this.specialties.set(id, specialty);
    return specialty;
  }

  // Doctor operations
  async getDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]> {
    return Array.from(this.doctors.values()).filter(doctor => doctor.specialtyId === specialtyId);
  }

  async getDoctorByUserId(userId: number): Promise<Doctor | undefined> {
    return Array.from(this.doctors.values()).find(doctor => doctor.userId === userId);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentDoctorId++;
    const doctor: Doctor = { 
      ...insertDoctor, 
      id,
      isAvailable: insertDoctor.isAvailable ?? true,
      licenseNumber: insertDoctor.licenseNumber || null
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async updateDoctor(id: number, doctorUpdate: Partial<Doctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    
    const updatedDoctor = { ...doctor, ...doctorUpdate };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.userId === userId);
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.doctorId === doctorId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.date === date);
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => 
      appointment.date >= startDate && appointment.date <= endDate
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const now = new Date();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      status: insertAppointment.status || "confirmed",
      reason: insertAppointment.reason || null,
      notes: insertAppointment.notes || null,
      createdAt: now,
      updatedAt: now
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { 
      ...appointment, 
      ...appointmentUpdate,
      updatedAt: new Date()
    };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async updateAppointmentStatus(id: number, status: string, notes?: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { 
      ...appointment, 
      status,
      notes: notes || appointment.notes,
      updatedAt: new Date()
    };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Availability operations
  async getAvailability(doctorId: number, date: string): Promise<Availability | undefined> {
    const key = `${doctorId}-${date}`;
    return this.availability.get(key);
  }

  async getAvailabilityByDoctor(doctorId: number): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(avail => avail.doctorId === doctorId);
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const availability: Availability = { 
      ...insertAvailability, 
      id,
      timeSlots: insertAvailability.timeSlots || null,
      isHoliday: insertAvailability.isHoliday ?? false,
      blockedHours: insertAvailability.blockedHours || null
    };
    const key = `${availability.doctorId}-${availability.date}`;
    this.availability.set(key, availability);
    return availability;
  }

  async updateAvailability(doctorId: number, date: string, timeSlots: string[], blockedHours?: string[], isHoliday?: boolean): Promise<Availability | undefined> {
    const key = `${doctorId}-${date}`;
    const availability = this.availability.get(key);
    
    if (!availability) return undefined;
    
    const updatedAvailability = {
      ...availability,
      timeSlots,
      blockedHours: blockedHours || null,
      isHoliday: isHoliday ?? availability.isHoliday
    };
    
    this.availability.set(key, updatedAvailability);
    return updatedAvailability;
  }

  // Medical History operations
  async getMedicalHistory(userId: number): Promise<MedicalHistory[]> {
    return Array.from(this.medicalHistory.values()).filter(history => history.userId === userId);
  }

  async getMedicalHistoryByAppointment(appointmentId: number): Promise<MedicalHistory | undefined> {
    return Array.from(this.medicalHistory.values()).find(history => history.appointmentId === appointmentId);
  }

  async createMedicalHistory(insertHistory: InsertMedicalHistory): Promise<MedicalHistory> {
    const id = this.currentMedicalHistoryId++;
    const history: MedicalHistory = { 
      ...insertHistory, 
      id,
      appointmentId: insertHistory.appointmentId || null,
      diagnosis: insertHistory.diagnosis || null,
      treatment: insertHistory.treatment || null,
      medications: insertHistory.medications || null,
      allergies: insertHistory.allergies || null,
      notes: insertHistory.notes || null,
      createdAt: new Date()
    };
    this.medicalHistory.set(id, history);
    return history;
  }

  async updateMedicalHistory(id: number, historyUpdate: Partial<MedicalHistory>): Promise<MedicalHistory | undefined> {
    const history = this.medicalHistory.get(id);
    if (!history) return undefined;
    
    const updatedHistory = { ...history, ...historyUpdate };
    this.medicalHistory.set(id, updatedHistory);
    return updatedHistory;
  }
}

export const storage = new MemStorage();