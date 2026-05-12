"use client";
import { useEffect } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function useMouseParallax(strength = 1) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const shouldReduce = useReducedMotion();

  const x = useSpring(rawX, { stiffness: 40, damping: 18, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 40, damping: 18, mass: 0.8 });

  useEffect(() => {
    if (shouldReduce) return;
    const handleMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2 * strength;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2 * strength;
      rawX.set(nx);
      rawY.set(ny);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [rawX, rawY, strength, shouldReduce]);

  return { x, y };
}
