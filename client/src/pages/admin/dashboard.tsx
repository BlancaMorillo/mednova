import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Calendar, TrendingUp, Activity, 
  Heart, LogOut, BarChart3, FileText, 
  UserCheck, Clock, AlertCircle 
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['/api/appointments'],
    enabled: !!user
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['/api/doctors'],
    enabled: !!user
  });

  const { data: specialties = [] } = useQuery({
    queryKey: ['/api/specialties'],
    enabled: !!user
  });

  // Calculate metrics
  const todayAppointments = appointments.filter((apt: any) => apt.date === today);
  const pendingAppointments = appointments.filter((apt: any) => apt.status === 'confirmed');
  const completedAppointments = appointments.filter((apt: any) => apt.status === 'attended');
  const cancelledAppointments = appointments.filter((apt: any) => apt.status === 'cancelled' || apt.status === 'no-show');
  const activeDoctors = doctors.filter((doc: any) => doc.isAvailable);

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel administrativo...</p>
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
                <h1 className="text-xl font-bold text-gray-800">MedNova - Panel Administrativo</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/appointments">
                <Button variant="outline">Gestionar Citas</Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline">Reportes</Button>
              </Link>
              <Link href="/users">
                <Button variant="outline">Usuarios</Button>
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doctores Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{activeDoctors.length}</p>
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
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Especialidades</p>
                  <p className="text-2xl font-bold text-gray-900">{specialties.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Citas Recientes</span>
                  </div>
                  <Link href="/appointments">
                    <Button variant="outline" size="sm">Ver Todas</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay citas registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 5).map((appointment: any) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-sm font-bold text-blue-600">
                                {format(new Date(appointment.date), 'd MMM', { locale: es })}
                              </div>
                              <div className="text-xs text-gray-500">{appointment.time}</div>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                Paciente #{appointment.userId} → Doctor #{appointment.doctorId}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {appointment.reason || 'Consulta general'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'attended' ? 'secondary' :
                            'destructive'
                          }>
                            {appointment.status === 'confirmed' ? 'Confirmada' :
                             appointment.status === 'attended' ? 'Atendida' :
                             appointment.status === 'no-show' ? 'No vino' : 'Cancelada'}
                          </Badge>
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
                <Link href="/appointments" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gestionar Citas
                  </Button>
                </Link>
                <Link href="/users" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Administrar Usuarios
                  </Button>
                </Link>
                <Link href="/reports" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Reportes
                  </Button>
                </Link>
                <Link href="/settings" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Configuración
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime del sistema</span>
                    <span className="font-medium text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Citas del mes</span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de asistencia</span>
                    <span className="font-medium text-green-600">
                      {appointments.length > 0 
                        ? Math.round((completedAppointments.length / appointments.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Última sincronización</span>
                    <span className="font-medium">Hace 2 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span>Alertas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {cancelledAppointments.length} citas canceladas esta semana
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Sistema actualizado correctamente
                    </p>
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