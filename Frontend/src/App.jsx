import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { SalesHistoryPage } from "./pages/SalesHistoryPage";
import { CheckInPage } from "./pages/CheckInPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { SaleModal } from "./components/SaleModal";
import { api } from "./api/apiClient";
import { Toaster, toast } from "react-hot-toast";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);

  const handleOpenSaleModal = (sale = null) => {
    setSaleToEdit(sale);
    setSaleModalOpen(true);
  };

  const handleSaveSale = async (formData) => {
    try {
      if (saleToEdit) {
        const res = await api.updateSale(saleToEdit._id, formData);
        toast.success(res.message || "Venta actualizada");
      } else {
        const res = await api.createSale(formData);
        toast.success(res.message || "¡Venta registrada con éxito!");
      }
      // Pequeño delay y recarga si es necesario
      window.dispatchEvent(new CustomEvent("sale_updated"));
    } catch (error) {
      toast.error(error.message || "Error al procesar la venta");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen party-glow-bg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono-code text-cyan-400 tracking-widest uppercase">
            CHUMPATIN XXL · CARGANDO SISTEMA
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen party-glow-bg flex flex-col text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<DashboardPage onOpenSaleModal={handleOpenSaleModal} />} />
          <Route path="/ventas" element={<SalesHistoryPage onOpenSaleModal={handleOpenSaleModal} />} />
          <Route path="/puerta" element={<CheckInPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Marco Dev */}
      <footer className="border-t border-white/[0.05] py-4 px-6 text-center text-xs text-slate-400 bg-[#0a0b10] flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>© 2026 CHUMPATIN ® · SENIOR SEND-OFF PROMO 2026</span>
        <span className="hidden sm:inline text-slate-600">·</span>
        <span className="flex items-center gap-1.5 flex-wrap justify-center">
          Desarrollado y Diseñado por
          <a
            href="https://github.com/1Xirclss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/40 hover:decoration-cyan-400 transition-colors inline-flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20"
            title="Ver perfil de GitHub de Marco Dev (1Xirclss)"
          >
            <svg className="w-3.5 h-3.5 inline text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Marco Dev (Marco Alejandro)
          </a>
          <span>· Derechos Reservados</span>
        </span>
      </footer>

      {/* Modal Global de Venta / Edición */}
      <SaleModal
        isOpen={saleModalOpen}
        onClose={() => {
          setSaleModalOpen(false);
          setSaleToEdit(null);
        }}
        onSave={handleSaveSale}
        saleToEdit={saleToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#161824",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 500,
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
