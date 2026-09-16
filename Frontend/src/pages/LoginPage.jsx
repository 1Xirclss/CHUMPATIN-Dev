import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, BASE_URL } from "../api/apiClient";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineExclamation,
} from "react-icons/hi";
import toast from "react-hot-toast";

export const LoginPage = () => {
  const { login, register, verifyRegistration } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register' | 'recovery'

  // Alerta de error detallada
  const [errorAlert, setErrorAlert] = useState("");

  // Campos Login (Vacíos sin prefijo)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Campos Registro con verificación OTP Mailjet
  const [regStep, setRegStep] = useState(1); // 1: Datos, 2: Código OTP
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regOtpCode, setRegOtpCode] = useState("");
  const [previewOtp, setPreviewOtp] = useState(null);

  // Campos Recuperación
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Manejar Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorAlert(err.message || "Error al iniciar sesión");
      if (err?.data?.requireVerification) {
        setRegEmail(err.data.email || email);
        setRegStep(2);
        setActiveTab("register");
        if (err.data.previewCode) setPreviewOtp(err.data.previewCode);
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar Paso 1: Enviar Registro y Solicitar Código OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) return;
    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword);
      if (res && res.requireVerification) {
        setRegStep(2);
        if (res.previewCode) setPreviewOtp(res.previewCode);
      } else if (res && !res.success && res.error) {
        setErrorAlert(res.error);
      }
    } catch (err) {
      setErrorAlert(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  // Manejar Paso 2: Verificar Código OTP de Registro
  const handleVerifyRegistration = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    if (!regOtpCode.trim()) return;
    setLoading(true);
    try {
      const success = await verifyRegistration(regEmail, regOtpCode.trim());
      if (!success) {
        setErrorAlert("El código ingresado es incorrecto o ha caducado.");
      }
    } catch (err) {
      setErrorAlert(err.message || "Error al verificar código");
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP de registro
  const handleResendRegisterCode = async () => {
    try {
      toast.loading("Reenviando código vía Mailjet...", { id: "resend" });
      const res = await api.resendVerification(regEmail);
      toast.success(res.message, { id: "resend" });
      if (res.previewCode) setPreviewOtp(res.previewCode);
    } catch (error) {
      toast.error(error.message || "Error al reenviar código", { id: "resend" });
    }
  };

  // Solicitar Código por Mailjet (Recuperación)
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
            onClick={() => {
              setActiveTab("login");
              setRegStep(1);
            }}
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
                onClick={() => {
                  setActiveTab("recovery");
                  setErrorAlert("");
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>

            {errorAlert && activeTab === "login" && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                <HiOutlineExclamation className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block text-white font-bold mb-0.5">Aviso de Ingreso:</strong>
                  <span className="leading-relaxed">{errorAlert}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3.5 text-sm font-bold mt-2"
            >
              <span>{loading ? "Accediendo..." : "Ingresar al Sistema"}</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Formulario 2: Registrar Nuevo Administrador con Verificación OTP Mailjet */}
        {activeTab === "register" && regStep === 1 && (
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
                Correo Electrónico (Para recibir código)
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

            <p className="text-[11px] text-slate-400 leading-relaxed">
              ✉️ Se te enviará un <strong className="text-cyan-400">código OTP de 6 dígitos</strong> a tu correo vía Mailjet para verificar tu identidad antes de entrar.
            </p>

            {errorAlert && activeTab === "register" && regStep === 1 && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                <HiOutlineExclamation className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block text-white font-bold mb-0.5">Error al Registrar:</strong>
                  <span className="leading-relaxed">{errorAlert}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon w-full py-3.5 text-sm font-bold mt-2"
            >
              <span>{loading ? "Enviando Código..." : "Registrarme y Recibir Código"}</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Paso 2 de Registro: Ingreso del Código de Verificación OTP Mailjet */}
        {activeTab === "register" && regStep === 2 && (
          <form onSubmit={handleVerifyRegistration} className="space-y-4">
            <div className="text-center space-y-1.5 mb-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-2">
                <HiOutlineMail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verifica tu Correo</h3>
              <p className="text-xs text-slate-400">
                Hemos enviado un código OTP de 6 dígitos a:
              </p>
              <p className="text-xs font-mono-code font-bold text-cyan-400">
                {regEmail}
              </p>
            </div>

            {previewOtp && (
              <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center text-xs text-cyan-300 font-mono-code">
                Código generado: <strong className="text-white text-sm tracking-widest">{previewOtp}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Ingresa el Código de 6 Dígitos
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={regOtpCode}
                onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="input-party text-center text-2xl font-mono-code tracking-[0.4em] font-black text-cyan-400 py-3"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setRegStep(1)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ← Cambiar Datos
              </button>
              <button
                type="button"
                onClick={handleResendRegisterCode}
                className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                Reenviar Código
              </button>
            </div>

            {errorAlert && activeTab === "register" && regStep === 2 && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                <HiOutlineExclamation className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block text-white font-bold mb-0.5">Error de Verificación:</strong>
                  <span className="leading-relaxed">{errorAlert}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || regOtpCode.length < 6}
              className="btn-neon w-full py-3.5 text-sm font-bold mt-2 disabled:opacity-50"
            >
              <span>{loading ? "Verificando..." : "Activar Cuenta y Entrar"}</span>
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
