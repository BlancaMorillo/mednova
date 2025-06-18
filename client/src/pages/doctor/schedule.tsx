import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'week' | 'day'>('week');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['/api/appointments/doctor/1'],
    enabled: !!user
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const getAppointmentsForDay = (date: string) => {
    return appointments.filter((apt: any) => apt.date === date);
  };

  const getAppointmentForTime = (date: string, time: string) => {
    return appointments.find((apt: any) => apt.date === date && apt.time === time);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando agenda...</p>
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
              <h1 className="text-xl font-bold text-gray-800">Mi Agenda</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewType('day')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Día
                </button>
                <button
                  onClick={() => setViewType('week')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Semana
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewType === 'week' ? navigateWeek('prev') : navigateDay('prev')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">
              {viewType === 'week' 
                ? `${format(weekStart, 'd MMM', { locale: es })} - ${format(weekEnd, 'd MMM yyyy', { locale: es })}`
                : format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
              }
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewType === 'week' ? navigateWeek('next') : navigateDay('next')}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
        </div>

        {/* Schedule Grid */}
        {viewType === 'week' ? (
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-8 border-b">
                <div className="p-4 bg-gray-50 border-r">
                  <span className="text-sm font-medium text-gray-600">Hora</span>
                </div>
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="p-4 bg-gray-50 border-r last:border-r-0 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {format(day, 'EEE', { locale: es })}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
              
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                  <div className="p-3 border-r bg-gray-50 flex items-center">
                    <span className="text-sm font-medium text-gray-600">{time}</span>
                  </div>
                  {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const appointment = getAppointmentForTime(dayStr, time);
                    return (
                      <div key={`${dayStr}-${time}`} className="p-2 border-r last:border-r-0 min-h-[60px]">
                        {appointment && (
                          <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 h-full">
                            <div className="text-xs font-medium text-blue-800">
                              Paciente #{appointment.userId}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {appointment.reason || 'Consulta'}
                            </div>
                            <Badge size="sm" className="mt-1 text-xs">
                              {appointment.status === 'confirmed' ? 'Confirmada' : appointment.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {timeSlots.map((time) => {
              const dayStr = format(currentDate, 'yyyy-MM-dd');
              const appointment = getAppointmentForTime(dayStr, time);
              return (
                <Card key={time} className={appointment ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-lg">{time}</span>
                        </div>
                        {appointment ? (
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">Paciente #{appointment.userId}</p>
                              <p className="text-sm text-gray-600">{appointment.reason || 'Consulta general'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Disponible</span>
                        )}
                      </div>
                      {appointment && (
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'default' :
                          appointment.status === 'attended' ? 'secondary' :
                          'destructive'
                        }>
                          {appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'attended' ? 'Atendida' :
                           appointment.status === 'no-show' ? 'No vino' : 'Cancelada'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}