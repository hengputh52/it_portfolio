"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { emitVelocity, gsap, prefersReducedMotion, ScrollTrigger, setLenis } from "@/lib/motion";

const progressOf = (y: number) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? y / max : 0;
};

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll() {
  useEffect(() => {
    // Reduced motion: keep native scrolling, still report velocity for the meters.
    if (prefersReducedMotion()) {
      let last = window.scrollY;
      const onScroll = () => {
        const y = window.scrollY;
        emitVelocity(y - last, progressOf(y));
        last = y;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({ lerp: 0.085, anchors: true, autoRaf: false });
    setLenis(lenis);

    lenis.on("scroll", (l: Lenis) => {
      ScrollTrigger.update();
      emitVelocity(l.velocity, l.progress);
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
