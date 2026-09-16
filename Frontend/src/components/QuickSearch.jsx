import React from "react";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";

export const QuickSearch = ({
  search,
  setSearch,
  categoryFilter = "",
  setCategoryFilter = () => {},
  paymentMethodFilter,
  setPaymentMethodFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  wristbandFilter,
  setWristbandFilter,
  totalResults,
}) => {
  return (
    <div className="space-y-3">
      {/* Barra Principal de Búsqueda */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, colegio, teléfono o # de ticket..."
          className="input-with-icon pr-10 text-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <HiOutlineX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros Rápidos (Píldoras) */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Filtro Tipo: Promo vs General */}
        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mr-1">
          Tipo:
        </span>
        <button
          onClick={() => setCategoryFilter("")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            categoryFilter === ""
              ? "bg-white text-black font-bold border-white"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-white/20"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setCategoryFilter("PROMO")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            categoryFilter === "PROMO"
              ? "bg-purple-600 text-white font-bold border-purple-500 shadow-sm shadow-purple-600/30"
              : "bg-[#141722] text-purple-300 border-purple-500/30 hover:border-purple-500/60"
          }`}
        >
          🎓 Promo 2026
        </button>
        <button
          onClick={() => setCategoryFilter("GENERAL")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            categoryFilter === "GENERAL"
              ? "bg-cyan-500 text-black font-bold border-cyan-400 shadow-sm shadow-cyan-500/30"
              : "bg-[#141722] text-cyan-300 border-cyan-500/30 hover:border-cyan-500/60"
          }`}
        >
          👥 General
        </button>

        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider ml-2 mr-1">
          Método:
        </span>
        <button
          onClick={() => setPaymentMethodFilter("")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentMethodFilter === ""
              ? "bg-white text-black font-bold border-white"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-white/20"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setPaymentMethodFilter("TRANSFERENCIA")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentMethodFilter === "TRANSFERENCIA"
              ? "bg-cyan-500 text-black font-bold border-cyan-500"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-cyan-500/40"
          }`}
        >
          Transferencia
        </button>
        <button
          onClick={() => setPaymentMethodFilter("EFECTIVO")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentMethodFilter === "EFECTIVO"
              ? "bg-emerald-500 text-black font-bold border-emerald-500"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-emerald-500/40"
          }`}
        >
          Efectivo
        </button>

        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider ml-2 mr-1">
          Estado:
        </span>
        <button
          onClick={() => setPaymentStatusFilter("")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentStatusFilter === ""
              ? "bg-white text-black font-bold border-white"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-white/20"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setPaymentStatusFilter("CANCELADO")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentStatusFilter === "CANCELADO"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-emerald-500/30"
          }`}
        >
          Pagado (Cancelado)
        </button>
        <button
          onClick={() => setPaymentStatusFilter("PENDIENTE")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            paymentStatusFilter === "PENDIENTE"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-amber-500/30"
          }`}
        >
          Pendiente
        </button>

        <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider ml-2 mr-1">
          Puerta:
        </span>
        <button
          onClick={() => setWristbandFilter("")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            wristbandFilter === ""
              ? "bg-white text-black font-bold border-white"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-white/20"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setWristbandFilter("false")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            wristbandFilter === "false"
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-amber-500/30"
          }`}
        >
          Pulsera Pendiente
        </button>
        <button
          onClick={() => setWristbandFilter("true")}
          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            wristbandFilter === "true"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
              : "bg-[#141722] text-slate-300 border-white/[0.08] hover:border-cyan-500/30"
          }`}
        >
          Pulsera Entregada
        </button>

        {totalResults !== undefined && (
          <div className="ml-auto text-xs text-slate-400 font-mono-code">
            Mostrando: <strong className="text-white">{totalResults}</strong> personas
          </div>
        )}
      </div>
    </div>
  );
};
