"use client";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { PredictForm } from "@/components/predicao/PredictForm";

export default function PredicaoPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <TopBar title={t.predict.title} subtitle={t.predict.subtitle} />
      <PredictForm />
    </div>
  );
}
