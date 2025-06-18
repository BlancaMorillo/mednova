import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Smartphone } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    reminders: true,
  });

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

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
          title="Configuración"
          subtitle="Personaliza tu experiencia en MedNova"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Mobile title */}
            <div className="lg:hidden mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuración</h2>
              <p className="text-gray-600">Personaliza tu experiencia en MedNova</p>
            </div>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <User className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-lg font-medium">Nombre Completo</Label>
                    <Input id="fullName" defaultValue="María González" className="input-large" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialSecurity" className="text-lg font-medium">Cédula</Label>
                    <Input id="socialSecurity" defaultValue="8-123-456" className="input-large" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg font-medium">Correo Electrónico</Label>
                    <Input id="email" type="email" defaultValue="maria.gonzalez@email.com" className="input-large" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-lg font-medium">Teléfono</Label>
                    <Input id="phone" defaultValue="+507 6123-4567" className="input-large" />
                  </div>
                </div>
                <Button className="institutional-primary">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <Bell className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="email-notifications" className="text-lg font-medium">
                        Notificaciones por Email
                      </Label>
                      <p className="text-sm text-gray-600">
                        Recibe recordatorios de citas por correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={() => handleNotificationChange('email')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="sms-notifications" className="text-lg font-medium">
                        Notificaciones por SMS
                      </Label>
                      <p className="text-sm text-gray-600">
                        Recibe mensajes de texto con recordatorios
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms}
                      onCheckedChange={() => handleNotificationChange('sms')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="push-notifications" className="text-lg font-medium">
                        Notificaciones Push
                      </Label>
                      <p className="text-sm text-gray-600">
                        Recibe notificaciones en tu dispositivo
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications.push}
                      onCheckedChange={() => handleNotificationChange('push')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="appointment-reminders" className="text-lg font-medium">
                        Recordatorios de Citas
                      </Label>
                      <p className="text-sm text-gray-600">
                        Recibe recordatorios 24 horas antes de tu cita
                      </p>
                    </div>
                    <Switch
                      id="appointment-reminders"
                      checked={notifications.reminders}
                      onCheckedChange={() => handleNotificationChange('reminders')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <Shield className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start text-lg">
                    Cambiar Contraseña
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg">
                    Configurar Autenticación de Dos Factores
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg">
                    Ver Sesiones Activas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Accessibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <Palette className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Accesibilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-lg font-medium">Texto Grande</Label>
                      <p className="text-sm text-gray-600">
                        Aumenta el tamaño del texto para mejor legibilidad
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-lg font-medium">Alto Contraste</Label>
                      <p className="text-sm text-gray-600">
                        Mejora la visibilidad con mayor contraste
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-lg font-medium">Modo Oscuro</Label>
                      <p className="text-sm text-gray-600">
                        Cambia a un tema oscuro para reducir la fatiga visual
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-semibold text-gray-800">
                  <Smartphone className="w-5 h-5 text-[hsl(207,90%,54%)] mr-2" />
                  Configuración de la Aplicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start text-lg">
                    Limpiar Caché
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg">
                    Exportar Datos
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-lg text-red-600 border-red-200 hover:bg-red-50">
                    Cerrar Sesión
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
