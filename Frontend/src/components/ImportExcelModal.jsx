import React, { useState, useRef } from "react";
import { api } from "../api/apiClient";
import {
  HiOutlineX,
  HiOutlineDocumentDownload,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import toast from "react-hot-toast";

export const ImportExcelModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [clearExisting, setClearExisting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Por favor selecciona un archivo de Excel válido (.xlsx o .xls)");
      return;
    }

    setFile(selected);
    setFileName(selected.name);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      setFileBase64(base64String);
    };
    reader.readAsDataURL(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileBase64) {
      toast.error("Por favor selecciona un archivo Excel primero");
      return;
    }

    setLoading(true);
    try {
      toast.loading("Procesando e importando a MongoDB...", { id: "importing" });
      const res = await api.importExcel({
        fileBase64,
        fileName,
        clearExisting,
      });

      if (res.success) {
        toast.success(res.message, { id: "importing", duration: 4000 });
        onImportSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || "Error al procesar archivo", { id: "importing" });
    } finally {
      setLoading(false);
    }
  };

  const handleWipeAll = async () => {
    if (
      window.confirm(
        "⚠️ ¿Estás seguro de que deseas VACIAR y BORRAR TODOS los datos de ventas y asistentes de la base de datos?"
      )
    ) {
      setClearing(true);
      try {
        const res = await api.clearAllData();
        toast.success(res.message);
        onImportSuccess();
        onClose();
      } catch (error) {
        toast.error("Error al vaciar datos");
      } finally {
        setClearing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="party-card max-w-lg w-full bg-[#0f1118] border border-white/10 shadow-2xl rounded-2xl overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#141724]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <HiOutlineDocumentDownload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading text-white">
                Importar Archivo Excel
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona cualquier archivo (.xlsx o .xls) desde tu computadora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          {/* Zona para Cargar Archivo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              file
                ? "border-cyan-500/60 bg-cyan-500/5"
                : "border-white/15 hover:border-cyan-400/40 hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-[#181b28] text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-white/10 shadow-inner">
              {file ? <HiOutlineCheckCircle className="w-6 h-6 text-emerald-400" /> : <HiOutlineUpload className="w-6 h-6" />}
            </div>

            {file ? (
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{fileName}</p>
                <p className="text-xs text-slate-400 font-mono-code">
                  {(file.size / 1024).toFixed(1)} KB · Clic para cambiar archivo
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-200 mb-1">
                  Haz clic aquí para seleccionar el archivo Excel
                </p>
                <p className="text-xs text-slate-500">
                  Formatos compatibles: .xlsx y .xls
                </p>
              </div>
            )}
          </div>

          {/* Opciones de Importación */}
          <div className="p-3.5 bg-[#141724] rounded-xl border border-white/[0.06] space-y-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="mt-0.5 rounded border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>
                <strong>Limpiar registros anteriores:</strong> Vaciar ventas previas para que la base de datos quede exactamente como tu archivo nuevo.
              </span>
            </label>
          </div>

          {/* Botón de Importar */}
          <button
            type="submit"
            disabled={!file || loading}
            className={`btn-neon w-full py-3 text-xs font-bold ${
              !file ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <HiOutlineUpload className="w-4 h-4" />
            <span>{loading ? "Importando a MongoDB..." : "Subir e Importar a MongoDB"}</span>
          </button>

          {/* Opción de Vaciar Todo */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-500">¿Deseas empezar desde cero?</span>
            <button
              type="button"
              onClick={handleWipeAll}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-semibold cursor-pointer transition-colors"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
              <span>{clearing ? "Borrando..." : "Vaciar Base de Datos a 0"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
