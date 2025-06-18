import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileMenu from "@/components/layout/mobile-menu";
import AppointmentForm from "@/components/appointments/appointment-form";
import AvailabilityCalendar from "@/components/appointments/availability-calendar";
import UpcomingAppointments from "@/components/appointments/upcoming-appointments";
import ConfirmationModal from "@/components/appointments/confirmation-modal";
import { api } from "@/lib/api";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Fetch specialties and doctors to get names for confirmation
  const { data: specialties } = useQuery({
    queryKey: ['/api/specialties'],
  });

  const handleAppointmentCreated = async (appointment: any) => {
    // Get specialty and doctor names
    const specialty = specialties?.find((s: any) => s.id === appointment.specialtyId);
    const doctorsResponse = await api.getDoctorsBySpecialty(appointment.specialtyId);
    const doctor = doctorsResponse.find((d: any) => d.id === appointment.doctorId);

    setConfirmedAppointment({
      specialty: specialty?.name || "",
      doctor: doctor?.name || "",
      date: appointment.date,
      time: appointment.time,
    });
    setConfirmationModalOpen(true);
  };
  
  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctorId(doctorId);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="flex-1 overflow-hidden">
        <TopBar
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          title="Programar Nueva Cita"
          subtitle="Selecciona especialidad, doctor y horario disponible"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile title */}
            <div className="lg:hidden mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Programar Nueva Cita
              </h2>
              <p className="text-gray-600">
                Selecciona especialidad, doctor y horario disponible
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Appointment Form */}
              <div className="lg:col-span-2">
                <AppointmentForm 
                  onAppointmentCreated={handleAppointmentCreated}
                  onDoctorSelect={handleDoctorSelect}
                />
              </div>

              {/* Calendar and Upcoming Appointments */}
              <div className="lg:col-span-1 space-y-8">
                <AvailabilityCalendar
                  doctorId={selectedDoctorId}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
                
                <UpcomingAppointments />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        appointment={confirmedAppointment}
      />
    </div>
  );
}
