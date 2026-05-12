"use client";
import Link from "next/link";
import { Orbitron, IBM_Plex_Mono } from "next/font/google";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import {
  LayoutDashboard, Table2, BarChart3, BrainCircuit,
  ArrowRight, Database, Zap, Shield, ExternalLink,
} from "lucide-react";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

/* ── Animated number counter (uses shared hook) ──────────────── */
function AnimatedNumber({ value, duration = 1800 }: { value: number; duration?: number }) {
  const { display, ref } = useAnimatedNumber(value, duration);
  return <span ref={ref}>{display.toLocaleString()}</span>;
}

/* ── Orbital animation (SVG) ─────────────────────────────────── */
function OrbitalSystem() {
  return (
    <svg viewBox="0 0 500 500" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="planet-grad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="60%" stopColor="#0c1f3f" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="planet-glow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g style={{ animation: "orbit-spin 28s linear infinite", transformOrigin: "250px 250px" }}>
        <ellipse cx="250" cy="250" rx="220" ry="72" fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="1" />
        <circle cx="470" cy="250" r="5.5" fill="#22d3ee" filter="url(#glow-cyan)" />
      </g>
      <g style={{ animation: "orbit-spin 18s linear infinite reverse", transformOrigin: "250px 250px" }} transform="rotate(52 250 250)">
        <ellipse cx="250" cy="250" rx="170" ry="88" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
        <circle cx="420" cy="250" r="4.5" fill="#6366f1" opacity="0.9" />
      </g>
      <g style={{ animation: "orbit-spin 11s linear infinite", transformOrigin: "250px 250px" }} transform="rotate(-28 250 250)">
        <ellipse cx="250" cy="250" rx="126" ry="52" fill="none" stroke="rgba(245,158,11,0.13)" strokeWidth="1" />
        <circle cx="376" cy="250" r="3.5" fill="#f59e0b" opacity="0.85" />
      </g>
      <circle cx="250" cy="250" r="52" fill="none" stroke="rgba(34,211,238,0.07)" strokeWidth="22" />
      <circle cx="250" cy="250" r="34" fill="url(#planet-grad)" stroke="rgba(34,211,238,0.28)" strokeWidth="1" filter="url(#planet-glow)" />
      <ellipse cx="239" cy="242" rx="14" ry="9" fill="rgba(34,211,238,0.07)" />
      <ellipse cx="261" cy="258" rx="8" ry="5" fill="rgba(34,211,238,0.05)" />
    </svg>
  );
}

/* ── Feature cards data ──────────────────────────────────────── */
const FEATURES: Array<{
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  href: string;
  beta?: boolean;
}> = [
  { icon: LayoutDashboard, title: "Dashboard", desc: "KPIs, risk histograms, altitude scatter — full collision overview at a glance.", color: "#22d3ee", href: "/dashboard" },
  { icon: Table2, title: "Objects", desc: "Browse all 27,994 LEO objects. Filter by risk, search by NORAD ID, sort by any column.", color: "#6366f1", href: "/objects" },
  { icon: BarChart3, title: "Analytics", desc: "Correlation heatmaps, altitude band risk charts, object type distributions.", color: "#f59e0b", href: "/analytics" },
  { icon: BrainCircuit, title: "Prediction", desc: "Enter orbital parameters and get live CPS_log prediction from the trained ML model.", color: "#10b981", href: "/predicao", beta: true },
];

/* ── Pipeline steps data ─────────────────────────────────────── */
const PIPELINE = [
  { step: "01", icon: Database, title: "TLE Ingestion", desc: "Two-Line Element sets from Space-Track.org for 27,994 LEO objects with updated orbital epochs.", color: "#6366f1" },
  { step: "02", icon: Zap, title: "Feature Engineering", desc: "13 orbital + local environment features per object: density, debris fraction, inclination dispersion.", color: "#22d3ee" },
  { step: "03", icon: Shield, title: "Risk Classification", desc: "Random Forest with R² ≈ 0.98 predicts CPS_log score. Outputs LOW / MEDIUM / HIGH risk.", color: "#f59e0b" },
];

