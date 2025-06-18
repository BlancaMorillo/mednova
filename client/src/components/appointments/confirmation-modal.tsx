import { Check, Calendar, User, Clock, Stethoscope } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    specialty: string;
    doctor: string;
    date: string;
    time: string;
  } | null;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  appointment 
}: ConfirmationModalProps) {
  if (!appointment) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center p-6">
          <div className="w-16 h-16 success-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white w-8 h-8" />
          </div>
          
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              ¡Cita Confirmada!
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Tu cita médica ha sido programada exitosamente.
            </p>
          </DialogHeader>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Especialidad:
                </span>
                <span className="font-medium">{appointment.specialty}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Doctor:
                </span>
                <span className="font-medium">{appointment.doctor}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fecha:
                </span>
                <span className="font-medium">{formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Hora:
                </span>
                <span className="font-medium">{formatTime(appointment.time)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 institutional-primary btn-large"
              onClick={onClose}
            >
              Aceptar
            </Button>
            <Button 
              variant="secondary"
              className="flex-1 btn-large"
              onClick={onClose}
            >
              Ver Cita
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
