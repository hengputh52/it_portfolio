"use client";

import { useEffect, useRef, useState } from "react";
import { me } from "@/lib/data";
import type { Track } from "@/lib/music";
import { gsap, onVelocity, prefersReducedMotion, scrollToId, ScrollTrigger, useGSAP } from "@/lib/motion";
import { startAudio, stopAudio } from "@/lib/audio";
import { CarSilhouette } from "@/components/fx";

const CHAPTERS = [
  { id: "driver", no: "01", label: "Driver" },
  { id: "races",  no: "02", label: "Races" },
  { id: "setup",  no: "03", label: "Setup" },
  { id: "radio",  no: "04", label: "Radio" },
];
const LAPS = 57;

/**
 * The soundtrack. Plays the files from public/music in order, looping, with a
 * short fade in and out. With no files, falls back to the synthesised ambience.
 * Nothing loads or plays until the visitor turns it on.
 */
function useSoundtrack(tracks: Track[]) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fadeTween = useRef<gsap.core.Tween | null>(null);
  const failures = useRef(0);
  const [on, setOn] = useState(false);
  const [index, setIndex] = useState(0);

  const fadeTo = (volume: number, done?: () => void) => {
    const a = audio.current;
    if (!a) return;
    fadeTween.current?.kill();
    fadeTween.current = gsap.to(a, { volume, duration: 0.8, ease: "sine.inOut", onComplete: done });
  };

  const load = (i: number) => {
    const a = audio.current;
    if (!a || !tracks.length) return;
    setIndex(i);
    a.src = tracks[i].src;
    a.play().catch(() => {});
  };

  const next = () => load((index + 1) % tracks.length);

  // keep the "ended" and "error" handlers pointing at the current index
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const ended = () => {
      failures.current = 0;
      load((index + 1) % tracks.length);
    };
    const error = () => {
      // skip files the browser can't play, but stop if none of them work
      failures.current += 1;
      if (failures.current < tracks.length) load((index + 1) % tracks.length);
      else setOn(false);
    };
    a.addEventListener("ended", ended);
    a.addEventListener("error", error);
    return () => {
      a.removeEventListener("ended", ended);
      a.removeEventListener("error", error);
    };
  });

  const toggle = () => {
    if (!tracks.length) {
      if (on) stopAudio();
      else startAudio();
      setOn(!on);
      return;
    }
    if (on) {
      fadeTo(0, () => audio.current?.pause());
      setOn(false);
      return;
    }
    if (!audio.current) {
      audio.current = new Audio();
      audio.current.preload = "auto";
      audio.current.volume = 0;
      setOn(true);
      load(index);
    } else {
      audio.current.play().catch(() => {});
      setOn(true);
    }
    fadeTo(0.7);
  };

  useEffect(
    () => () => {
      fadeTween.current?.kill();
      audio.current?.pause();
      stopAudio();
    },
    [],
  );

  return { on, toggle, next, title: tracks.length ? tracks[index]?.title : null, hasTracks: tracks.length > 0 };
}

/**
 * Scroll progress as a race: a car drives along a line under the nav.
 * Its wheels spin with scroll speed, the rain light glows when you scroll back up,
 * and the lap counter ticks over as you go down the page.
 */
function RaceProgress() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const lap = el.querySelector<HTMLElement>("[data-lap]")!;
    const wheels = el.querySelectorAll<SVGGElement>("[data-wheel]");
    const brake = el.querySelector<SVGRectElement>("[data-brake]")!;
    const reduced = prefersReducedMotion();
    let last = -1;
    let spin = 0;

    const set = (p: number) => {
      const c = Math.min(1, Math.max(0, p));
      el.style.setProperty("--p", c.toFixed(4));
      const n = Math.min(LAPS, 1 + Math.floor(c * (LAPS - 1)));
      if (n !== last) {
        last = n;
        lap.textContent = String(n).padStart(2, "0");
      }
    };
    const max = document.documentElement.scrollHeight - window.innerHeight;
    set(max > 0 ? window.scrollY / max : 0);

    return onVelocity((v, p) => {
      set(p);
      if (reduced) return;
      spin += v * 6;
      wheels.forEach((w) => gsap.set(w, { rotation: spin, svgOrigin: `${w.dataset.cx} 25` }));
      brake.setAttribute("opacity", v < -1 ? "1" : "0.35");
    });
  }, []);

  return (
    <div ref={root} className="page relative h-7 flex items-center gap-4" aria-hidden="true">
      <div className="relative flex-1 h-full">
        {/* the track line, filled red behind the car */}
        <div className="absolute inset-x-0 bottom-1.5 h-px bg-white/10" />
        <div className="absolute left-0 bottom-1.5 h-px w-full bg-red origin-left" style={{ transform: "scaleX(var(--p, 0))" }} />
        <div className="absolute inset-x-0 bottom-0 h-full" style={{ transform: "translateX(calc(var(--p, 0) * 100%))" }}>
          <div className="absolute left-0 bottom-0 w-14" style={{ transform: "translateX(calc(var(--p, 0) * -3.5rem))" }}>
            <CarSilhouette className="w-full h-auto drop-shadow-[0_2px_6px_rgba(225,6,0,0.35)]" />
          </div>
        </div>
        {/* chequered flag at the finish */}
        <div className="absolute right-0 bottom-1.5 w-3 h-3 checker [--sq:3px]" />
      </div>
      <p className="font-mono text-[11px] text-concrete tabular shrink-0">
        LAP <span data-lap className="text-paddock">01</span>/{LAPS}
      </p>
    </div>
  );
}

