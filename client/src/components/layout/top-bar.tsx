import { Menu, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
  onMobileMenuToggle: () => void;
  title: string;
  subtitle?: string;
}

export default function TopBar({ onMobileMenuToggle, title, subtitle }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </Button>
          
          <div className="lg:hidden flex items-center space-x-2">
            <div className="w-8 h-8 institutional-primary rounded-lg flex items-center justify-center">
              <Heart className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-gray-800">MedNova</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="font-medium text-gray-800">{user?.fullName}</p>
            <p className="text-sm text-gray-600">ID: {user?.socialSecurityId}</p>
          </div>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 w-5 h-5" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
          <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}
