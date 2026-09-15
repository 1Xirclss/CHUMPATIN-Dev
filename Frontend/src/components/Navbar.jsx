import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineTicket,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX,
} from "react-icons/hi";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Dashboard & Arqueo", icon: HiOutlineChartBar },
    { to: "/ventas", label: "Ventas & Asistentes", icon: HiOutlineTicket },
    { to: "/puerta", label: "Control en Puerta", icon: HiOutlineShieldCheck, highlight: true },
    { to: "/ajustes", label: "Configuración", icon: HiOutlineCog },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0a0c13]/95 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo e Identidad del Evento */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(0,242,254,0.2)] bg-black flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="CHUMPATIN" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-brand text-base sm:text-lg text-white">
                  CHUMPATIN<span className="text-cyan-400 text-xs ml-0.5">®</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  XXL
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Senior Send-Off · Kaizen
              </p>
            </div>
          </div>

          {/* Navegación Desktop / Tablet Grande */}
          <nav className="hidden md:flex items-center gap-1 bg-[#121520] p-1 rounded-xl border border-white/[0.06]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Botones de Usuario y Hamburguesa */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#141724] rounded-lg border border-white/[0.06]">
                <HiOutlineUser className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-slate-200">{user.name}</span>
              </div>
            )}

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
            >
              <HiOutlineLogout className="w-4 h-4" />
              <span>Salir</span>
            </button>

            {/* Botón Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white bg-[#141724] rounded-lg border border-white/[0.08]"
              aria-label="Menú móvil"
            >
              {mobileMenuOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-white/[0.08] mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-cyan-500 text-black font-bold"
                        : "text-slate-300 hover:bg-white/[0.05]"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <HiOutlineLogout className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </header>

      {/* Barra de Navegación Inferior en Móvil para acceso súper rápido */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0c13]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all ${
                  isActive ? "text-cyan-400 font-bold scale-105" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
