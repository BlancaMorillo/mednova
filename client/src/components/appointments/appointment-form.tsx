import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stethoscope, UserRound, Calendar, Clock, MessageSquare, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// Helper function to format time to AM/PM format
const formatTimeWithAMPM = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

const appointmentSchema = z.object({
  specialtyId: z.string().min(1, "Debe seleccionar una especialidad"),
  doctorId: z.string().min(1, "Debe seleccionar un doctor"),
  date: z.string().min(1, "Debe seleccionar una fecha"),
  time: z.string().min(1, "Debe seleccionar una hora"),
  reason: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  onAppointmentCreated: (appointment: any) => void;
  onDoctorSelect?: (doctorId: number) => void;
}

export default function AppointmentForm({ onAppointmentCreated, onDoctorSelect }: AppointmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      specialtyId: "",
      doctorId: "",
      date: "",
      time: "",
      reason: "",
    },
  });

  // Fetch specialties
  const { data: specialties, isLoading: loadingSpecialties } = useQuery({
    queryKey: ['/api/specialties'],
  });

  // Fetch doctors by specialty
  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['/api/doctors/specialty', selectedSpecialtyId],
    queryFn: () => selectedSpecialtyId ? api.getDoctorsBySpecialty(parseInt(selectedSpecialtyId)) : [],
    enabled: !!selectedSpecialtyId,
  });

  // Fetch availability
  const { data: availability, isLoading: loadingAvailability } = useQuery({
    queryKey: ['/api/availability', selectedDoctorId, selectedDate],
    queryFn: () => selectedDoctorId && selectedDate ? api.getAvailability(parseInt(selectedDoctorId), selectedDate) : { timeSlots: [] },
    enabled: !!selectedDoctorId && !!selectedDate,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => api.createAppointment(data),
    onSuccess: (response) => {
      response.json().then((appointment) => {
        toast({
          title: "¡Cita Confirmada!",
          description: "Tu cita médica ha sido programada exitosamente.",
        });
        
        onAppointmentCreated(appointment);
        form.reset();
        setSelectedSpecialtyId("");
        setSelectedDoctorId("");
        setSelectedDate("");
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/availability'] });
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cita. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    createAppointmentMutation.mutate({
      userId: 1, // Default user ID
      specialtyId: parseInt(data.specialtyId),
      doctorId: parseInt(data.doctorId),
      date: data.date,
      time: data.time,
      reason: data.reason,
      status: "confirmed",
    });
  };

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    if (selectedSpecialtyId !== form.getValues("specialtyId")) {
      form.setValue("doctorId", "");
      setSelectedDoctorId("");
    }
  }, [selectedSpecialtyId, form]);

  useEffect(() => {
    if (selectedDoctorId !== form.getValues("doctorId")) {
      form.setValue("time", "");
    }
  }, [selectedDoctorId, selectedDate, form]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">
          Información de la Cita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="specialtyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700 flex items-center">
                    <Stethoscope className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                    Especialidad Médica
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedSpecialtyId(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="input-large border-2 focus:border-[hsl(207,90%,54%)]">
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingSpecialties ? (
                        <SelectItem value="loading">Cargando...</SelectItem>
                      ) : Array.isArray(specialties) && specialties.length > 0 ? (
                        specialties.map((specialty: any) => (
                          <SelectItem key={specialty.id} value={specialty.id.toString()}>
                            {specialty.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-specialties" disabled>No hay especialidades disponibles</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700 flex items-center">
                    <UserRound className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                    Doctor Disponible
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDoctorId(value);
                      onDoctorSelect && onDoctorSelect(parseInt(value)); // Notify parent component
                    }} 
                    value={field.value}
                    disabled={!selectedSpecialtyId}
                  >
                    <FormControl>
                      <SelectTrigger className="input-large border-2 focus:border-[hsl(207,90%,54%)]">
                        <SelectValue placeholder={selectedSpecialtyId ? "Selecciona un doctor" : "Primero selecciona una especialidad"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingDoctors ? (
                        <SelectItem value="loading">Cargando...</SelectItem>
                      ) : Array.isArray(doctors) && doctors.length > 0 ? (
                        doctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-doctors" disabled>No hay doctores disponibles</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-gray-700 flex items-center">
                      <Calendar className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                      Fecha
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="input-large border-2 focus:border-[hsl(207,90%,54%)]"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setSelectedDate(e.target.value);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium text-gray-700 flex items-center">
                      <Clock className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                      Hora
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDoctorId || !selectedDate}>
                      <FormControl>
                        <SelectTrigger className="input-large border-2 focus:border-[hsl(207,90%,54%)]">
                          <SelectValue placeholder="Selecciona horario" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingAvailability ? (
                          <SelectItem value="loading">Cargando...</SelectItem>
                        ) : availability?.timeSlots && availability.timeSlots.length > 0 ? (
                          availability.timeSlots.map((slot: string) => (
                            <SelectItem key={slot} value={slot}>
                              {slot === "08:00" ? "08:00 AM" :
                               slot === "08:30" ? "08:30 AM" :
                               slot === "09:00" ? "09:00 AM" :
                               slot === "09:30" ? "09:30 AM" :
                               slot === "10:00" ? "10:00 AM" :
                               slot === "10:30" ? "10:30 AM" :
                               slot === "11:00" ? "11:00 AM" :
                               slot === "11:30" ? "11:30 AM" :
                               slot === "14:00" ? "02:00 PM" :
                               slot === "14:30" ? "02:30 PM" :
                               slot === "15:00" ? "03:00 PM" :
                               slot === "15:30" ? "03:30 PM" :
                               slot === "16:00" ? "04:00 PM" :
                               slot === "16:30" ? "04:30 PM" : 
                               formatTimeWithAMPM(slot)}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-slots" disabled>No hay horarios disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-medium text-gray-700 flex items-center">
                    <MessageSquare className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                    Motivo de la Consulta (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      className="input-large border-2 focus:border-[hsl(207,90%,54%)] resize-none"
                      placeholder="Describe brevemente el motivo de tu consulta..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                type="submit" 
                className="flex-1 institutional-primary btn-large"
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5 mr-2" />
                    Confirmar Cita
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                className="flex-1 sm:flex-none btn-large"
                onClick={() => form.reset()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
