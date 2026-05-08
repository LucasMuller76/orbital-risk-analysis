"use client";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ApiErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ onRetry, className }: ApiErrorProps) {
  const [retrying, setRetrying] = useState(false);
  const [showWakeUp, setShowWakeUp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowWakeUp(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    setShowWakeUp(false);
    try {
      onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 2000);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-950/10 py-6 text-center px-4",
      className,
    )}>
      <AlertTriangle className="h-5 w-5 text-red-400/70" />
      <p className="text-sm text-slate-400">Falha ao carregar dados.</p>

      {showWakeUp && (
        <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
          O backend pode estar iniciando — aguarde alguns segundos e tente novamente.
        </p>
      )}

      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="mt-1 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
        >
          {retrying
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <RefreshCw className="h-3 w-3" />}
          {retrying ? "Tentando..." : "Tentar novamente"}
        </button>
      )}
    </div>
  );
}
