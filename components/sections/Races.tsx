"use client";

import { useEffect, useRef, useState } from "react";
import { lapSeconds, races, type Race } from "@/lib/data";
import { CarSilhouette, SectionHeading, useCameraFlash } from "@/components/fx";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";

// ---------- derived timing ----------
const fastest = Math.min(...races.map((r) => lapSeconds(r.lap)));
const gapOf = (r: Race) => lapSeconds(r.lap) - fastest;
const classification = [...races].sort((a, b) => a.result - b.result);
const PODIUM: Record<number, string> = { 1: "var(--gold)", 2: "var(--silver)", 3: "var(--bronze)" };

function ResultBadge({ result }: { result: number }) {
  const metal = PODIUM[result];
  return metal ? (
    <span className="glint display text-xl text-black px-2.5 py-1" style={{ background: `linear-gradient(135deg, ${metal}, #fff 45%, ${metal} 60%)` }}>
      P{result}
    </span>
  ) : (
    <span className="display text-xl text-paddock/80 border border-white/15 px-2.5 py-0.5">P{result}</span>
  );
}

/** A race-weekend card: the Grand Prix, its result, best lap, car setup and race report. */
function RaceCard({ r, className = "" }: { r: Race; className?: string }) {
  const flash = useCameraFlash<HTMLElement>();
  const gap = gapOf(r);
  const metal = PODIUM[r.result];
  return (
    <article
      ref={flash}
      data-card
      className={`mblur-hover group relative flex flex-col bg-carbon border transition-colors ${metal ? "" : "border-white/[0.08] hover:border-white/25"} ${className}`}
      style={metal ? { borderColor: `color-mix(in srgb, ${metal} 45%, transparent)` } : undefined}
      aria-labelledby={`race-${r.id}`}
    >
      <div className="h-1" style={{ background: r.livery }} aria-hidden="true" />
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <p className="label text-[10px] text-concrete">
            Round {String(r.round).padStart(2, "0")} · {r.year}
            {r.status && <span className="ml-2 text-green">● {r.status}</span>}
          </p>
          <h3 id={`race-${r.id}`} className="display text-[1.75rem] text-paddock mt-2">
            {r.gp}
            <span className="sr-only"> Grand Prix</span>
          </h3>
        </div>
        <ResultBadge result={r.result} />
      </header>

      {/* onboard shot: motion blur and a light sweep on hover */}
      <div className="sweep relative mx-5 mt-4 overflow-hidden aspect-[2/1] bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={r.imageSrc} alt={`${r.gp} screenshot`} loading="lazy" className="mblur-target w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        <div className="flash-layer" />
      </div>

      <dl className="grid grid-cols-2 mx-5 mt-4 border-b border-white/[0.08] pb-3">
        <div>
          <dt className="label text-[10px] text-concrete">Best lap</dt>
          <dd className={`num text-lg mt-0.5 ${gap === 0 ? "text-purple" : "text-paddock"}`}>{r.lap}</dd>
        </div>
        <div>
          <dt className="label text-[10px] text-concrete">Gap</dt>
          <dd className={`num text-lg mt-0.5 ${gap === 0 ? "text-purple" : "text-amber"}`}>{gap === 0 ? "Fastest" : `+${gap.toFixed(3)}s`}</dd>
        </div>
      </dl>

      <ul className="flex flex-wrap gap-1.5 px-5 mt-4" aria-label="Tech stack">
        {r.setup.map((s) => (
          <li key={s} className="font-mono text-[11px] text-paddock/85 bg-white/[0.05] px-2 py-0.5">{s}</li>
        ))}
      </ul>

      <p className="text-[15px] leading-relaxed text-paddock/70 px-5 mt-4 flex-1">{r.report}</p>

      <div className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-5">
        <a href={r.source} target="_blank" rel="noopener noreferrer" className="checker-hover label text-[12px] text-paddock hover:text-papaya">
          Source &#8599;
        </a>
        {r.demo && (
          <a href={r.demo} target="_blank" rel="noopener noreferrer" className="checker-hover label text-[12px] text-paddock hover:text-papaya">
            Watch it live &#8599;
          </a>
        )}
      </div>
    </article>
  );
}

