import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, ArrowLeft, TrendingUp, Download, 
  Calendar, Users, Activity, PieChart
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

export default function AdminReports() {
  const { user } = useAuth();
  const [reportType, setReportType] = useState("overview");
  const [timePeriod, setTimePeriod] = useState("month");

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

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (timePeriod) {
      case "week":
        return { start: subDays(now, 7), end: now };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "quarter":
        return { start: subDays(now, 90), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Filter appointments by date range
  const filteredAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.date);
    return aptDate >= startDate && aptDate <= endDate;
  });

  // Calculate metrics
  const totalAppointments = filteredAppointments.length;
  const confirmedAppointments = filteredAppointments.filter((apt: any) => apt.status === 'confirmed').length;
  const attendedAppointments = filteredAppointments.filter((apt: any) => apt.status === 'attended').length;
  const cancelledAppointments = filteredAppointments.filter((apt: any) => apt.status === 'cancelled').length;
  const noShowAppointments = filteredAppointments.filter((apt: any) => apt.status === 'no-show').length;

  const attendanceRate = totalAppointments > 0 ? Math.round((attendedAppointments / totalAppointments) * 100) : 0;
  const cancellationRate = totalAppointments > 0 ? Math.round(((cancelledAppointments + noShowAppointments) / totalAppointments) * 100) : 0;

  // Group by specialty
  const appointmentsBySpecialty = specialties.map((specialty: any) => {
    const count = filteredAppointments.filter((apt: any) => apt.specialtyId === specialty.id).length;
    return { name: specialty.name, count };
  }).sort((a, b) => b.count - a.count);

  // Group by doctor
  const appointmentsByDoctor = doctors.map((doctor: any) => {
    const count = filteredAppointments.filter((apt: any) => apt.doctorId === doctor.id).length;
    const attended = filteredAppointments.filter((apt: any) => apt.doctorId === doctor.id && apt.status === 'attended').length;
    const rate = count > 0 ? Math.round((attended / count) * 100) : 0;
    return { name: doctor.name, count, attendanceRate: rate };
  }).sort((a, b) => b.count - a.count);

  // Daily statistics for the period
  const dailyStats = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayAppointments = filteredAppointments.filter((apt: any) => apt.date === dateStr);
    dailyStats.push({
      date: format(d, 'd MMM', { locale: es }),
      appointments: dayAppointments.length,
      attended: dayAppointments.filter((apt: any) => apt.status === 'attended').length
    });
  }

  const exportReport = () => {
    const reportData = {
      period: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`,
      totalAppointments,
      attendanceRate: `${attendanceRate}%`,
      cancellationRate: `${cancellationRate}%`,
      specialties: appointmentsBySpecialty,
      doctors: appointmentsByDoctor
    };

    const csvContent = [
      "Reporte de Citas MedNova",
      `Período: ${reportData.period}`,
      "",
      "RESUMEN GENERAL",
      `Total de citas,${totalAppointments}`,
      `Confirmadas,${confirmedAppointments}`,
      `Atendidas,${attendedAppointments}`,
      `Canceladas,${cancelledAppointments}`,
      `No se presentaron,${noShowAppointments}`,
      `Tasa de asistencia,${attendanceRate}%`,
      `Tasa de cancelación,${cancellationRate}%`,
      "",
      "POR ESPECIALIDAD",
      "Especialidad,Citas",
      ...appointmentsBySpecialty.map(s => `${s.name},${s.count}`),
      "",
      "POR DOCTOR",
      "Doctor,Citas,Tasa de Asistencia",
      ...appointmentsByDoctor.map(d => `${d.name},${d.count},${d.attendanceRate}%`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-mednova-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generando reportes...</p>
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
              <h1 className="text-xl font-bold text-gray-800">Reportes y Estadísticas</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Info */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Reporte del {format(startDate, "d 'de' MMMM", { locale: es })} al {format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </h2>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Citas</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Asistencia</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Cancelación</p>
                  <p className="text-2xl font-bold text-gray-900">{cancellationRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doctores Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{doctors.filter((d: any) => d.isAvailable).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments by Specialty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Citas por Especialidad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsBySpecialty.slice(0, 6).map((specialty, index) => {
                  const percentage = totalAppointments > 0 ? Math.round((specialty.count / totalAppointments) * 100) : 0;
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-indigo-500'];
                  return (
                    <div key={specialty.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                        <span className="text-sm font-medium">{specialty.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{specialty.count}</div>
                        <div className="text-xs text-gray-500">{percentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Rendimiento por Doctor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsByDoctor.slice(0, 6).map((doctor, index) => (
                  <div key={doctor.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{doctor.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{doctor.count} citas</span>
                        <span className="text-xs text-gray-500 ml-2">({doctor.attendanceRate}% asistencia)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${doctor.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">Confirmadas</span>
                  <span className="text-lg font-bold text-blue-900">{confirmedAppointments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Atendidas</span>
                  <span className="text-lg font-bold text-green-900">{attendedAppointments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-800">Canceladas</span>
                  <span className="text-lg font-bold text-red-900">{cancelledAppointments}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium text-orange-800">No se presentaron</span>
                  <span className="text-lg font-bold text-orange-900">{noShowAppointments}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Diaria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyStats.slice(-7).map((day, index) => {
                  const maxAppointments = Math.max(...dailyStats.map(d => d.appointments));
                  const width = maxAppointments > 0 ? (day.appointments / maxAppointments) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{day.date}</span>
                        <span className="font-medium">{day.appointments} citas</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${width}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Report */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700">
                Durante el período analizado se registraron un total de <strong>{totalAppointments} citas médicas</strong>, 
                con una tasa de asistencia del <strong>{attendanceRate}%</strong> y una tasa de cancelación del <strong>{cancellationRate}%</strong>.
              </p>
              
              {appointmentsBySpecialty.length > 0 && (
                <p className="text-gray-700">
                  La especialidad con mayor demanda fue <strong>{appointmentsBySpecialty[0]?.name}</strong> con {appointmentsBySpecialty[0]?.count} citas, 
                  representando el {totalAppointments > 0 ? Math.round((appointmentsBySpecialty[0]?.count / totalAppointments) * 100) : 0}% del total.
                </p>
              )}
              
              {appointmentsByDoctor.length > 0 && (
                <p className="text-gray-700">
                  El doctor con mayor actividad fue <strong>{appointmentsByDoctor[0]?.name}</strong> con {appointmentsByDoctor[0]?.count} citas 
                  y una tasa de asistencia del {appointmentsByDoctor[0]?.attendanceRate}%.
                </p>
              )}
              
              <p className="text-gray-700">
                El sistema cuenta actualmente con <strong>{doctors.filter((d: any) => d.isAvailable).length} doctores activos</strong> 
                distribuidos en <strong>{specialties.length} especialidades</strong> médicas.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}