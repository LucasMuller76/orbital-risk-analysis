"use client";

// Van der Corput low-discrepancy sequence — deterministic, uniform, no hydration mismatch
function vdc(n: number, base: number): number {
  let result = 0, f = 1;
  while (n > 0) { f /= base; result += f * (n % base); n = Math.floor(n / base); }
  return result;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  glow: boolean;
  color: string;
}

// Pre-computed at module level — same on server and client, no hydration diff
const STARS: Star[] = Array.from({ length: 110 }, (_, i) => {
  const bright = i % 9 === 0;
  const medium = i % 4 === 0;
  const blueTint = i % 7 === 0;
  return {
    id: i,
    x: vdc(i + 1, 2) * 100,
    y: vdc(i + 1, 3) * 100,
    size: bright ? 2 + vdc(i + 1, 5) * 0.6 : medium ? 1.2 + vdc(i + 1, 7) * 0.4 : 0.5 + vdc(i + 1, 11) * 0.5,
    opacity: bright ? 0.55 + vdc(i + 1, 13) * 0.3 : medium ? 0.25 + vdc(i + 1, 17) * 0.3 : 0.08 + vdc(i + 1, 19) * 0.18,
    duration: 3 + vdc(i + 1, 23) * 6,
    delay: vdc(i + 1, 29) * 9,
    glow: bright,
    color: blueTint ? "rgba(180, 215, 255, 0.9)" : "rgba(255, 255, 255, 0.88)",
  };
});

export function SpaceBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Deep space radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(5, 18, 52, 0.75) 0%, rgba(2, 6, 23, 0.5) 55%, transparent 100%)",
        }}
      />

      {/* Star field */}
      {STARS.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            opacity: star.opacity,
            boxShadow: star.glow ? `0 0 ${star.size * 3}px ${star.color}` : undefined,
            // CSS custom properties consumed by the .twinkle keyframe via inline animation
            animation: `twinkle ${star.duration}s ${star.delay}s infinite alternate ease-in-out`,
            "--tw-star-lo": String(star.opacity * 0.25),
            "--tw-star-hi": String(Math.min(star.opacity * 1.8, 1)),
          } as React.CSSProperties}
        />
      ))}

      {/* Orbital decorations — SVG paths and rings */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large orbit ring — lower right */}
        <ellipse
          cx="1280"
          cy="820"
          rx="440"
          ry="170"
          stroke="rgba(34, 211, 238, 0.05)"
          strokeWidth="1"
          strokeDasharray="6 5"
          transform="rotate(-18 1280 820)"
        />
        <ellipse
          cx="1280"
          cy="820"
          rx="545"
          ry="220"
          stroke="rgba(34, 211, 238, 0.028)"
          strokeWidth="1"
          transform="rotate(-18 1280 820)"
        />

        {/* Medium orbit ring — upper left */}
        <ellipse
          cx="130"
          cy="110"
          rx="310"
          ry="125"
          stroke="rgba(129, 140, 248, 0.045)"
          strokeWidth="1"
          strokeDasharray="4 8"
          transform="rotate(22 130 110)"
        />

        {/* Trajectory arc — top right → center right */}
        <path
          d="M 900 -60 Q 1380 220 1130 580"
          stroke="rgba(34, 211, 238, 0.07)"
          strokeWidth="1"
          strokeDasharray="5 10"
        />
        {/* Satellite marker */}
        <circle cx="1080" cy="520" r="2.5" fill="rgba(34, 211, 238, 0.40)" />
        <circle cx="1080" cy="520" r="5.5" fill="none" stroke="rgba(34, 211, 238, 0.18)" strokeWidth="1" />

        {/* Trajectory arc — bottom left */}
        <path
          d="M -60 540 Q 200 290 550 400"
          stroke="rgba(129, 140, 248, 0.06)"
          strokeWidth="1"
          strokeDasharray="4 12"
        />
        <circle cx="550" cy="400" r="2" fill="rgba(129, 140, 248, 0.35)" />
        <circle cx="550" cy="400" r="5" fill="none" stroke="rgba(129, 140, 248, 0.14)" strokeWidth="1" />

        {/* Small crossing trajectory */}
        <path
          d="M 600 900 Q 900 600 1440 400"
          stroke="rgba(34, 211, 238, 0.03)"
          strokeWidth="1"
          strokeDasharray="3 14"
        />
      </svg>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: "linear-gradient(to top, rgba(2, 6, 23, 0.6) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