/* ── Page ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const fonts = `${orbitron.variable} ${ibmMono.variable}`;
  const shouldReduce = useReducedMotion();

  /* Scroll-driven values */
  const { scrollY, scrollYProgress } = useScroll();
  const navBg      = useTransform(scrollY, [0, 80], ["rgba(2,6,23,0.4)", "rgba(2,6,23,0.92)"]);
  const navBorder  = useTransform(scrollY, [0, 80], ["rgba(34,211,238,0.03)", "rgba(34,211,238,0.10)"]);
  const orbScrollY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroScrollY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

  /* Mouse parallax */
  const { x: pX, y: pY } = useMouseParallax(1);
  const orbX  = useTransform(pX, [-1, 1], [-15, 15]);
  const orbY  = useTransform(pY, [-1, 1], [-10, 10]);
  const heroX = useTransform(pX, [-1, 1], [-5,   5]);
  const heroY = useTransform(pY, [-1, 1], [-3,   3]);
  const gridX = useTransform(pX, [-1, 1], [-8,   8]);
  const gridY = useTransform(pY, [-1, 1], [-5,   5]);

  return (
    <div className={`${fonts} min-h-screen overflow-x-hidden`}>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4"
        style={{
          background: navBg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid",
          borderColor: navBorder,
        }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)" }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <span className="text-cyan-400 text-[11px] font-black" style={{ fontFamily: "var(--font-orbitron)" }}>OR</span>
          </motion.div>
          <motion.span
            className="text-sm font-bold text-slate-300 tracking-widest hidden sm:block"
            style={{ fontFamily: "var(--font-orbitron)" }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            ORBITAL RISK
          </motion.span>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Link href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-cyan-400 transition-all hover:bg-[rgba(34,211,238,0.12)]"
            style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)", fontFamily: "var(--font-orbitron)" }}
          >
            DASHBOARD <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </motion.nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5 pt-20 pb-16">

        {/* Animated mesh blobs */}
        {!shouldReduce && (
          <>
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: "clamp(400px, 60vw, 700px)",
                height: "clamp(400px, 60vw, 700px)",
                background: "radial-gradient(circle, rgba(34,211,238,0.055) 0%, transparent 70%)",
                filter: "blur(40px)",
                top: "5%", left: "10%",
              }}
              animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: "clamp(300px, 50vw, 600px)",
                height: "clamp(300px, 50vw, 600px)",
                background: "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)",
                filter: "blur(40px)",
                top: "30%", right: "5%",
              }}
              animate={{ x: [0, -25, 15, 0], y: [0, 15, -10, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: "clamp(250px, 40vw, 500px)",
                height: "clamp(250px, 40vw, 500px)",
                background: "radial-gradient(circle, rgba(16,185,129,0.03) 0%, transparent 70%)",
                filter: "blur(40px)",
                bottom: "10%", left: "35%",
              }}
              animate={{ x: [0, 20, -10, 0], y: [0, -15, 8, 0] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Orbital SVG behind text — with scroll parallax + mouse parallax */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ y: orbScrollY }}
        >
          <motion.div
            style={{
              width: "min(580px, 95vw)",
              height: "min(580px, 95vw)",
              opacity: 0.55,
              translateX: orbX,
              translateY: orbY,
            }}
          >
            <OrbitalSystem />
          </motion.div>
        </motion.div>

        {/* Radial fade */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 65% 55% at 50% 48%, transparent 35%, #020617 100%)" }} />

        {/* Dot grid — with mouse parallax */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle, #22d3ee 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            translateX: gridX,
            translateY: gridY,
          }}
        />

        {/* Text content — with scroll + mouse parallax */}
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto w-full"
          style={{
            y: heroScrollY,
            translateX: heroX,
            translateY: heroY,
          }}
        >
          <motion.p
            className="text-[9px] sm:text-[10px] tracking-[0.4em] text-cyan-400/60 uppercase mb-5"
            style={{ fontFamily: "var(--font-ibm-mono)" }}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Low Earth Orbit · Collision Risk · ML-Powered Analytics
          </motion.p>

          <motion.h1
            className="leading-none tracking-tight text-white mb-6"
            style={{
              fontFamily: "var(--font-orbitron)",
              fontSize: "clamp(2.8rem, 11vw, 7rem)",
              fontWeight: 900,
              lineHeight: 1.0,
            }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35 }}
          >
            <span className="block">ORBITAL</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(120deg, #22d3ee 0%, #6366f1 55%, #22d3ee 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-shift 5s ease infinite",
              }}
            >
              RISK
            </span>
            <span className="block">ANALYSIS</span>
          </motion.h1>

          <motion.p
            className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-10"
            style={{ fontFamily: "var(--font-ibm-mono)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            Monitoring{" "}
            <span className="text-cyan-400 font-bold">27,994</span>{" "}
            tracked objects. Predicting conjunction risk with Random Forest —{" "}
            <span className="text-emerald-400 font-bold">R² ≈ 0.98</span>.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
          >
            <Link href="/dashboard"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-black text-slate-950 transition-all hover:scale-105"
              style={{
                background: "#22d3ee",
                fontFamily: "var(--font-orbitron)",
                boxShadow: "0 0 30px rgba(34,211,238,0.35)",
                transition: "transform 0.2s var(--ease-spring), box-shadow 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#38e8ff"; el.style.boxShadow = "0 0 50px rgba(34,211,238,0.55)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#22d3ee"; el.style.boxShadow = "0 0 30px rgba(34,211,238,0.35)"; }}
            >
              ENTER DASHBOARD
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <div className="h-10 w-px" style={{ background: "linear-gradient(to bottom, rgba(34,211,238,0.5), transparent)", animation: "fade-in-up 1.5s ease-in-out infinite alternate" }} />
          <p className="text-[9px] tracking-[0.35em] text-slate-600 uppercase" style={{ fontFamily: "var(--font-ibm-mono)" }}>scroll</p>
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 px-5"
        style={{ background: "linear-gradient(180deg, transparent, rgba(34,211,238,0.015) 50%, transparent)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 text-center">
            {[
              { label: "TRACKED OBJECTS", node: <AnimatedNumber value={27994} /> },
              { label: "BAND-LEVEL R²",   node: <span>0.98</span> },
              { label: "RISK LEVELS",     node: <AnimatedNumber value={3} duration={800} /> },
            ].map(({ label, node }, i) => (
              <motion.div key={i}
                className="min-w-0 overflow-hidden"
                initial={{ opacity: 0, y: 32, scale: 0.92, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-5xl lg:text-6xl font-black text-cyan-400 mb-2"
                  style={{ fontFamily: "var(--font-orbitron)" }}>
                  {node}
                </p>
                <div className="h-px mb-3"
                  style={{ background: "linear-gradient(to right, transparent, rgba(34,211,238,0.35), transparent)" }} />
                <p className="text-[9px] tracking-[0.28em] text-slate-500 uppercase"
                  style={{ fontFamily: "var(--font-ibm-mono)" }}>
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-cyan-400/55 uppercase mb-4"
              style={{ fontFamily: "var(--font-ibm-mono)" }}>
              Platform Modules
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-white"
              style={{ fontFamily: "var(--font-orbitron)" }}>
              EXPLORE THE DATA
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
              >
                <Link href={feat.href}
                  className="group block h-full rounded-2xl p-6 transition-all duration-300"
                  style={{
                    background: "rgba(7,14,36,0.72)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(34,211,238,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${feat.color}35`;
                    el.style.boxShadow = `0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px ${feat.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(34,211,238,0.07)";
                    el.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl"
                      style={{ background: `${feat.color}12`, border: `1px solid ${feat.color}22` }}>
                      <feat.icon className="h-5 w-5" style={{ color: feat.color }} />
                    </div>
                    {feat.beta && (
                      <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(245,158,11,0.12)",
                          border: "1px solid rgba(245,158,11,0.25)",
                          color: "#f59e0b",
                          fontFamily: "var(--font-ibm-mono)",
                        }}>
                        BETA
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-white mb-2 tracking-widest"
                    style={{ fontFamily: "var(--font-orbitron)" }}>
                    {feat.title.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: feat.color, fontFamily: "var(--font-orbitron)" }}>
                    OPEN <ExternalLink className="h-2.5 w-2.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-cyan-400/55 uppercase mb-4"
              style={{ fontFamily: "var(--font-ibm-mono)" }}>
              Under The Hood
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-white"
              style={{ fontFamily: "var(--font-orbitron)" }}>
              HOW IT WORKS
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {PIPELINE.map((step, i) => (
              <motion.div key={i}
                className="relative rounded-2xl p-6"
                style={{
                  background: "rgba(7,14,36,0.72)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${step.color}18`,
                }}
                initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.65, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="absolute top-4 right-5 text-5xl font-black opacity-[0.07]"
                  style={{ fontFamily: "var(--font-orbitron)", color: step.color }}>
                  {step.step}
                </p>
                <div className="mb-4 h-10 w-10 flex items-center justify-center rounded-xl"
                  style={{ background: `${step.color}12` }}>
                  <step.icon className="h-5 w-5" style={{ color: step.color }} />
                </div>
                <h3 className="text-xs font-black text-white mb-2.5 tracking-widest"
                  style={{ fontFamily: "var(--font-orbitron)" }}>
                  {step.title.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 sm:py-36 px-5">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center rounded-3xl p-10 sm:p-16"
            style={{
              background: "radial-gradient(ellipse at top center, rgba(34,211,238,0.06) 0%, rgba(7,14,36,0.92) 68%)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(34,211,238,0.13)",
              boxShadow: "0 0 120px rgba(34,211,238,0.04)",
            }}
            initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-cyan-400/55 uppercase mb-6"
              style={{ fontFamily: "var(--font-ibm-mono)" }}>
              Ready to explore?
            </p>
            <h2 className="font-black text-white mb-4"
              style={{ fontFamily: "var(--font-orbitron)", fontSize: "clamp(1.6rem, 5vw, 2.5rem)" }}>
              START MONITORING<br />
              <span style={{ color: "#22d3ee" }}>ORBITAL RISK</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
              Explore 27,994 tracked LEO objects, analyze altitude band risk,
              and predict collision probability for any orbital configuration.
            </p>
            <Link href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-black text-slate-950 transition-all hover:scale-105"
              style={{
                background: "#22d3ee",
                fontFamily: "var(--font-orbitron)",
                boxShadow: "0 0 40px rgba(34,211,238,0.4)",
                transition: "transform 0.2s var(--ease-spring), box-shadow 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#38e8ff"; el.style.boxShadow = "0 0 60px rgba(34,211,238,0.6)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "#22d3ee"; el.style.boxShadow = "0 0 40px rgba(34,211,238,0.4)"; }}
            >
              ENTER DASHBOARD
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-8 px-5" style={{ borderTop: "1px solid rgba(34,211,238,0.06)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-600 tracking-widest"
            style={{ fontFamily: "var(--font-orbitron)" }}>
            ORBITAL RISK ANALYSIS
          </span>
          <p className="text-xs text-slate-600">
            Developed by{" "}
            <span className="text-slate-400 font-medium">Lucas Muller</span>
            {" & "}
            <span className="text-slate-400 font-medium">Giovanna Pagnussatt</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
