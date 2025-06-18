import { Link } from "wouter";
import { 
  Calendar, 
  CalendarCheck, 
  FileText, 
  HelpCircle, 
  Settings, 
  Heart,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Nueva Cita", href: "/", icon: Calendar },
  { name: "Mis Citas", href: "/appointments", icon: CalendarCheck },
  { name: "Historial Médico", href: "/medical-history", icon: FileText },
  { name: "Ayuda", href: "/help", icon: HelpCircle },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 institutional-primary rounded-lg flex items-center justify-center">
                <Heart className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">MedNova</h1>
                <p className="text-sm text-gray-600">Caja del Seguro Social</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a 
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={onClose}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
