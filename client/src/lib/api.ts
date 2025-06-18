import { apiRequest } from "@/lib/queryClient";

export interface AppointmentFormData {
  userId: number;
  specialtyId: number;     
  doctorId: number;
  date: string;
  time: string;
  reason?: string;
  status: string;
}

export interface AppointmentWithDetails {
  id: number;
  userId: number;
  doctorId: number;
  specialtyId: number;
  date: string;
  time: string;
  reason?: string;
  status: string;
  createdAt: Date;
  doctorName?: string;
  specialtyName?: string;
}

export const api = {
  // Specialties
  getSpecialties: () => fetch('/api/specialties').then(res => res.json()),
  
  // Doctors
  getDoctorsBySpecialty: (specialtyId: number) => 
    fetch(`/api/doctors/specialty/${specialtyId}`).then(res => res.json()),
  
  // Availability
  getAvailability: (doctorId: number, date: string) =>
    fetch(`/api/availability/${doctorId}/${date}`).then(res => res.json()),
    
  getCalendarAvailability: (doctorId: number, year: number, month: number) =>
    fetch(`/api/calendar/${doctorId}/${year}/${month}`).then(res => res.json()),
  
  // Appointments
  createAppointment: (data: AppointmentFormData) =>
    apiRequest('POST', '/api/appointments', data),
    
  getUserAppointments: (userId: number): Promise<Response> =>
    fetch(`/api/appointments/user/${userId}`),
    
  updateAppointmentStatus: (id: number, status: string) =>
    apiRequest('PATCH', `/api/appointments/${id}/status`, { status }),
};
