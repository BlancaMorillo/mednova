import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, User, Calendar, Clock, Stethoscope, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, type AppointmentWithDetails } from "@/lib/api";

export default function Appointments() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments/user', 1],
    queryFn: () => api.getUserAppointments(1).then(res => res.json()),
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: (id: number) => api.updateAppointmentStatus(id, "cancelled"),
    onSuccess: () => {
      toast({
        title: "Cita Cancelada",
        description: "La cita ha sido cancelada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="institutional-primary">Confirmada</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sortedAppointments = appointments?.sort((a: AppointmentWithDetails, b: AppointmentWithDetails) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  }) || [];

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
          title="Mis Citas"
          subtitle="Gestiona tus citas médicas programadas"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Mobile title */}
            <div className="lg:hidden mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Mis Citas</h2>
              <p className="text-gray-600">Gestiona tus citas médicas programadas</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No tienes citas programadas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Programa tu primera cita médica para comenzar.
                  </p>
                  <Button className="institutional-primary">
                    Programar Cita
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {sortedAppointments.map((appointment: AppointmentWithDetails) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                <User className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                                {appointment.doctorName}
                              </h3>
                              <p className="text-gray-600 flex items-center mt-1">
                                <Stethoscope className="w-4 h-4 mr-2" />
                                {appointment.specialtyName}
                              </p>
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span>{formatTime(appointment.time)}</span>
                            </div>
                          </div>

                          {appointment.reason && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Motivo:</strong> {appointment.reason}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto">
                          {appointment.status === 'confirmed' && new Date(`${appointment.date}T${appointment.time}`) > new Date() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                              disabled={cancelAppointmentMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[hsl(207,90%,54%)] text-[hsl(207,90%,54%)] hover:bg-[hsl(207,90%,97%)]"
                          >
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
