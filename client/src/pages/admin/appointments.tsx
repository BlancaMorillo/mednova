import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, Search, Filter, ArrowLeft, 
  Edit, Trash2, Eye, Download 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

export default function AdminAppointments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

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

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find((d: any) => d.id === doctorId);
    return doctor?.name || `Doctor #${doctorId}`;
  };

  const getSpecialtyName = (specialtyId: number) => {
    const specialty = specialties.find((s: any) => s.id === specialtyId);
    return specialty?.name || `Especialidad #${specialtyId}`;
  };

  const filteredAppointments = appointments.filter((appointment: any) => {
    const matchesSearch = searchTerm === "" || 
      appointment.id.toString().includes(searchTerm) ||
      appointment.userId.toString().includes(searchTerm) ||
      getDoctorName(appointment.doctorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSpecialtyName(appointment.specialtyId).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;

    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && appointment.date === new Date().toISOString().split('T')[0]) ||
      (dateFilter === "week" && new Date(appointment.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const exportAppointments = () => {
    const csvContent = [
      ["ID", "Fecha", "Hora", "Paciente ID", "Doctor", "Especialidad", "Estado", "Motivo"].join(","),
      ...filteredAppointments.map((apt: any) => [
        apt.id,
        apt.date,
        apt.time,
        apt.userId,
        getDoctorName(apt.doctorId),
        getSpecialtyName(apt.specialtyId),
        apt.status,
        apt.reason || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando citas...</p>
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
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Panel
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-800">Gestión de Citas</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={exportAppointments} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, paciente, doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="attended">Atendidas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="no-show">No se presentó</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Mostrando {filteredAppointments.length} de {appointments.length} citas
          </p>
        </div>

        {/* Appointments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Lista de Citas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron citas con los filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha y Hora</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Paciente</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Doctor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Especialidad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Motivo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment: any) => (
                      <tr key={appointment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">#{appointment.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {format(new Date(appointment.date), 'd MMM yyyy', { locale: es })}
                            </div>
                            <div className="text-sm text-gray-500">{appointment.time}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">Paciente #{appointment.userId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{getDoctorName(appointment.doctorId)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{getSpecialtyName(appointment.specialtyId)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'attended' ? 'secondary' :
                            'destructive'
                          }>
                            {appointment.status === 'confirmed' ? 'Confirmada' :
                             appointment.status === 'attended' ? 'Atendida' :
                             appointment.status === 'no-show' ? 'No vino' : 'Cancelada'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 max-w-32 truncate">
                            {appointment.reason || 'Consulta general'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {appointments.filter((a: any) => a.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-600">Confirmadas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter((a: any) => a.status === 'attended').length}
              </div>
              <div className="text-sm text-gray-600">Atendidas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {appointments.filter((a: any) => a.status === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-600">Canceladas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {appointments.filter((a: any) => a.status === 'no-show').length}
              </div>
              <div className="text-sm text-gray-600">No se presentó</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}