/** Live timing classification for the season. */
function Classification() {
  return (
    <div className="border border-white/[0.08] overflow-x-auto">
      <table className="w-full min-w-[520px] text-left">
        <caption className="label text-[11px] text-concrete text-left px-4 py-3 border-b border-white/[0.08]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red blink mr-2 align-middle" aria-hidden="true" />
          Live timing · Classification
        </caption>
        <thead>
          <tr className="label text-[10px] text-concrete">
            <th scope="col" className="px-4 py-2 font-bold">Pos</th>
            <th scope="col" className="px-2 py-2 font-bold">Grand Prix</th>
            <th scope="col" className="px-2 py-2 font-bold">Year</th>
            <th scope="col" className="px-2 py-2 font-bold text-right">Best lap</th>
            <th scope="col" className="px-2 py-2 font-bold text-right">Gap</th>
            <th scope="col" className="px-4 py-2 font-bold text-right">+/−</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[13px]">
          {classification.map((r) => {
            const gap = gapOf(r);
            return (
              <tr key={r.id} className="border-t border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-2.5">
                    <span className="w-0.5 h-4" style={{ background: r.livery }} aria-hidden="true" />
                    <span className="num text-base" style={{ color: PODIUM[r.result] }}>{r.result}</span>
                  </span>
                </td>
                <td className="px-2 py-2.5 label text-[14px] text-paddock tracking-[0.08em]">{r.gp}</td>
                <td className="px-2 py-2.5 text-concrete">{r.year}</td>
                <td className={`px-2 py-2.5 text-right tabular ${gap === 0 ? "text-purple" : "text-paddock"}`}>{r.lap}</td>
                <td className="px-2 py-2.5 text-right tabular text-amber">{gap === 0 ? <span className="text-purple">—</span> : `+${gap.toFixed(3)}`}</td>
                <td className={`px-4 py-2.5 text-right ${r.gained > 0 ? "text-green" : "text-concrete"}`}>{r.gained > 0 ? `▲${r.gained}` : "="}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Projects: race results. The cards run as a season calendar you scroll sideways. */
export function Races() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"calendar" | "grid">("calendar");

  const setProgress = (p: number) => {
    bar.current?.style.setProperty("--season", String(Math.min(1, Math.max(0, p))));
  };

  // the circuit photo drifts slower than the page
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-circuit]", { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: "[data-circuit-wrap]", start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );

  // Calendar on wide, tall screens with motion: pin and scroll the cards sideways.
  // Everywhere else the calendar is a native horizontal swipe with snap points.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (view === "grid") {
        // grid view: cards line up like a starting grid, launching in pairs
        gsap.from("[data-card]", {
          x: -80,
          opacity: 0,
          duration: 0.7,
          ease: "expo.out",
          stagger: { each: 0.08, grid: "auto" },
          scrollTrigger: { trigger: "[data-grid]", start: "top 85%", once: true },
        });
        return;
      }
      const mm = gsap.matchMedia();
      // only pin when a whole card fits on screen; shorter windows swipe instead
      mm.add("(min-width: 1024px) and (min-height: 800px)", () => {
        const el = track.current!;
        el.dataset.pinned = "true"; // turns off the native sideways scroll while pinned
        const distance = () => el.scrollWidth - window.innerWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top+=96",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
        });
        return () => {
          delete el.dataset.pinned;
        };
      });
    },
    { scope: root, dependencies: [view], revertOnUpdate: true },
  );

  // positions further down the page change when the view switches
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [view]);

  const onNativeScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    if (max > 0) setProgress(el.scrollLeft / max);
  };

  const gutter = "max(clamp(1rem, 5vw, 3rem), calc((100vw - 1280px) / 2 + clamp(1rem, 5vw, 3rem)))";

  return (
    <section id="races" ref={root} className="relative bg-black pb-24 sm:pb-32" aria-labelledby="races-title">
      {/* the circuit, as a photo band behind the heading */}
      <div data-circuit-wrap className="relative overflow-hidden pt-40 sm:pt-56 pb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-circuit
          src="/img/track/circuit.jpg"
          alt=""
          loading="lazy"
          aria-hidden="true"
          className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover object-[50%_55%] saturate-[0.6] brightness-[0.55]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_10_11/0.35),rgb(10_10_11/0.6)_55%,var(--black))]" aria-hidden="true" />
        <div id="races-title" className="page relative">
          <SectionHeading tag={`02 · Season ${races[0].year}–${races[races.length - 1].year}`} title="Race results">
            Every project as a Grand Prix: the car setup, a race report, and where it finished.
          </SectionHeading>
        </div>
      </div>

      <div className="page">
        <Classification />

        <div className="flex flex-wrap items-center justify-between gap-4 mt-16 mb-6">
          <h3 className="label text-sm text-paddock">Season calendar</h3>
          <div role="group" aria-label="Project layout" className="flex border border-white/15">
            {(["calendar", "grid"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`label text-[11px] px-4 py-2 transition-colors ${view === v ? "bg-paddock text-black" : "text-paddock/60 hover:text-paddock"}`}
              >
                {v === "calendar" ? "Calendar" : "Grid"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <div ref={pin} className="relative">
          <div
            ref={track}
            onScroll={onNativeScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 data-[pinned=true]:overflow-visible data-[pinned=true]:snap-none [scrollbar-width:none]"
            style={{ paddingInline: gutter }}
          >
            {races.map((r) => (
              <RaceCard key={r.id} r={r} className="snap-start shrink-0 w-[min(84vw,370px)]" />
            ))}
            <div className="snap-start shrink-0 w-[min(60vw,220px)] flex flex-col justify-center items-start gap-4 pr-6" aria-hidden="true">
              <div className="checker w-20 h-12 [--sq:12px]" />
              <p className="display text-xl text-paddock">Season<br />complete</p>
            </div>
          </div>
          {/* season progress: a car drives from round 1 to the flag */}
          <div className="page mt-6" aria-hidden="true">
            <div ref={bar} className="relative h-6">
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
              <div className="absolute left-0 bottom-0 h-px w-full bg-red origin-left" style={{ transform: "scaleX(var(--season, 0))" }} />
              <div className="absolute inset-0" style={{ transform: "translateX(calc(var(--season, 0) * 100%))" }}>
                <div className="absolute bottom-0 left-0 w-12" style={{ transform: "translateX(calc(var(--season, 0) * -3rem))" }}>
                  <CarSilhouette className="w-full h-auto" />
                </div>
              </div>
              {races.map((r, i) => (
                <span key={r.id} className="absolute -bottom-5 font-mono text-[10px] text-concrete -translate-x-1/2" style={{ left: `${(i / (races.length - 1)) * 100}%` }}>
                  R{String(r.round).padStart(2, "0")}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="page">
          <div data-grid className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {races.map((r) => (
              <RaceCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
