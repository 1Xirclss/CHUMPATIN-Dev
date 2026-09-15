import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/apiClient";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";
import toast from "react-hot-toast";

export const LoginPage = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register' | 'recovery'

  // Campos Login
  const [email, setEmail] = useState("admin@chumpatin.com");
  const [password, setPassword] = useState("admin123");

  // Campos Registro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Campos Recuperación
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Manejar Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  // Manejar Registro
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) return;
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword);
    } finally {
      setLoading(false);
    }
  };

  // Solicitar Código por Mailjet
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    try {
      toast.loading("Enviando código vía Mailjet...", { id: "otp" });
      const res = await api.requestRecovery(recoveryEmail);
      toast.success(res.message, { id: "otp" });
      setRecoveryStep(2);
    } catch (error) {
      toast.error(error.message || "Error al enviar código", { id: "otp" });
    }
  };

  // Cambiar Clave con Código
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Actualizando contraseña...", { id: "reset" });
      const res = await api.resetPassword({
        email: recoveryEmail,
        code: otpCode,
        newPassword,
      });
      toast.success(res.message, { id: "reset" });
      setActiveTab("login");
      setRecoveryStep(1);
    } catch (error) {
      toast.error(error.message || "Error al restablecer contraseña", { id: "reset" });
    }
  };

  return (
    <div className="min-h-screen party-glow-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[440px] party-card p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden my-auto">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Logo Oficial */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_20px_rgba(0,242,254,0.25)] mx-auto mb-3 bg-black flex items-center justify-center">
            <img src="/logo.svg" alt="CHUMPATIN" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-brand text-white tracking-wider">
            CHUMPATIN<span className="text-cyan-400 text-sm font-bold ml-1">®</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-400 mt-1">
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            <span>LAST DANCE 2026 · SENIOR SEND-OFF</span>
          </div>
        </div>

        {/* Selector de Pestañas: Login vs Registro */}
        <div className="flex rounded-xl bg-[#090a0f] p-1 border border-white/[0.08] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Registrar Admin
          </button>
        </div>

        {/* Formulario 1: Iniciar Sesión */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-slate-400">
                  <HiOutlineMail className="w-5 h-5 text-cyan-400/80" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chumpatin.com"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-slate-400">
                  <HiOutlineLockClosed className="w-5 h-5 text-cyan-400/80" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-medium">Panel Administrativo</span>
              <button
                type="button"
                onClick={() => setActiveTab("recovery")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3.5 text-sm font-bold mt-2"
            >
              <span>{loading ? "Accediendo..." : "Ingresar al Sistema"}</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/[0.06] text-[11px] text-slate-400 text-center">
              Acceso por defecto: <strong className="text-slate-200">admin@chumpatin.com</strong> / <strong className="text-slate-200">admin123</strong>
            </div>
          </form>
        )}

        {/* Formulario 2: Registrar Nuevo Administrador */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-slate-400">
                  <HiOutlineUser className="w-5 h-5 text-cyan-400/80" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Tu Nombre / Organizador"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-slate-400">
                  <HiOutlineMail className="w-5 h-5 text-cyan-400/80" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="input-with-icon"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-slate-400">
                  <HiOutlineLockClosed className="w-5 h-5 text-cyan-400/80" />
                </div>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="input-with-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3.5 text-sm font-bold mt-2"
            >
              <span>{loading ? "Creando Cuenta..." : "Registrarme como Administrador"}</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Formulario 3: Recuperación de Contraseña (Mailjet) */}
        {activeTab === "recovery" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Recuperación vía Mailjet
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold"
              >
                Volver al Login
              </button>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Ingresa tu correo registrado para recibir un código OTP de 6 dígitos:
                </p>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400">
                    <HiOutlineMail className="w-5 h-5 text-cyan-400/80" />
                  </div>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="admin@chumpatin.com"
                    className="input-with-icon"
                  />
                </div>
                <button type="submit" className="btn-neon w-full py-3 text-xs font-bold">
                  Enviar Código OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Ingresa el código numérico recibido en tu correo y tu nueva contraseña:
                </p>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  className="input-party text-sm font-mono-code text-center tracking-widest font-bold"
                />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="input-party text-sm"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="btn-secondary flex-1 text-xs"
                  >
                    Atrás
                  </button>
                  <button type="submit" className="btn-neon flex-1 text-xs">
                    Guardar Nueva Clave
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <footer className="mt-6 text-center text-xs text-slate-500">
        CHUMPATIN ® · 10.10.26 · Eventos Kaizen, Santa Tecla
      </footer>
    </div>
  );
};
