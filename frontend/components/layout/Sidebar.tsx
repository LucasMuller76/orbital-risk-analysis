"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Table2, BarChart3, Satellite } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",          label: "Dashboard",  Icon: LayoutDashboard },
  { href: "/objects",   label: "Objects",    Icon: Table2 },
  { href: "/analytics", label: "Analytics",  Icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-zinc-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
          <Satellite className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-zinc-900 leading-tight">
          Orbital Risk<br />
          <span className="text-zinc-400 font-normal text-xs">LEO Dashboard</span>
        </span>
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
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-100 p-4">
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Model: Random Forest<br />
          Band-level R² ≈ 0.98
        </p>
      </div>
    </aside>
  );
}
