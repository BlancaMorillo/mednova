import { useQuery } from "@tanstack/react-query";
import { Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, type AppointmentWithDetails } from "@/lib/api";

export default function UpcomingAppointments() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments/user', 1], // Default user ID
    queryFn: () => api.getUserAppointments(1).then(res => res.json()),
  });

  // Filter and sort upcoming appointments
  const upcomingAppointments = appointments
    ?.filter((apt: AppointmentWithDetails) => {
      const appointmentDate = new Date(`${apt.date}T${apt.time}`);
      return appointmentDate >= new Date() && apt.status !== "cancelled";
    })
    ?.sort((a: AppointmentWithDetails, b: AppointmentWithDetails) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    ?.slice(0, 3) || [];

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
            <Clock className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
            Próximas Citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
          <Clock className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
          Próximas Citas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tienes citas próximas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment: AppointmentWithDetails) => (
              <div 
                key={appointment.id} 
                className={`p-4 rounded-r-lg border-l-4 ${
                  appointment.status === 'confirmed' 
                    ? 'border-[hsl(207,90%,54%)] bg-[hsl(207,90%,97%)]' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.doctorName}</p>
                    <p className="text-sm text-gray-600">{appointment.specialtyName}</p>
                    <p className={`text-sm font-medium mt-1 ${
                      appointment.status === 'confirmed' 
                        ? 'text-[hsl(207,90%,54%)]' 
                        : 'text-gray-600'
                    }`}>
                      {formatDate(appointment.date)}, {formatTime(appointment.time)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'confirmed'
                      ? 'institutional-primary text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 
                     appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-[hsl(207,90%,54%)] hover:bg-[hsl(207,90%,97%)] py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver todas las citas
        </Button>
      </CardContent>
    </Card>
  );
}
