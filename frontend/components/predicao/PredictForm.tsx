"use client";
import { useState } from "react";
import { BrainCircuit, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { predict } from "@/lib/api";
import type { PredictRequest, PredictResponse, RiskCategory } from "@/lib/types";
import { riskHex, formatCPS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

const DEFAULTS: PredictRequest = {
  altitude_km:            750.0,
  inclination_deg:        53.0,
  eccentricity:           0.001,
  velocity_km_s:          7.5,
  period_min:             99.0,
  bstar_abs:              0.0001,
  local_density_km3:      6e-8,
  debris_fraction_local:  0.36,
  incl_dispersion_local:  17.7,
  alt_density_gradient:   0.0,
  object_type_code:       0,
  is_debris:              0,
  is_uncontrolled:        0,
};

type OrbitalKey = "altitude_km" | "inclination_deg" | "eccentricity" | "velocity_km_s" | "period_min" | "bstar_abs";
type LocalKey = "local_density_km3" | "debris_fraction_local" | "incl_dispersion_local" | "alt_density_gradient";

const ORBITAL_KEYS: Array<{ key: OrbitalKey; step: number; min: number; max: number }> = [
  { key: "altitude_km",       step: 10,    min: 150,   max: 2000 },
  { key: "inclination_deg",   step: 0.5,   min: 0,     max: 180  },
  { key: "eccentricity",      step: 0.001, min: 0,     max: 0.99 },
  { key: "velocity_km_s",     step: 0.01,  min: 6,     max: 8.5  },
  { key: "period_min",        step: 0.5,   min: 85,    max: 135  },
  { key: "bstar_abs",         step: 0.00001, min: 0,   max: 0.1  },
];

const LOCAL_KEYS: Array<{ key: LocalKey; step: number; min: number; max: number }> = [
  { key: "local_density_km3",     step: 1e-9, min: 0,    max: 1e-6 },
  { key: "debris_fraction_local", step: 0.01, min: 0,    max: 1    },
  { key: "incl_dispersion_local", step: 0.5,  min: 0,    max: 90   },
  { key: "alt_density_gradient",  step: 1e-9, min: -1e-6, max: 1e-6 },
];

const RiskIcon = ({ cat }: { cat: RiskCategory }) => {
  if (cat === "HIGH")   return <AlertTriangle className="h-5 w-5" />;
  if (cat === "MEDIUM") return <Activity className="h-5 w-5" />;
  return <ShieldCheck className="h-5 w-5" />;
};

function Field({
  label,
  desc,
  step,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  step: number;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-colors"
      />
      <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
    </div>
  );
}

export function PredictForm() {
  const { t } = useLanguage();
  const p = t.predict;

  const [form, setForm] = useState<PredictRequest>(DEFAULTS);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof PredictRequest, v: number) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predict(form);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "API error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Orbital Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>{p.orbitalParams}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ORBITAL_KEYS.map(({ key, step, min, max }) => (
              <Field
                key={key}
                label={p.fields[key].label}
                desc={p.fields[key].desc}
                step={step}
                min={min}
                max={max}
                value={form[key] as number}
                onChange={(v) => set(key, v)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Local Environment + Object Type */}
        <Card>
          <CardHeader>
            <CardTitle>{p.localEnv}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {LOCAL_KEYS.map(({ key, step, min, max }) => (
              <Field
                key={key}
                label={p.fields[key].label}
                desc={p.fields[key].desc}
                step={step}
                min={min}
                max={max}
                value={form[key] as number}
                onChange={(v) => set(key, v)}
              />
            ))}

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {p.objectTypeSection}
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">{p.typeCode}</label>
                  <select
                    value={form.object_type_code}
                    onChange={(e) => {
                      const code = parseInt(e.target.value);
                      setForm((f) => ({
                        ...f,
                        object_type_code: code,
                        is_debris: code === 2 ? 1 : 0,
                        is_uncontrolled: code >= 1 ? 1 : 0,
                      }));
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-colors"
                  >
                    {p.typeOptions.map((opt, i) => (
                      <option key={i} value={i}>{opt}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">{p.typeAutoNote}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${form.is_debris ? "bg-red-400" : "bg-slate-600"}`} />
                    <span className="text-xs text-slate-400">
                      {p.isDebris}: {form.is_debris ? p.yes : p.no}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${form.is_uncontrolled ? "bg-amber-400" : "bg-slate-600"}`} />
                    <span className="text-xs text-slate-400">
                      {p.isUncontrolled}: {form.is_uncontrolled ? p.yes : p.no}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>{p.resultTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {!result && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BrainCircuit className="h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500">{p.waitMsg}</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400 mb-3" />
                  <p className="text-sm text-slate-500">{p.loadingMsg}</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-xs text-slate-500 mb-1">CPS_log</p>
                    <p
                      className="text-5xl font-bold mb-3"
                      style={{ color: riskHex(result.risk_category) }}
                    >
                      {formatCPS(result.predicted_CPS_log)}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold"
                      style={{
                        color: riskHex(result.risk_category),
                        backgroundColor: `${riskHex(result.risk_category)}18`,
                        border: `1px solid ${riskHex(result.risk_category)}40`,
                      }}
                    >
                      <RiskIcon cat={result.risk_category} />
                      {p.riskLabel[result.risk_category]}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {p.riskDesc[result.risk_category]}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{p.reference}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-400">● {p.riskLabel.LOW}</span>
                      <span className="text-slate-500">{p.thresholds.low}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-amber-400">● {p.riskLabel.MEDIUM}</span>
                      <span className="text-slate-500">{p.thresholds.medium}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">● {p.riskLabel.HIGH}</span>
                      <span className="text-slate-500">{p.thresholds.high}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-cyan-500/20"
          >
            {loading ? p.calculating : p.calculate}
          </button>

          <button
            type="button"
            onClick={() => { setForm(DEFAULTS); setResult(null); setError(null); }}
            className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {p.reset}
          </button>
        </div>
      </div>
    </form>
  );
}
