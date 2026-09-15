import React, { useState, useEffect } from "react";
import { api } from "../api/apiClient";
import { HiOutlineSave, HiOutlineCog, HiOutlineSparkles } from "react-icons/hi";
import toast from "react-hot-toast";

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    eventName: "⚡ CHUMPATIN XXL · SENIOR SEND-OFF PROMO 2026",
    eventDate: "10/10/2026",
    eventTime: "7:00 PM – 12:00 AM",
    venueName: "Eventos Kaizen",
    venueAddress: "Calle al Boquerón, Km 13 #25, Santa Tecla",
    securityInfo: "Papás y adultos responsables presentes durante el evento",
    maxCapacity: 400,
    ticketPricing: {
      promoPreventa: 15,
      promoPuerta: 20,
      generalPreventa: 20,
      generalPuerta: 25,
    },
    bankTransferInfo: {
      bankName: "Banco Agrícola / BAC / Cuscatlán / Chivo Wallet",
      accountNumber: "",
      accountHolder: "CHUMPATIN EVENTOS",
      whatsappSupport: "7788-9900",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateSettings(settings);
      if (res.success) {
        toast.success("Configuración actualizada correctamente");
      }
    } catch (error) {
      toast.error(error.message || "Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="party-card p-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">
          Configuración del Evento & Tarifas
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Datos de la fiesta, precios de boletos y cuentas para transferencias
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Básicos del Evento */}
        <div className="party-card p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <HiOutlineSparkles className="w-4 h-4" />
            Detalles de la Fiesta
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nombre del Evento
              </label>
              <input
                type="text"
                value={settings.eventName}
                onChange={(e) => setSettings({ ...settings, eventName: e.target.value })}
                className="input-party text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Fecha del Evento
              </label>
              <input
                type="text"
                value={settings.eventDate}
                onChange={(e) => setSettings({ ...settings, eventDate: e.target.value })}
                className="input-party text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Horario
              </label>
              <input
                type="text"
                value={settings.eventTime}
                onChange={(e) => setSettings({ ...settings, eventTime: e.target.value })}
                className="input-party text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Lugar / Venue
              </label>
              <input
                type="text"
                value={settings.venueName}
                onChange={(e) => setSettings({ ...settings, venueName: e.target.value })}
                className="input-party text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Capacidad Máxima (Aforo)
              </label>
              <input
                type="number"
                value={settings.maxCapacity}
                onChange={(e) => setSettings({ ...settings, maxCapacity: Number(e.target.value) })}
                className="input-party text-sm font-mono-code font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={settings.venueAddress}
                onChange={(e) => setSettings({ ...settings, venueAddress: e.target.value })}
                className="input-party text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tarifas y Precios de Entrada */}
        <div className="party-card p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Precios Oficiales de Boletos ($)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#161824] rounded-xl border border-white/[0.06]">
              <span className="text-xs font-bold text-cyan-400 block mb-2">
                🎓 Promo 2026 (Seniors)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Preventa ($)</label>
                  <input
                    type="number"
                    value={settings.ticketPricing?.promoPreventa || 15}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ticketPricing: { ...settings.ticketPricing, promoPreventa: Number(e.target.value) },
                      })
                    }
                    className="input-party text-sm font-mono-code font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">En Puerta ($)</label>
                  <input
                    type="number"
                    value={settings.ticketPricing?.promoPuerta || 20}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ticketPricing: { ...settings.ticketPricing, promoPuerta: Number(e.target.value) },
                      })
                    }
                    className="input-party text-sm font-mono-code font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#161824] rounded-xl border border-white/[0.06]">
              <span className="text-xs font-bold text-slate-200 block mb-2">
                👥 Entrada General
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Preventa ($)</label>
                  <input
                    type="number"
                    value={settings.ticketPricing?.generalPreventa || 20}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ticketPricing: { ...settings.ticketPricing, generalPreventa: Number(e.target.value) },
                      })
                    }
                    className="input-party text-sm font-mono-code font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">En Puerta ($)</label>
                  <input
                    type="number"
                    value={settings.ticketPricing?.generalPuerta || 25}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ticketPricing: { ...settings.ticketPricing, generalPuerta: Number(e.target.value) },
                      })
                    }
                    className="input-party text-sm font-mono-code font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-neon text-xs py-3 px-6"
          >
            <HiOutlineSave className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Configuración"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
