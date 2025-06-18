import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  socialSecurityId: string;
  email?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth
    const storedUser = localStorage.getItem("mednova_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("mednova_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Mock authentication - in real app would call API
      const mockUsers = [
        { id: 1, username: "maria.gonzalez", password: "password123", fullName: "María González", role: "patient", socialSecurityId: "8-123-456", email: "maria@example.com", phone: "6000-0000" },
        { id: 2, username: "carlos.martinez", password: "doctor123", fullName: "Dr. Carlos Martínez", role: "doctor", socialSecurityId: "8-111-111", email: "carlos@example.com", phone: "6111-1111" },
        { id: 8, username: "admin", password: "admin123", fullName: "Administrador Sistema", role: "admin", socialSecurityId: "8-999-999", email: "admin@mednova.gov.pa", phone: "6999-9999" }
      ];
      
      const foundUser = mockUsers.find(u => u.username === username && u.password === password);
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("mednova_user", JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mednova_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}