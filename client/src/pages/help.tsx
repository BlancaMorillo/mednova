import { useState } from "react";
import { HelpCircle, Phone, Mail, MessageSquare, Clock } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const faqs = [
    {
      question: "¿Cómo puedo programar una cita médica?",
      answer: "Para programar una cita, ve a la sección 'Nueva Cita', selecciona la especialidad médica, el doctor disponible, la fecha y hora que prefieras. Luego confirma tu cita."
    },
    {
      question: "¿Puedo cancelar o reprogramar mi cita?",
      answer: "Sí, puedes cancelar tu cita desde la sección 'Mis Citas'. Para reprogramar, cancela la cita actual y programa una nueva. Te recomendamos hacerlo con al menos 24 horas de anticipación."
    },
    {
      question: "¿Qué documentos necesito llevar a mi cita?",
      answer: "Debes llevar tu cédula de identidad, tarjeta del Seguro Social, y cualquier resultado de examen médico previo relacionado con tu consulta."
    },
    {
      question: "¿Cómo puedo ver mis citas programadas?",
      answer: "En la sección 'Mis Citas' puedes ver todas tus citas programadas, incluyendo las próximas y el historial de citas anteriores."
    },
    {
      question: "¿Qué hago si llego tarde a mi cita?",
      answer: "Si llegas tarde, acércate a recepción. Dependiendo de la disponibilidad del doctor, podrás ser atendido o necesitarás reprogramar tu cita."
    }
  ];

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
          title="Ayuda"
          subtitle="Centro de ayuda y soporte"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mobile title */}
            <div className="lg:hidden mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ayuda</h2>
              <p className="text-gray-600">Centro de ayuda y soporte</p>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <Phone className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Contacto y Soporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-[hsl(207,90%,54%)]" />
                      <div>
                        <p className="font-medium text-gray-800">Teléfono</p>
                        <p className="text-gray-600">503-9000 (línea principal)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-[hsl(207,90%,54%)]" />
                      <div>
                        <p className="font-medium text-gray-800">Email</p>
                        <p className="text-gray-600">info@css.gob.pa</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-[hsl(207,90%,54%)]" />
                      <div>
                        <p className="font-medium text-gray-800">Horario de Atención</p>
                        <p className="text-gray-600">Lunes a Viernes: 7:00 AM - 3:00 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-[hsl(207,90%,54%)]" />
                      <div>
                        <p className="font-medium text-gray-800">Chat en Línea</p>
                        <p className="text-gray-600">Disponible 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button className="institutional-primary mr-4">
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar Ahora
                  </Button>
                  <Button variant="outline" className="border-[hsl(207,90%,54%)] text-[hsl(207,90%,54%)] hover:bg-[hsl(207,90%,97%)]">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat en Línea
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Frequently Asked Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <HelpCircle className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-lg">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-base leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <HelpCircle className="w-6 h-6 text-[hsl(207,90%,54%)]" />
                    <span>Guía de Usuario</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Phone className="w-6 h-6 text-[hsl(207,90%,54%)]" />
                    <span>Soporte Técnico</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Mail className="w-6 h-6 text-[hsl(207,90%,54%)]" />
                    <span>Contactar CSS</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
