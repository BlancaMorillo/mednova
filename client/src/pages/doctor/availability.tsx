import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Clock, Calendar as CalendarIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function DoctorAvailability() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isHoliday, setIsHoliday] = useState(false);
  const [timeSlots, setTimeSlots] = useState({
    "08:00": true, "08:30": true, "09:00": true, "09:30": true,
    "10:00": true, "10:30": true, "11:00": true, "11:30": true,
    "14:00": true, "14:30": true, "15:00": true, "15:30": true,
    "16:00": true, "16:30": true
  });

  const handleTimeSlotChange = (time: string, available: boolean) => {
    setTimeSlots(prev => ({ ...prev, [time]: available }));
  };

  const handleSaveAvailability = () => {
    if (!selectedDate) return;

    const availableSlots = Object.entries(timeSlots)
      .filter(([_, available]) => available)
      .map(([time, _]) => time);

    // In real app, would call API to save availability
    console.log({
      date: format(selectedDate, 'yyyy-MM-dd'),
      timeSlots: availableSlots,
      isHoliday,
      doctorId: user?.id
    });

    toast({
      title: "Disponibilidad actualizada",
      description: `Se guardó la disponibilidad para ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
    });
  };

  const setAllAvailable = (available: boolean) => {
    const newTimeSlots = Object.keys(timeSlots).reduce((acc, time) => {
      acc[time] = available;
      return acc;
    }, {} as typeof timeSlots);
    setTimeSlots(newTimeSlots);
  };

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
              <h1 className="text-xl font-bold text-gray-800">Gestionar Disponibilidad</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Seleccionar Fecha</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={es}
                />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Configuración del Día</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Marcar como feriado</label>
                  <Switch
                    checked={isHoliday}
                    onCheckedChange={setIsHoliday}
                  />
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllAvailable(true)}
                    className="w-full"
                  >
                    Disponible todo el día
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAllAvailable(false)}
                    className="w-full"
                  >
                    No disponible
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Slots */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Horarios Disponibles</span>
                  </div>
                  {selectedDate && (
                    <span className="text-base font-normal text-gray-600">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isHoliday ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Día marcado como feriado</p>
                    <p className="text-sm text-gray-400">No hay horarios disponibles</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {Object.entries(timeSlots).map(([time, available]) => (
                        <div
                          key={time}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            available 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <span className="font-medium">{time}</span>
                          <Switch
                            checked={available}
                            onCheckedChange={(checked) => handleTimeSlotChange(time, checked)}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => {
                        // Reset to current settings
                        setTimeSlots({
                          "08:00": true, "08:30": true, "09:00": true, "09:30": true,
                          "10:00": true, "10:30": true, "11:00": true, "11:30": true,
                          "14:00": true, "14:30": true, "15:00": true, "15:30": true,
                          "16:00": true, "16:30": true
                        });
                        setIsHoliday(false);
                      }}>
                        Restablecer
                      </Button>
                      <Button onClick={handleSaveAvailability}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Schedule Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Resumen de Horarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(timeSlots).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-green-700">Horarios disponibles</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {Object.values(timeSlots).filter(v => !v).length}
                    </div>
                    <div className="text-sm text-gray-700">Horarios bloqueados</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(Object.values(timeSlots).filter(Boolean).length * 0.5 * 100) / 100}h
                    </div>
                    <div className="text-sm text-blue-700">Horas disponibles</div>
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