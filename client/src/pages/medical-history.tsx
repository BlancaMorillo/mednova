import { useState } from "react";
import { FileText, Download, Eye } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MedicalHistory() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          title="Historial Médico"
          subtitle="Consulta tu historial y documentos médicos"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Mobile title */}
            <div className="lg:hidden mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Historial Médico</h2>
              <p className="text-gray-600">Consulta tu historial y documentos médicos</p>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Historial Médico
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta sección estará disponible próximamente. Aquí podrás consultar tu historial médico completo, resultados de exámenes y documentos relacionados.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="institutional-primary" disabled>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                  <Button variant="outline" disabled>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Documentos
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
