"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ onRetry, className }: ApiErrorProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-950/10 py-6 text-center",
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 text-red-400/70" />
      <p className="text-sm text-slate-400">Falha ao carregar dados.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
