import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "cyan",
}) => {
  const colorMap = {
    cyan: {
      border: "border-cyan-500/20",
      bgHover: "hover:border-cyan-500/40",
      iconBg: "bg-cyan-500/10 text-cyan-400",
      glow: "shadow-[0_0_20px_rgba(0,242,254,0.06)]",
    },
    green: {
      border: "border-emerald-500/20",
      bgHover: "hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
    },
    amber: {
      border: "border-amber-500/20",
      bgHover: "hover:border-amber-500/40",
      iconBg: "bg-amber-500/10 text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.06)]",
    },
    purple: {
      border: "border-purple-500/20",
      bgHover: "hover:border-purple-500/40",
      iconBg: "bg-purple-500/10 text-purple-400",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.06)]",
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <div
      className={`party-card p-5 ${scheme.border} ${scheme.bgHover} ${scheme.glow} relative overflow-hidden transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold font-heading text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} border border-white/[0.05]`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
          <span className="text-slate-400">{trend.label}</span>
          <span className="font-semibold text-cyan-400">{trend.value}</span>
        </div>
      )}
    </div>
  );
};
