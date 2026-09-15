import React, { useState, useEffect } from "react";
import { api } from "../api/apiClient";
import confetti from "canvas-confetti";
import {
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineSparkles,
} from "react-icons/hi";
import toast from "react-hot-toast";

export const CheckInPage = () => {
  const [search, setSearch] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [stats, setStats] = useState({ delivered: 0, total: 0 });

  const searchAttendees = async (query = "") => {
    try {
      setLoading(true);
      const res = await api.getSales({
        search: query,
        limit: query ? 50 : 20,
        sortBy: "wristbandDelivered",
        sortOrder: "asc",
      });
      if (res.success) {
        setAttendees(res.data);
      }
    } catch (error) {
      console.error("Error al buscar en puerta:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats({
          delivered: res.stats.wristbandsDelivered,
          total: res.stats.totalTicketsCount,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
    searchAttendees("");

    const handleUpdate = () => {
      loadStats();
      searchAttendees(search);
    };
    window.addEventListener("sale_updated", handleUpdate);

    return () => {
      window.removeEventListener("sale_updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAttendees(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeliver = async (attendee) => {
    if (attendee.paymentStatus !== "CANCELADO") {
      toast.error("No se puede entregar pulsera: el boleto aún no ha sido pagado.");
      return;
    }

    try {
      const res = await api.deliverWristband(attendee._id);
      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.7 },
          colors: ["#00f2fe", "#10b981", "#ffffff"],
        });
        toast.success(`¡Pulsera entregada a ${attendee.customerName}! Acceso concedido.`);
        setAttendees((prev) =>
          prev.map((a) => (a._id === attendee._id ? { ...a, wristbandDelivered: true, wristbandDeliveredAt: new Date() } : a))
        );
        setSelectedAttendee((prev) =>
          prev && prev._id === attendee._id ? { ...prev, wristbandDelivered: true, wristbandDeliveredAt: new Date() } : prev
        );
        loadStats();
      }
    } catch (error) {
      toast.error(error.message || "Error al entregar pulsera");
    }
  };

  const handlePayInDoor = async (attendee) => {
    try {
      const res = await api.togglePaymentStatus(attendee._id);
      if (res.success) {
        toast.success(`Pago registrado para ${attendee.customerName}. Ahora puedes entregar su pulsera.`);
        setAttendees((prev) =>
          prev.map((a) => (a._id === attendee._id ? { ...a, paymentStatus: "CANCELADO" } : a))
        );
        if (selectedAttendee && selectedAttendee._id === attendee._id) {
          setSelectedAttendee({ ...selectedAttendee, paymentStatus: "CANCELADO" });
        }
      }
    } catch (error) {
      toast.error("Error al registrar pago en puerta");
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Cabecera Especial de Puerta */}
      <div className="party-card p-6 border-cyan-500/30 bg-gradient-to-br from-[#121524] to-[#0a0c14] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <HiOutlineShieldCheck className="w-4 h-4 text-cyan-400" />
              Acceso en Puerta · Eventos Kaizen
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-heading text-white">
              Validación y Entrega de Pulseras
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Busca por nombre para comprobar el pago y registrar la pulsera física
            </p>
          </div>

          <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Aforo Ingresado
            </span>
            <span className="text-2xl font-black font-mono-code text-cyan-400">
              {stats.delivered}{" "}
              <span className="text-slate-500 text-base font-normal">/ {stats.total}</span>
            </span>
          </div>
        </div>

        {/* Buscador Gigante de Puerta */}
        <div className="mt-6 relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-cyan-400">
            <HiOutlineSearch className="w-6 h-6" />
          </div>
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Escribe el nombre o número de ticket del asistente..."
            style={{ paddingLeft: "3.75rem" }}
            className="input-party pr-4 py-3.5 text-base lg:text-lg font-medium border-cyan-500/40 focus:border-cyan-400 bg-black/50"
          />
        </div>
      </div>

      {/* Lista de Resultados de Puerta */}
      <div className="space-y-3">
        {loading && (
          <div className="party-card p-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Buscando en la lista de entradas...</p>
          </div>
        )}

        {!loading && attendees.length === 0 && (
          <div className="party-card p-10 text-center text-slate-400 border-dashed border-white/10">
            <p className="text-base font-bold text-slate-300">
              {search ? `No se encontró a nadie con "${search}"` : "Ingresa un nombre para buscar"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Verifica la ortografía o el número de comprobante bancario.
            </p>
          </div>
        )}

        {!loading &&
          attendees.map((person) => {
            const isPaid = person.paymentStatus === "CANCELADO";
            const isDelivered = person.wristbandDelivered;

            return (
              <div
                key={person._id}
                className={`party-card p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDelivered
                    ? "border-cyan-500/20 bg-[#0f121d]/80 opacity-80"
                    : isPaid
                    ? "border-emerald-500/30 bg-[#121622] hover:border-emerald-400/50"
                    : "border-amber-500/30 bg-[#17141b]"
                }`}
              >
                {/* Datos de la Persona */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-code font-black text-cyan-400 text-base bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      #{person.ticketNumber}
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {person.customerName}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {person.phone && (
                      <span className="font-mono-code text-slate-300">{person.phone}</span>
                    )}
                    {person.schoolPromo && (
                      <span className="text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded">
                        {person.schoolPromo}
                      </span>
                    )}
                    <span className="text-slate-300">
                      {person.ticketType} (${person.amount})
                    </span>
                    <span className="uppercase text-[11px] text-slate-400 font-bold">
                      · {person.paymentMethod}
                    </span>
                  </div>
                </div>

                {/* Estado y Acción en Puerta */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Badge de Pago */}
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isPaid
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {isPaid ? "PAGADO (CANCELADO)" : "PENDIENTE DE PAGO"}
                  </span>

                  {/* Botón de Entrega de Pulsera */}
                  {isDelivered ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold text-xs">
                      <HiOutlineCheckCircle className="w-5 h-5 text-cyan-400" />
                      <span>PULSERA ENTREGADA</span>
                    </div>
                  ) : isPaid ? (
                    <button
                      onClick={() => handleDeliver(person)}
                      className="btn-neon text-xs py-2.5 px-4 cursor-pointer"
                    >
                      <HiOutlineSparkles className="w-4 h-4" />
                      <span>ENTREGAR PULSERA</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayInDoor(person)}
                      className="bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs py-2.5 px-4 rounded-xl border border-amber-400 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      Cobrar y Validar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
