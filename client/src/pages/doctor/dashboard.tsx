import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, CheckCircle, XCircle, Heart, LogOut } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['/api/appointments/doctor/1'], // In real app, would use actual doctor ID
    enabled: !!user
  });

  const { data: doctorProfile } = useQuery({
    queryKey: ['/api/doctors/1'], // In real app, would use actual doctor ID
    enabled: !!user
  });

  const todayAppointments = appointments.filter((apt: any) => apt.date === selectedDate);
  const pendingAppointments = todayAppointments.filter((apt: any) => apt.status === 'confirmed');
  const completedAppointments = todayAppointments.filter((apt: any) => apt.status === 'attended');
  const cancelledAppointments = todayAppointments.filter((apt: any) => apt.status === 'cancelled' || apt.status === 'no-show');

  const handleLogout = () => {
    logout();
  };

  const markAttendance = async (appointmentId: number, status: 'attended' | 'no-show') => {
    try {
      // In real app, would call API to update appointment status
      console.log(`Marking appointment ${appointmentId} as ${status}`);
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel médico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">MedNova - Panel Médico</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/schedule">
                <Button variant="outline">Mi Agenda</Button>
              </Link>
              <Link href="/availability">
                <Button variant="outline">Disponibilidad</Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Atendidas</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">No Show</p>
                  <p className="text-2xl font-bold text-gray-900">{cancelledAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Agenda de Hoy</span>
                </CardTitle>
                <CardDescription>
                  {format(new Date(selectedDate), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas programadas para hoy</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment: any) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{appointment.time}</div>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Paciente #{appointment.userId}</h3>
                              <p className="text-sm text-gray-600">{appointment.reason || 'Consulta general'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              appointment.status === 'confirmed' ? 'default' :
                              appointment.status === 'attended' ? 'secondary' :
                              'destructive'
                            }>
                              {appointment.status === 'confirmed' ? 'Confirmada' :
                               appointment.status === 'attended' ? 'Atendida' :
                               appointment.status === 'no-show' ? 'No vino' : 'Cancelada'}
                            </Badge>
                            {appointment.status === 'confirmed' && (
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  onClick={() => markAttendance(appointment.id, 'attended')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Atendida
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAttendance(appointment.id, 'no-show')}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  No vino
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/schedule" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Agenda Completa
                  </Button>
                </Link>
                <Link href="/availability" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Gestionar Disponibilidad
                  </Button>
                </Link>
                <Link href="/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Citas completadas</span>
                    <span className="font-medium">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de asistencia</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pacientes únicos</span>
                    <span className="font-medium">38</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}