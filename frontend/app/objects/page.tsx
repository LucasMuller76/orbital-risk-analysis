import { TopBar } from "@/components/layout/TopBar";
import { ObjectsTable } from "@/components/objects/ObjectsTable";

export default function ObjectsPage() {
  return (
    <div className="space-y-6">
      <TopBar
        title="Objects"
        subtitle="Browse, filter and sort all tracked LEO objects"
      />
      <ObjectsTable />
    </div>
  );
}
