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

      {/* Footer Sobrio */}
      <footer className="border-t border-white/[0.05] py-4 px-6 text-center text-xs text-slate-500 bg-[#0a0b10]">
        <span>CHUMPATIN ® · SENIOR SEND-OFF PROMO 2026 · 10/10/2026 · Eventos Kaizen</span>
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
