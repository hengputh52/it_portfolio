"use client";

import { useEffect, useRef } from "react";
import { gsap, onVelocity, prefersReducedMotion, useGSAP } from "@/lib/motion";

/**
 * Horizontal motion-blur filters, referenced by the `pass` keyframes in globals.css
 * (`.mblur-hover` → `.mblur-target`) and by the car-style entrances.
 */
export function MotionBlurDefs() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
      <defs>
        <filter id="mblur-1" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation="3 0" /></filter>
        <filter id="mblur-2" x="-15%" y="0" width="130%" height="100%"><feGaussianBlur stdDeviation="8 0" /></filter>
        <filter id="mblur-3" x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation="16 0" /></filter>
      </defs>
    </svg>
  );
}

/**
 * Side profile of an F1 car, facing right. Wheels are separate groups
 * (`[data-wheel]`) so they can spin, and the rain light (`[data-brake]`) can glow.
 */
export function CarSilhouette({ className = "", color = "var(--red)" }: { className?: string; color?: string }) {
  const wheel = (cx: number) => (
    <g data-wheel data-cx={cx}>
      <circle cx={cx} cy="25" r="7" fill="#0b0b0c" stroke="#3a3c40" strokeWidth="1.2" />
      <path d={`M${cx - 4.5} 25 H${cx + 4.5} M${cx} 20.5 V29.5`} stroke="#8c9096" strokeWidth="1.1" />
    </g>
  );
  return (
    <svg viewBox="0 0 124 34" className={className} aria-hidden="true">
      {/* rear wing and its rain light */}
      <path d="M3 7 H15 V10 H9 V21 H6 V10 H3 Z" fill="#1c1d21" />
      <rect data-brake x="1" y="11" width="3" height="3" fill="var(--red)" opacity="0.35" />
      {/* floor, sidepod, engine cover, nose */}
      <path d="M10 26 H112 L114 24 L104 21 L84 19 L74 12 L64 9 L56 10 L46 16 L30 17 L16 19 L10 22 Z" fill={color} />
      <path d="M46 16 L56 10 L64 9 L74 12 L84 19 H52 Z" fill="rgb(0 0 0 / 0.25)" />
      {/* airbox and halo with the driver's helmet */}
      <path d="M50 12 L56 6 H60 L62 9 L56 10 Z" fill="#1c1d21" />
      <circle cx="66" cy="10" r="3.4" fill="var(--paddock)" />
      <path d="M60 11 Q66 4 74 12" fill="none" stroke="#0b0b0c" strokeWidth="1.6" />
      {/* front wing */}
      <path d="M104 26 H122 V28 H104 Z M116 22 H122 V26 H116 Z" fill="#1c1d21" />
      {/* car number */}
      <text x="94" y="23" fill="var(--paddock)" fontSize="5" fontFamily="var(--font-display)" fontWeight="900">52</text>
      {wheel(25)}
      {wheel(95)}
    </svg>
  );
}

/**
 * Speed-line transitions: a full-screen overlay of streaks whose strength follows
 * scroll speed. Scroll gently and nothing shows; scroll hard and the page rushes past.
 */
export function SpeedOverlay() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const set = gsap.quickTo(el, "opacity", { duration: 0.35, ease: "power2.out" });
    return onVelocity((v) => set(Math.min(0.7, Math.max(0, (Math.abs(v) - 8) / 45))));
  }, []);
  return <div ref={ref} className="speedlines pointer-events-none fixed inset-0 z-[41] opacity-0 motion-reduce:hidden" aria-hidden="true" />;
}

/** Section divider: a thin checkered strip. */
export function CheckerStrip({ className = "" }: { className?: string }) {
  return <div className={`checker h-2 [--sq:8px] opacity-80 ${className}`} aria-hidden="true" />;
}

/**
 * Camera flash on reveal: the first time `ref` scrolls into view, a flash goes off
 * over it (add a `.flash-layer` child). Works for the horizontal season calendar too,
 * because IntersectionObserver sees transformed positions.
 */
export function useCameraFlash<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-flashed");
        io.disconnect();
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/**
 * Section heading. The title launches in like a car off the line: it arrives at
 * speed with motion blur, then brakes hard into place.
 */
export function SectionHeading({
  tag,
  title,
  dark = true,
  children,
}: {
  tag: string;
  title: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const h2 = ref.current.querySelector("h2");
      gsap
        .timeline({ scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } })
        .set(h2, { filter: "url(#mblur-3)" })
        .fromTo(h2, { x: -140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, 0)
        .set(h2, { filter: "url(#mblur-1)" }, 0.18)
        .set(h2, { clearProps: "filter" }, 0.34)
        .fromTo("[data-bar]", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.out" }, 0.1);
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="mb-12 sm:mb-14">
      <div className="flex items-center gap-3 mb-4">
        <span data-bar className="block w-8 h-[3px] origin-left bg-red" />
        <p className={`label text-xs ${dark ? "text-concrete" : "text-sand-ink/60"}`}>{tag}</p>
      </div>
      <h2 className={`display text-[clamp(2.4rem,7vw,5.5rem)] ${dark ? "text-paddock" : "text-sand-ink"}`}>{title}</h2>
      {children && <div className={`mt-5 text-lg leading-relaxed max-w-[58ch] ${dark ? "text-paddock/70" : "text-sand-ink/75"}`}>{children}</div>}
    </div>
  );
}
