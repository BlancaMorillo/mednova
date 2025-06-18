import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Patient pages
import Home from "@/pages/home";
import Appointments from "@/pages/appointments";
import MedicalHistory from "@/pages/medical-history";
import Help from "@/pages/help";
import Settings from "@/pages/settings";

// Doctor pages
import DoctorDashboard from "@/pages/doctor/dashboard";
import DoctorSchedule from "@/pages/doctor/schedule";
import DoctorAvailability from "@/pages/doctor/availability";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAppointments from "@/pages/admin/appointments";
import AdminReports from "@/pages/admin/reports";
import AdminUsers from "@/pages/admin/users";

// Auth pages
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando MedNova...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      {/* Patient routes */}
      {user.role === "patient" && (
        <>
          <Route path="/" component={Home} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/medical-history" component={MedicalHistory} />
          <Route path="/help" component={Help} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      
      {/* Doctor routes */}
      {user.role === "doctor" && (
        <>
          <Route path="/" component={DoctorDashboard} />
          <Route path="/dashboard" component={DoctorDashboard} />
          <Route path="/schedule" component={DoctorSchedule} />
          <Route path="/availability" component={DoctorAvailability} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      
      {/* Admin routes */}
      {user.role === "admin" && (
        <>
          <Route path="/" component={AdminDashboard} />
          <Route path="/dashboard" component={AdminDashboard} />
          <Route path="/appointments" component={AdminAppointments} />
          <Route path="/reports" component={AdminReports} />
          <Route path="/users" component={AdminUsers} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AuthenticatedRouter />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
