"use client";
import { motion } from "framer-motion";

interface Props {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: Props) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex items-center gap-4">
        <h1
          className="text-2xl font-semibold tracking-tight shrink-0"
          style={{
            background: "linear-gradient(135deg, #f1f5f9 10%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>
        {/* Animated separator line */}
        <div className="flex-1 overflow-hidden h-px">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </div>

      {subtitle && (
        <motion.p
          className="mt-1.5 text-sm text-slate-500 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <span className="inline-block w-1 h-1 rounded-full bg-cyan-400/50 shrink-0" />
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
