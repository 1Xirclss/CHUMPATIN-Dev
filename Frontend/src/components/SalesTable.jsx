import React from "react";
import confetti from "canvas-confetti";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineSparkles,
} from "react-icons/hi";

export const SalesTable = ({
  sales,
  onEdit,
  onDelete,
  onToggleStatus,
  onDeliverWristband,
  loading,
}) => {
  const triggerWristbandCelebration = (e, sale) => {
    e.stopPropagation();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#00f2fe", "#10b981", "#ffffff"],
    });
    onDeliverWristband(sale);
  };

  if (loading) {
    return (
      <div className="party-card p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Cargando lista de asistentes y ventas...</p>
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="party-card p-12 text-center text-slate-400 border-dashed border-white/10">
        <p className="text-base font-semibold text-slate-300">No se encontraron ventas</p>
        <p className="text-xs text-slate-500 mt-1">
          Intenta ajustar los términos de búsqueda o registra un nuevo asistente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista de Tarjetas para Móviles (Pantallas pequeñas < 768px) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sales.map((sale) => {
          const isPaid = sale.paymentStatus === "CANCELADO";
          const isDelivered = sale.wristbandDelivered;

          return (
            <div
              key={sale._id}
              className="party-card p-4 border border-white/[0.08] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-bold text-cyan-400 text-xs bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                    #{sale.ticketNumber}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-base leading-tight">
                      {sale.customerName}
                    </h4>
                    {sale.phone && (
                      <span className="text-xs text-slate-400 font-mono-code">
                        {sale.phone}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-base font-black font-mono-code text-white">
                  ${Number(sale.amount).toFixed(2)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                {sale.schoolPromo && (
                  <span className="text-[11px] text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/25">
                    {sale.schoolPromo}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                  {sale.ticketType}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  {sale.paymentMethod === "TRANSFERENCIA" ? (
                    <>
                      <HiOutlineCreditCard className="w-3 h-3" />
                      Transferencia
                    </>
                  ) : (
                    <>
                      <HiOutlineCash className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Efectivo</span>
                    </>
                  )}
                </span>
              </div>

              {/* Botones de Acción Móvil */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] gap-2">
                <button
                  onClick={() => onToggleStatus(sale._id)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    isPaid ? "badge-cancelado" : "badge-pendiente"
                  }`}
                >
                  {isPaid ? "CANCELADO" : "PENDIENTE"}
                </button>

                <div className="flex items-center gap-2">
                  {isDelivered ? (
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                      Pulsera OK
                    </span>
                  ) : (
                    <button
                      onClick={(e) => triggerWristbandCelebration(e, sale)}
                      disabled={!isPaid}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        isPaid
                          ? "bg-cyan-500 text-black shadow-sm"
                          : "bg-white/5 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      Pulsera
                    </button>
                  )}

                  <button
                    onClick={() => onEdit(sale)}
                    className="p-1.5 text-slate-400 hover:text-white bg-[#141724] rounded-lg border border-white/5"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(sale)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 bg-[#141724] rounded-lg border border-white/5"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista de Tabla para Tablets y Desktop (>= 768px) */}
      <div className="hidden md:block party-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0c0e16] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3.5 px-4"># Ticket</th>
                <th className="py-3.5 px-4">Asistente</th>
                <th className="py-3.5 px-4">Colegio / Promo</th>
                <th className="py-3.5 px-4">Entrada</th>
                <th className="py-3.5 px-4">Método</th>
                <th className="py-3.5 px-4">Monto</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Puerta</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-sm">
              {sales.map((sale) => {
                const isPaid = sale.paymentStatus === "CANCELADO";
                const isDelivered = sale.wristbandDelivered;

                return (
                  <tr key={sale._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono-code font-bold text-cyan-400">
                      #{sale.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{sale.customerName}</div>
                      {sale.phone && (
                        <div className="text-xs text-slate-400 font-mono-code">{sale.phone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {sale.schoolPromo ? (
                        <span className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                          {sale.schoolPromo}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {sale.ticketType || "Promo 2026 ($15)"}
                    </td>
                    <td className="py-3.5 px-4">
                      {sale.paymentMethod === "TRANSFERENCIA" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                          <HiOutlineCreditCard className="w-3.5 h-3.5" />
                          Transferencia
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          <HiOutlineCash className="w-3.5 h-3.5" />
                          Efectivo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono-code font-bold text-white">
                      ${Number(sale.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onToggleStatus(sale._id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                          isPaid ? "badge-cancelado hover:bg-emerald-500/25" : "badge-pendiente hover:bg-amber-500/25"
                        }`}
                      >
                        {isPaid ? "CANCELADO" : "PENDIENTE"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                          <HiOutlineSparkles className="w-3.5 h-3.5 text-cyan-400" />
                          Entregada
                        </span>
                      ) : (
                        <button
                          onClick={(e) => triggerWristbandCelebration(e, sale)}
                          disabled={!isPaid}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            isPaid
                              ? "bg-[#181b28] text-white hover:bg-cyan-500 hover:text-black border border-white/10"
                              : "bg-white/[0.03] text-slate-500 border border-white/[0.05] cursor-not-allowed"
                          }`}
                        >
                          Entregar Pulsera
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onEdit(sale)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10 cursor-pointer"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(sale)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 cursor-pointer"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
