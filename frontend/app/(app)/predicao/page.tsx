"use client";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { PredictForm } from "@/components/predicao/PredictForm";

export default function PredicaoPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <TopBar title={t.predict.title} subtitle={t.predict.subtitle} />

      {/* Beta notice */}
      <motion.div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.18)",
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <FlaskConical className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
            {t.predict.betaTitle}
          </span>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {t.predict.betaDesc}
          </p>
        </div>
      </motion.div>

      <PredictForm />
    </div>
  );
}
