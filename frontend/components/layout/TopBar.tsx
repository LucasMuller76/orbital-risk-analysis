interface Props {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: Props) {
  return (
    <div className="mb-8 animate-fade-in-up">
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
        {/* Accent separator line */}
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent" />
      </div>

      {subtitle && (
        <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-cyan-400/50 shrink-0" />
          {subtitle}
        </p>
      )}
    </div>
  );
}
