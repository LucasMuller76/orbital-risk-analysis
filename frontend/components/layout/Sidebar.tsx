"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table2,
  BarChart3,
  Satellite,
  BrainCircuit,
  BookOpen,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const NAV = [
    { href: "/",          label: t.nav.dashboard, Icon: LayoutDashboard },
    { href: "/objects",   label: t.nav.objects,   Icon: Table2          },
    { href: "/analytics", label: t.nav.analytics, Icon: BarChart3       },
    { href: "/predicao",  label: t.nav.predict,   Icon: BrainCircuit    },
    { href: "/glossario", label: t.nav.glossary,  Icon: BookOpen        },
  ];

  return (
    <aside
      className={cn(
        "glass-sidebar",
        "fixed inset-y-0 left-0 z-40 flex w-60 flex-col",
        "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Top accent gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      {/* ── Logo / toggle ── */}
      <div className="relative flex h-16 items-center gap-3 px-4 border-b border-[rgba(34,211,238,0.07)]">
        {/* Orbital ring decoration behind icon */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl border border-cyan-400/20 scale-[1.35] pointer-events-none" />
          <button
            onClick={onToggle}
            aria-label="Toggle sidebar"
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl",
              "bg-cyan-500/10 ring-1 ring-cyan-500/25",
              "hover:bg-cyan-500/18 hover:ring-cyan-400/40",
              "transition-all duration-200 group icon-glow-cyan",
            )}
          >
            <Satellite className="h-4 w-4 text-cyan-400 transition-transform duration-200 group-hover:rotate-12" />
          </button>
        </div>

        <div className="leading-tight min-w-0">
          <span className="text-sm font-semibold text-slate-100 block tracking-wide">Orbital Risk</span>
          <span className="text-[10px] text-cyan-400/55 tracking-[0.18em] uppercase">LEO Dashboard</span>
        </div>

        {/* Collapse arrow — desktop only */}
        <button
          onClick={onToggle}
          aria-label="Collapse sidebar"
          className="ml-auto hidden lg:flex h-6 w-6 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, Icon }, index) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200",
                active
                  ? "bg-cyan-500/10 text-cyan-400 nav-active-glow"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
              )}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              {/* Left active bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.85)]" />
              )}

              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-200",
                  active ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110",
                )}
              />
              <span className="truncate">{label}</span>

              {/* Active dot indicator */}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-[rgba(34,211,238,0.07)] p-4 space-y-3">
        {/* Language toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 mr-0.5">Lang:</span>
          {(["en", "pt"] as const).map((l, i) => (
            <React.Fragment key={l}>
              {i > 0 && <span className="text-slate-700/60 text-xs">·</span>}
              <button
                onClick={() => setLang(l)}
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-md transition-colors duration-150",
                  lang === l
                    ? "bg-cyan-500/14 text-cyan-400 ring-1 ring-cyan-500/22"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                {l.toUpperCase()}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Model info */}
        <div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t.sidebar.model}<br />
            <span className="text-cyan-400/70">{t.sidebar.r2}</span>
          </p>
        </div>

        {/* Credits */}
        <div className="border-t border-[rgba(255,255,255,0.04)] pt-3">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {t.sidebar.developedBy}<br />
            <span className="text-slate-400 font-medium">Lucas Muller</span>
            {" & "}
            <span className="text-slate-400 font-medium">Giovanna Pagnussatt</span>
          </p>
        </div>
      </div>

      {/* Bottom accent gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
    </aside>
  );
}
