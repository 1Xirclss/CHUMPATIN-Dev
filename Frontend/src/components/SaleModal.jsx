import React, { useState, useEffect } from "react";
import { api } from "../api/apiClient";
import { HiOutlineX, HiOutlineCheck } from "react-icons/hi";

export const SaleModal = ({ isOpen, onClose, onSave, saleToEdit }) => {
  const [ticketTiers, setTicketTiers] = useState([
    { id: "promo_preventa", name: "Promo 2026 - Preventa", price: 15 },
    { id: "promo_puerta", name: "Promo 2026 - Puerta", price: 20 },
    { id: "general_preventa", name: "General - Preventa", price: 20 },
    { id: "general_puerta", name: "General - Puerta", price: 25 },
  ]);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    schoolPromo: "",
    ticketType: "Promo 2026 - Preventa ($15)",
    quantity: 1,
    unitPrice: 15,
    amount: 15,
    paymentMethod: "TRANSFERENCIA",
    paymentStatus: "CANCELADO",
    transferBank: "Banco Agrícola",
    transferReference: "",
    notes: "",
    customTicketNumber: "",
  });

  const [saving, setSaving] = useState(false);

  // Cargar tipos de entrada directamente de la base de datos MongoDB
  useEffect(() => {
    const fetchTiersFromDB = async () => {
      try {
        const res = await api.getSettings();
        if (res.success && res.data?.ticketTiers?.length > 0) {
          setTicketTiers(res.data.ticketTiers);
          if (!saleToEdit) {
            const first = res.data.ticketTiers[0];
            setFormData((prev) => ({
              ...prev,
              ticketType: `${first.name} ($${first.price})`,
              unitPrice: first.price,
              amount: first.price * prev.quantity,
            }));
          }
        }
      } catch (err) {
        console.error("Error al cargar tarifas de MongoDB:", err);
      }
    };

    if (isOpen) {
      fetchTiersFromDB();
    }
  }, [isOpen, saleToEdit]);

  useEffect(() => {
    if (saleToEdit) {
      setFormData({
        customerName: saleToEdit.customerName || "",
        phone: saleToEdit.phone || "",
        schoolPromo: saleToEdit.schoolPromo || "",
        ticketType: saleToEdit.ticketType || "Promo 2026 - Preventa ($15)",
        quantity: saleToEdit.quantity || 1,
        unitPrice: saleToEdit.unitPrice || 15,
        amount: saleToEdit.amount || 15,
        paymentMethod: saleToEdit.paymentMethod || "TRANSFERENCIA",
        paymentStatus: saleToEdit.paymentStatus || "CANCELADO",
        transferBank: saleToEdit.transferBank || "Banco Agrícola",
        transferReference: saleToEdit.transferReference || "",
        notes: saleToEdit.notes || "",
        customTicketNumber: saleToEdit.ticketNumber || "",
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        customerName: "",
        phone: "",
        schoolPromo: "",
        transferReference: "",
        notes: "",
        customTicketNumber: "",
      }));
    }
  }, [saleToEdit, isOpen]);

  const handleTicketTypeChange = (e) => {
    const selectedType = e.target.value;
    const found = ticketTiers.find((t) => `${t.name} ($${t.price})` === selectedType || t.name === selectedType);
    const newPrice = found ? found.price : formData.unitPrice;
    setFormData((prev) => ({
      ...prev,
      ticketType: selectedType,
      unitPrice: newPrice,
      amount: newPrice * prev.quantity,
    }));
  };

  const handleQuantityChange = (e) => {
    const qty = Math.max(1, parseInt(e.target.value) || 1);
    setFormData((prev) => ({
      ...prev,
      quantity: qty,
      amount: prev.unitPrice * qty,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="party-card max-w-xl w-full bg-[#0f1118] border border-white/10 shadow-2xl rounded-2xl overflow-hidden my-auto">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#141724]">
          <div>
            <h2 className="text-lg font-bold font-heading text-white">
              {saleToEdit ? `Editar Venta #${saleToEdit.ticketNumber}` : "Registrar Nueva Entrada"}
            </h2>
            <p className="text-xs text-slate-400">
              Guardado directo en MongoDB
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre Completo del Asistente *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Ej: Valeria Fernández"
              className="input-party text-sm font-medium"
            />
          </div>

          {/* Teléfono y Colegio / Promo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej: 7788-9900"
                className="input-party text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Colegio / Senior Promo
              </label>
              <input
                type="text"
                value={formData.schoolPromo}
                onChange={(e) => setFormData({ ...formData, schoolPromo: e.target.value })}
                placeholder="Ej: Promo 2026 Champagnat"
                className="input-party text-sm"
              />
            </div>
          </div>

          {/* Tipo de Entrada (Leído de MongoDB) y Cantidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo de Entrada (Base de Datos)
              </label>
              <select
                value={formData.ticketType}
                onChange={handleTicketTypeChange}
                className="input-party text-sm cursor-pointer"
              >
                {ticketTiers.map((t) => {
                  const val = `${t.name} ($${t.price})`;
                  return (
                    <option key={t.id || t.name} value={val} className="bg-[#0f1118]">
                      {t.target ? `[${t.target}] ` : ""}{t.name} - ${t.price}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleQuantityChange}
                className="input-party text-sm font-mono-code text-center font-bold"
              />
            </div>
          </div>

          {/* Método de Pago y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "TRANSFERENCIA" })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.paymentMethod === "TRANSFERENCIA"
                      ? "bg-cyan-500 text-black border-cyan-500 shadow-md shadow-cyan-500/20"
                      : "bg-[#141724] text-slate-300 border-white/10 hover:border-white/20"
                  }`}
                >
                  Transferencia
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: "EFECTIVO" })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.paymentMethod === "EFECTIVO"
                      ? "bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-[#141724] text-slate-300 border-white/10 hover:border-white/20"
                  }`}
                >
                  Efectivo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Estado del Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentStatus: "CANCELADO" })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.paymentStatus === "CANCELADO"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/60"
                      : "bg-[#141724] text-slate-400 border-white/10"
                  }`}
                >
                  CANCELADO
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentStatus: "PENDIENTE" })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.paymentStatus === "PENDIENTE"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/60"
                      : "bg-[#141724] text-slate-400 border-white/10"
                  }`}
                >
                  PENDIENTE
                </button>
              </div>
            </div>
          </div>

          {/* Detalles de Transferencia si aplica */}
          {formData.paymentMethod === "TRANSFERENCIA" && (
            <div className="p-3.5 bg-[#141724] rounded-xl border border-white/[0.08] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Banco de la Transferencia
                  </label>
                  <select
                    value={formData.transferBank}
                    onChange={(e) => setFormData({ ...formData, transferBank: e.target.value })}
                    className="input-party text-xs"
                  >
                    <option value="Banco Agrícola">Banco Agrícola</option>
                    <option value="BAC Credomatic">BAC Credomatic</option>
                    <option value="Banco Cuscatlán">Banco Cuscatlán</option>
                    <option value="Banco Davivienda">Banco Davivienda</option>
                    <option value="Chivo Wallet">Chivo Wallet</option>
                    <option value="Otro">Otro Banco / Billetera</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    N° de Comprobante / Referencia
                  </label>
                  <input
                    type="text"
                    value={formData.transferReference}
                    onChange={(e) => setFormData({ ...formData, transferReference: e.target.value })}
                    placeholder="Ej: REF-884920"
                    className="input-party text-xs font-mono-code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Resumen de Total */}
          <div className="flex items-center justify-between p-3.5 bg-black/50 rounded-xl border border-white/[0.08]">
            <span className="text-xs text-slate-400 font-medium">Total a Cobrar:</span>
            <span className="text-xl font-bold font-mono-code text-cyan-400">
              ${Number(formData.amount).toFixed(2)}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-neon text-xs"
            >
              <HiOutlineCheck className="w-4 h-4" />
              <span>{saving ? "Guardando en BD..." : saleToEdit ? "Guardar Cambios" : "Confirmar Venta"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
