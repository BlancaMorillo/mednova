import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  CalendarCheck, 
  FileText, 
  HelpCircle, 
  Settings, 
  Heart 
} from "lucide-react";

const navigation = [
  { name: "Nueva Cita", href: "/", icon: Calendar, current: true },
  { name: "Mis Citas", href: "/appointments", icon: CalendarCheck, current: false },
  { name: "Historial Médico", href: "/medical-history", icon: FileText, current: false },
  { name: "Ayuda", href: "/help", icon: HelpCircle, current: false },
  { name: "Configuración", href: "/settings", icon: Settings, current: false },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 institutional-primary rounded-lg flex items-center justify-center">
            <Heart className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">MedNova</h1>
            <p className="text-sm text-gray-600">Caja del Seguro Social</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors cursor-pointer ${
                isActive 
                  ? "institutional-light"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
                <Icon className="w-6 h-6" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
