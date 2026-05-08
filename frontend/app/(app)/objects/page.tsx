"use client";
import { useLanguage } from "@/lib/language-context";
import { TopBar } from "@/components/layout/TopBar";
import { ObjectsTable } from "@/components/objects/ObjectsTable";

export default function ObjectsPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <TopBar title={t.objects.title} subtitle={t.objects.subtitle} />
      <ObjectsTable />
    </div>
  );
}
