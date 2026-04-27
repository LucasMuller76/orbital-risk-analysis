"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, BarChart3, Satellite, BrainCircuit, BookOpen } from "lucide-react";
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
    { href: "/",           label: t.nav.dashboard, Icon: LayoutDashboard },
    { href: "/objects",    label: t.nav.objects,   Icon: Table2 },
    { href: "/analytics",  label: t.nav.analytics, Icon: BarChart3 },
    { href: "/predicao",   label: t.nav.predict,   Icon: BrainCircuit },
    { href: "/glossario",  label: t.nav.glossary,  Icon: BookOpen },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo — clicking collapses the sidebar */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
        >
          <Satellite className="h-4 w-4 text-cyan-400" />
        </button>
        <div className="leading-tight">
          <span className="text-sm font-semibold text-slate-100 block">Orbital Risk</span>
          <span className="text-xs text-slate-500">LEO Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        {/* Language toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 mr-1">Lang:</span>
          <button
            onClick={() => setLang("en")}
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-md transition-colors",
              lang === "en"
                ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            EN
          </button>
          <span className="text-slate-700 text-xs">|</span>
          <button
            onClick={() => setLang("pt")}
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-md transition-colors",
              lang === "pt"
                ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            PT
          </button>
        </div>

        {/* Model info */}
        <div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {t.sidebar.model}<br />
            {t.sidebar.r2}
          </p>
        </div>

        {/* Credits */}
        <div className="border-t border-slate-800/60 pt-3">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {t.sidebar.developedBy}<br />
            <span className="text-slate-400 font-medium">Lucas Muller</span>
            {" & "}
            <span className="text-slate-400 font-medium">Giovanna Pagnussatt</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
