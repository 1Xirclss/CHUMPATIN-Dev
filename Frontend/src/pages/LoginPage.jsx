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
  const [recoveryPreviewCode, setRecoveryPreviewCode] = useState(null);

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
        if (err.data.previewCode) {
          setPreviewOtp(err.data.previewCode);
          setRegOtpCode(err.data.previewCode);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar Paso 1: Enviar Registro y Generar Código Único de Activación
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorAlert("");
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) return;
    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword);
      if (res && res.requireVerification) {
        setRegStep(2);
        if (res.previewCode) {
          setPreviewOtp(res.previewCode);
          setRegOtpCode(res.previewCode);
        }
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
      toast.loading("Generando nuevo código de activación...", { id: "resend" });
      const res = await api.resendVerification(regEmail);
      toast.success(res.message, { id: "resend" });
      if (res.previewCode) {
        setPreviewOtp(res.previewCode);
        setRegOtpCode(res.previewCode);
      }
    } catch (error) {
      toast.error(error.message || "Error al generar código", { id: "resend" });
    }
  };

  // Solicitar Código Único de Recuperación
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setLoading(true);
    setErrorAlert("");
    try {
      toast.loading("Generando código de seguridad...", { id: "otp" });
      const res = await api.requestRecovery(recoveryEmail.trim());
      toast.success(res.message, { id: "otp" });
      if (res.previewCode) {
        setRecoveryPreviewCode(res.previewCode);
        setOtpCode(res.previewCode);
      }
      setRecoveryStep(2);
    } catch (error) {
      toast.error(error.message || "Error al solicitar código", { id: "otp" });
      setErrorAlert(error.message || "Error al solicitar código");
    } finally {
      setLoading(false);
    }
  };

  // Cambiar Clave con Código
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword.trim()) return;
    setLoading(true);
    try {
      toast.loading("Actualizando contraseña...", { id: "reset" });
      const res = await api.resetPassword({
        email: recoveryEmail.trim(),
        code: otpCode.trim(),
        newPassword,
      });
      toast.success(res.message, { id: "reset" });
      setActiveTab("login");
      setRecoveryStep(1);
      setRecoveryPreviewCode(null);
      setOtpCode("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.message || "Error al restablecer contraseña", { id: "reset" });
      setErrorAlert(error.message || "Error al restablecer contraseña");
    } finally {
      setLoading(false);
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

        {/* Formulario 3: Recuperación de Contraseña con Código Único */}
        {activeTab === "recovery" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <HiOutlineKey className="w-4 h-4 text-cyan-400" />
                <span>Recuperar Contraseña</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setRecoveryStep(1);
                  setRecoveryPreviewCode(null);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-semibold"
              >
                Volver al Login
              </button>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Ingresa tu correo registrado para generar tu código único de seguridad:
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

                {errorAlert && activeTab === "recovery" && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                    {errorAlert}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-neon w-full py-3 text-xs font-bold">
                  {loading ? "Generando Código..." : "Generar Código de Seguridad"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
                  <p className="text-[11px] text-cyan-300 font-semibold uppercase tracking-wider">
                    🔐 Código de Recuperación Generado:
                  </p>
                  <p className="text-xl font-mono-code font-black text-white tracking-[0.3em]">
                    {recoveryPreviewCode || otpCode}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Ingresa tu nueva contraseña para actualizarla al instante:
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Código de Seguridad (6 Dígitos)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Código de 6 dígitos"
                    className="input-party text-sm font-mono-code text-center tracking-widest font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Escribe tu nueva contraseña"
                    className="input-party text-sm"
                  />
                </div>

                {errorAlert && activeTab === "recovery" && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                    {errorAlert}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="btn-secondary flex-1 text-xs"
                  >
                    Atrás
                  </button>
                  <button type="submit" disabled={loading} className="btn-neon flex-1 text-xs">
                    {loading ? "Guardando..." : "Guardar Nueva Clave"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-2 pb-6">
        <span>© 2026 CHUMPATIN ® · SENIOR SEND-OFF PROMO 2026</span>
        <span className="hidden sm:inline text-slate-600">·</span>
        <span className="flex items-center gap-1.5 flex-wrap justify-center">
          Desarrollado y Diseñado por
          <a
            href="https://github.com/1Xirclss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/40 hover:decoration-cyan-400 transition-colors inline-flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20"
            title="Ver perfil de GitHub de Marco Dev (1Xirclss)"
          >
            <svg className="w-3.5 h-3.5 inline text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Marco Dev (Marco Alejandro)
          </a>
          <span>· Derechos Reservados</span>
        </span>
      </footer>
    </div>
  );
};
