import React, { useState, useEffect } from "react";
import { api } from "../api/apiClient";
import { StatCard } from "../components/StatCard";
import { ImportExcelModal } from "../components/ImportExcelModal";
import {
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlineDocumentDownload,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
} from "react-icons/hi";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

export const DashboardPage = ({ onOpenSaleModal }) => {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, settingsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getSettings(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (error) {
      console.error("Error al cargar datos de MongoDB:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Escuchar actualizaciones en tiempo real
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener("sale_updated", handleUpdate);
    window.addEventListener("settings_updated", handleUpdate);

    return () => {
      window.removeEventListener("sale_updated", handleUpdate);
      window.removeEventListener("settings_updated", handleUpdate);
    };
  }, []);

  const [importModalOpen, setImportModalOpen] = useState(false);

  const paymentData = [
    { name: "Efectivo", value: stats?.cashMoney || 0, color: "#10b981" },
    { name: "Transferencias", value: stats?.transferMoney || 0, color: "#00f2fe" },
  ];

  const maxCapacity = settings?.maxCapacity || 400;
  const capacityPercent = Math.min(100, Math.round(((stats?.totalTicketsCount || 0) / maxCapacity) * 100));

  return (
    <div className="space-y-6 pb-12">
      {/* Banner del Evento (Cargado desde MongoDB) */}
      <div className="party-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-[#101320] via-[#141829] to-[#0c0e16] border border-cyan-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>{settings?.eventDate || "10/10/2026"} · {settings?.eventTime || "7:00 PM – 12:00 AM"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-white tracking-tight">
              {settings?.eventName || "CHUMPATIN XXL · SENIOR SEND-OFF"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2 font-medium">
              <span className="flex items-center gap-1.5 text-slate-400">
                <HiOutlineLocationMarker className="w-4 h-4 text-cyan-400" />
                {settings?.venueName || "Eventos Kaizen"}, {settings?.venueAddress?.split(",")[2] || "Santa Tecla"}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <HiOutlineSparkles className="w-4 h-4 text-purple-400" />
                {settings?.experiences?.join(" · ") || "DJ · Toro Mecánico · Tiburón XXL · Pirotecnia"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setImportModalOpen(true)}
              className="btn-secondary text-xs"
              title="Seleccionar y subir archivo Excel desde mi PC"
            >
              <HiOutlineDocumentDownload className="w-4 h-4 text-cyan-400" />
              <span>Importar Excel</span>
            </button>
            <button
              onClick={() => onOpenSaleModal()}
              className="btn-neon text-xs font-bold"
            >
              <HiOutlinePlus className="w-4 h-4" />
              <span>Registrar Venta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas Métricas (Cálculo directo en MongoDB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recaudado (BD)"
          value={`$${Number(stats?.totalMoney || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={`${stats?.paidSalesCount || 0} ventas pagadas`}
          icon={HiOutlineCash}
          color="cyan"
          trend={{
            label: `Aforo (${maxCapacity})`,
            value: `${capacityPercent}% cubierto`,
          }}
        />

        <StatCard
          title="Cobrado en Efectivo"
          value={`$${Number(stats?.cashMoney || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle="Dinero físico en caja"
          icon={HiOutlineCash}
          color="green"
          trend={{
            label: "% del Total",
            value: stats?.totalMoney ? `${Math.round(((stats.cashMoney || 0) / stats.totalMoney) * 100)}%` : "0%",
          }}
        />

        <StatCard
          title="Cobrado en Transferencia"
          value={`$${Number(stats?.transferMoney || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          subtitle={settings?.bankTransferInfo?.bankName || "Bancos y Billeteras"}
          icon={HiOutlineCreditCard}
          color="cyan"
          trend={{
            label: "% del Total",
            value: stats?.totalMoney ? `${Math.round(((stats.transferMoney || 0) / stats.totalMoney) * 100)}%` : "0%",
          }}
        />

        <StatCard
          title="Control de Pulseras"
          value={`${stats?.wristbandsDelivered || 0} / ${stats?.totalTicketsCount || 0}`}
          subtitle={`${stats?.wristbandsPending || 0} pendientes de entrar`}
          icon={HiOutlineShieldCheck}
          color="purple"
          trend={{
            label: "Ingresados en Kaizen",
            value: `${stats?.totalTicketsCount ? Math.round(((stats.wristbandsDelivered || 0) / stats.totalTicketsCount) * 100) : 0}%`,
          }}
        />
      </div>

      {/* Gráfico y Tarifas Dinámicas leídas de la Base de Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Recharts de Métodos de Pago */}
        <div className="party-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-white mb-1">
              Desglose de Liquidación
            </h3>
            <p className="text-xs text-slate-400">
              Efectivo físico vs Transferencias bancarias
            </p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#07080c" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Total"]}
                  contentStyle={{ backgroundColor: "#0f1118", borderColor: "#232738", borderRadius: "10px" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.06] text-center">
            <div className="p-2.5 bg-[#141724] rounded-xl">
              <span className="text-[11px] text-slate-400 block">Efectivo</span>
              <span className="text-sm font-bold font-mono-code text-emerald-400">
                ${Number(stats?.cashMoney || 0).toFixed(2)}
              </span>
            </div>
            <div className="p-2.5 bg-[#141724] rounded-xl">
              <span className="text-[11px] text-slate-400 block">Transferencia</span>
              <span className="text-sm font-bold font-mono-code text-cyan-400">
                ${Number(stats?.transferMoney || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Tarifas Oficiales Dinámicas desde MongoDB */}
        <div className="party-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold font-heading text-white">
                Tarifas Oficiales de Entrada (MongoDB)
              </h3>
              <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                {settings?.eventName?.split("·")[1]?.trim() || "SENIOR SEND-OFF"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Valores configurados en la base de datos para preventa y puerta
            </p>
          </div>

          {/* Tarjetas Dinámicas de Boletos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings?.ticketTiers && settings.ticketTiers.length > 0 ? (
              settings.ticketTiers.map((tier) => (
                <div
                  key={tier.id || tier.name}
                  className="p-4 bg-[#141724] rounded-xl border border-white/[0.06] hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      {tier.name}
                    </span>
                    {tier.target && (
                      <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-bold px-2 py-0.5 rounded">
                        {tier.target}
                      </span>
                    )}
                  </div>
                  {tier.description && (
                    <p className="text-[11px] text-slate-400 mb-2">{tier.description}</p>
                  )}
                  <div className="flex items-baseline justify-between pt-3 border-t border-white/[0.05]">
                    <span className="text-xs text-slate-400">Precio Unitario</span>
                    <span className="text-2xl font-bold font-mono-code text-white">
                      ${tier.price}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-4 text-center text-slate-500 text-xs">
                Cargando tarifas de MongoDB...
              </div>
            )}
          </div>

          {/* Medidas de Seguridad */}
          <div className="mt-5 p-4 bg-black/40 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <HiOutlineShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Seguridad del Evento:</strong> {settings?.securityInfo || "Papás y adultos responsables presentes durante el evento."}
              </span>
            </div>
            <span className="text-cyan-400 font-mono-code shrink-0">
              Aforo Máximo: {maxCapacity} personas
            </span>
          </div>
        </div>
      </div>
      {/* Modal para Seleccionar Archivo Excel desde la PC */}
      <ImportExcelModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={fetchDashboardData}
      />
    </div>
  );
};