function AudioIcon({ on }: { on: boolean }) {
  return (
    <span className={`flex items-end gap-[2px] h-3.5 ${on ? "" : "wave-paused"}`} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="wave-bar block w-[2px] h-full bg-current" style={{ animationDelay: `${i * 0.13}s` }} />
      ))}
    </span>
  );
}

/** Navigation as a pit-wall strip: chapters with status lights, the soundtrack, race progress. */
export function PitWall({ tracks }: { tracks: Track[] }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>("");
  const sound = useSoundtrack(tracks);

  useGSAP(
    () => {
      CHAPTERS.forEach((c) => {
        const el = document.getElementById(c.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          // created before the pinned season calendar, so measure after it has added its scroll distance
          refreshPriority: -1,
          onToggle: (self) => {
            if (self.isActive) setActive(c.id);
            else setActive((cur) => (cur === c.id ? "" : cur));
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.07]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-2.5">
        <button type="button" onClick={() => scrollToId("grid")} className="order-1 flex items-center gap-2.5 group" aria-label="Back to the start grid">
          <span className="grid place-items-center w-8 h-8 bg-red [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)]">
            <span className="display text-[12px] text-paddock leading-none">{me.number}</span>
          </span>
          <span className="label text-[13px] text-paddock">{me.short}</span>
        </button>

        <nav aria-label="Chapters" className="order-3 md:order-2 w-full md:w-auto">
          <ol className="flex items-center justify-between md:justify-center gap-1 sm:gap-6">
            {CHAPTERS.map((c) => {
              const on = active === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(c.id)}
                    aria-current={on ? "true" : undefined}
                    className="checker-hover flex items-center gap-2 px-1.5 py-1"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${on ? "bg-green shadow-[0_0_8px_var(--green)]" : "bg-white/20"}`} aria-hidden="true" />
                    <span className={`label text-[12px] sm:text-[13px] transition-colors ${on ? "text-paddock" : "text-paddock/55 hover:text-paddock"}`}>{c.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="order-2 md:order-3 flex items-center gap-2">
          {sound.on && sound.title && (
            <>
              <p className="hidden lg:block font-mono text-[11px] text-concrete max-w-[11rem] truncate" aria-live="polite">
                ♪ {sound.title}
              </p>
              <button
                type="button"
                onClick={sound.next}
                aria-label="Next track"
                className="grid place-items-center w-8 h-8 border border-white/10 text-paddock/70 hover:text-paddock hover:border-white/25"
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3" aria-hidden="true">
                  <path d="M2 2 L10 8 L2 14 Z M11 2 H14 V14 H11 Z" fill="currentColor" />
                </svg>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={sound.toggle}
            aria-pressed={sound.on}
            aria-label={sound.on ? "Turn sound off" : "Turn sound on"}
            title={sound.hasTracks ? "Play the soundtrack" : "Distant engines, the crowd and team radio"}
            className={`flex items-center gap-2 h-8 px-3 border transition-colors ${
              sound.on ? "border-papaya/60 text-papaya" : "border-white/10 text-paddock/70 hover:text-paddock hover:border-white/25"
            }`}
          >
            <AudioIcon on={sound.on} />
            <span className="label text-[11px] hidden sm:inline">{sound.on ? "Sound on" : "Sound off"}</span>
          </button>
        </div>
      </div>
      <RaceProgress />
    </header>
  );
}
