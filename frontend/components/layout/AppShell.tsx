"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Sidebar open={open} onToggle={() => setOpen((v) => !v)} />

      {/* Mobile backdrop overlay with smooth fade */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <main
        className={cn(
          "relative z-10 min-h-screen transition-[margin-left] duration-300",
          "ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "lg:ml-60" : "ml-0",
        )}
      >
        {/* Hamburger — visible only when sidebar is closed */}
        <AnimatePresence>
          {!open && (
            <motion.button
              key="hamburger"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
              className={cn(
                "fixed top-4 left-4 z-50",
                "flex h-9 w-9 items-center justify-center rounded-xl",
                "border border-[rgba(34,211,238,0.18)] bg-[rgba(7,14,36,0.88)]",
                "text-slate-400 shadow-lg backdrop-blur-sm",
                "hover:border-[rgba(34,211,238,0.35)] hover:text-cyan-400",
                "transition-colors duration-200",
              )}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Menu className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </>
  );
}
