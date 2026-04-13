import { cn, riskBgClass } from "@/lib/utils";
import type { RiskCategory } from "@/lib/types";

interface Props {
  category: RiskCategory;
  size?: "sm" | "md";
}

export function RiskBadge({ category, size = "md" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        riskBgClass(category),
      )}
    >
      {category}
    </span>
  );
}
