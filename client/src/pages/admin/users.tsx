import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Users, Search, Filter, ArrowLeft, 
  Edit, Trash2, Eye, Plus, UserCheck, 
  UserX, Stethoscope, Shield
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Mock users data - in real app would come from API
  const mockUsers = [
    { id: 1, username: "maria.gonzalez", fullName: "María González", role: "patient", socialSecurityId: "8-123-456", email: "maria@example.com", phone: "6000-0000", isActive: true, createdAt: "2024-01-15" },
    { id: 2, username: "carlos.martinez", fullName: "Dr. Carlos Martínez", role: "doctor", socialSecurityId: "8-111-111", email: "carlos@example.com", phone: "6111-1111", isActive: true, createdAt: "2024-01-10" },
    { id: 3, username: "ana.rodriguez", fullName: "Dra. Ana Rodríguez", role: "doctor", socialSecurityId: "8-222-222", email: "ana@example.com", phone: "6222-2222", isActive: true, createdAt: "2024-01-12" },
    { id: 4, username: "miguel.lopez", fullName: "Dr. Miguel López", role: "doctor", socialSecurityId: "8-333-333", email: "miguel@example.com", phone: "6333-3333", isActive: true, createdAt: "2024-01-08" },
    { id: 5, username: "laura.garcia", fullName: "Dra. Laura García", role: "doctor", socialSecurityId: "8-444-444", email: "laura@example.com", phone: "6444-4444", isActive: false, createdAt: "2024-01-05" },
    { id: 6, username: "jose.fernandez", fullName: "Dr. José Fernández", role: "doctor", socialSecurityId: "8-555-555", email: "jose@example.com", phone: "6555-5555", isActive: true, createdAt: "2024-01-14" },
    { id: 7, username: "carmen.silva", fullName: "Dra. Carmen Silva", role: "doctor", socialSecurityId: "8-666-666", email: "carmen@example.com", phone: "6666-6666", isActive: true, createdAt: "2024-01-11" },
    { id: 8, username: "admin", fullName: "Administrador Sistema", role: "admin", socialSecurityId: "8-999-999", email: "admin@mednova.gov.pa", phone: "6999-9999", isActive: true, createdAt: "2024-01-01" },
    { id: 9, username: "pedro.santos", fullName: "Pedro Santos", role: "patient", socialSecurityId: "8-777-777", email: "pedro@example.com", phone: "6777-7777", isActive: true, createdAt: "2024-01-20" },
    { id: 10, username: "lucia.morales", fullName: "Lucía Morales", role: "patient", socialSecurityId: "8-888-888", email: "lucia@example.com", phone: "6888-8888", isActive: false, createdAt: "2024-01-18" }
  ];

  const users = mockUsers;

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = searchTerm === "" || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.socialSecurityId.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return <Stethoscope className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "doctor":
        return "Doctor";
      case "admin":
        return "Administrador";
      default:
        return "Paciente";
    }
  };

  const toggleUserStatus = (userId: number) => {
    // In real app, would call API to toggle user status
    toast({
      title: "Estado actualizado",
      description: "El estado del usuario ha sido actualizado correctamente"
    });
  };

  const deleteUser = (userId: number) => {
    // In real app, would call API to delete user
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema",
      variant: "destructive"
    });
  };

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const patients = users.filter(u => u.role === "patient").length;
  const doctors = users.filter(u => u.role === "doctor").length;
  const admins = users.filter(u => u.role === "admin").length;

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
              <h1 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input id="fullName" placeholder="Nombre completo del usuario" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input id="username" placeholder="nombre.usuario" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="socialSecurityId">Cédula</Label>
                      <Input id="socialSecurityId" placeholder="8-123-456" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="usuario@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" placeholder="6000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">Paciente</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => {
                        toast({
                          title: "Usuario creado",
                          description: "El nuevo usuario ha sido creado exitosamente"
                        });
                        setIsAddUserOpen(false);
                      }}>
                        Crear Usuario
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{patients}</div>
              <div className="text-sm text-gray-600">Pacientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{doctors}</div>
              <div className="text-sm text-gray-600">Doctores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{admins}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros de Búsqueda</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, usuario, cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="patient">Pacientes</SelectItem>
                  <SelectItem value="doctor">Doctores</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Mostrando {filteredUsers.length} de {totalUsers} usuarios
          </p>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Lista de Usuarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre Completo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Rol</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Cédula</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Contacto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">@{user.username}</div>
                          <div className="text-xs text-gray-500">ID: {user.id}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{user.fullName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(user.role)}
                            <span className="text-sm">{getRoleName(user.role)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">{user.socialSecurityId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" title="Ver detalles">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" title="Editar">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => toggleUserStatus(user.id)}
                              title={user.isActive ? "Desactivar" : "Activar"}
                            >
                              {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteUser(user.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}