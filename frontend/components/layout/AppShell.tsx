"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Sidebar open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Overlay backdrop when sidebar is open on small screens */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main
        className={cn(
          "min-h-screen p-8 transition-[margin] duration-300",
          open ? "ml-60" : "ml-0",
        )}
      >
        {/* Hamburger — visible only when sidebar is closed */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            aria-label="Open sidebar"
            className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 shadow-lg hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {children}
      </main>
    </>
  );
}
