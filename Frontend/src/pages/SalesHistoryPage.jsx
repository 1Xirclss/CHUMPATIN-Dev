import React, { useState, useEffect } from "react";
import { api } from "../api/apiClient";
import { QuickSearch } from "../components/QuickSearch";
import { SalesTable } from "../components/SalesTable";
import { HiOutlinePlus, HiOutlineDownload, HiOutlinePrinter } from "react-icons/hi";
import toast from "react-hot-toast";

export const SalesHistoryPage = ({ onOpenSaleModal }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [wristbandFilter, setWristbandFilter] = useState("");

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.getSales({
        search,
        paymentMethod: paymentMethodFilter,
        paymentStatus: paymentStatusFilter,
        wristbandDelivered: wristbandFilter,
        limit: 500,
      });
      if (res.success) {
        setSales(res.data);
      }
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al cargar la lista de ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSales();
    }, 250);

    const handleUpdate = () => fetchSales();
    window.addEventListener("sale_updated", handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("sale_updated", handleUpdate);
    };
  }, [search, paymentMethodFilter, paymentStatusFilter, wristbandFilter]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.togglePaymentStatus(id);
      if (res.success) {
        toast.success(res.message);
        setSales((prev) =>
          prev.map((s) => (s._id === id ? { ...s, paymentStatus: res.data.paymentStatus } : s))
        );
      }
    } catch (error) {
      toast.error(error.message || "Error al alternar estado");
    }
  };

  const handleDeliverWristband = async (sale) => {
    try {
      const res = await api.deliverWristband(sale._id);
      if (res.success) {
        toast.success(res.message);
        setSales((prev) =>
          prev.map((s) => (s._id === sale._id ? { ...s, wristbandDelivered: true } : s))
        );
      }
    } catch (error) {
      toast.error(error.message || "Error al entregar pulsera");
    }
  };

  const handleDelete = async (sale) => {
    if (window.confirm(`¿Estás seguro de eliminar el boleto #${sale.ticketNumber} de ${sale.customerName}?`)) {
      try {
        const res = await api.deleteSale(sale._id);
        if (res.success) {
          toast.success(res.message);
          setSales((prev) => prev.filter((s) => s._id !== sale._id));
        }
      } catch (error) {
        toast.error(error.message || "Error al eliminar");
      }
    }
  };

  // Exportar a CSV limpio para Excel
  const exportToCSV = () => {
    if (sales.length === 0) {
      toast.error("No hay registros para exportar");
      return;
    }

    const headers = [
      "Ticket",
      "Nombre",
      "Telefono",
      "Colegio_Promo",
      "Tipo_Entrada",
      "Metodo_Pago",
      "Monto",
      "Estado_Pago",
      "Pulsera_Entregada",
      "Banco_Transferencia",
      "Referencia",
    ];

    const rows = sales.map((s) => [
      s.ticketNumber,
      `"${s.customerName.replace(/"/g, '""')}"`,
      s.phone || "",
      `"${(s.schoolPromo || "").replace(/"/g, '""')}"`,
      `"${s.ticketType || ""}"`,
      s.paymentMethod,
      s.amount,
      s.paymentStatus,
      s.wristbandDelivered ? "SI" : "NO",
      s.transferBank || "",
      `"${(s.transferReference || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CHUMPATIN_Ventas_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Listado exportado en formato CSV para Excel");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Historial de Ventas & Asistentes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Control de boletos emitidos, liquidación de pagos y entrega de pulseras
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="btn-secondary text-xs"
            title="Descargar archivo Excel / CSV"
          >
            <HiOutlineDownload className="w-4 h-4 text-cyan-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => onOpenSaleModal()}
            className="btn-neon text-xs"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="party-card p-4">
        <QuickSearch
          search={search}
          setSearch={setSearch}
          paymentMethodFilter={paymentMethodFilter}
          setPaymentMethodFilter={setPaymentMethodFilter}
          paymentStatusFilter={paymentStatusFilter}
          setPaymentStatusFilter={setPaymentStatusFilter}
          wristbandFilter={wristbandFilter}
          setWristbandFilter={setWristbandFilter}
          totalResults={sales.length}
        />
      </div>

      {/* Tabla de Ventas */}
      <SalesTable
        sales={sales}
        loading={loading}
        onEdit={(sale) => onOpenSaleModal(sale)}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onDeliverWristband={handleDeliverWristband}
      />
    </div>
  );
};
