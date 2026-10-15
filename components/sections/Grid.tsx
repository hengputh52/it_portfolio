"use client";

import { useEffect, useRef, useState } from "react";
import { me } from "@/lib/data";
import { CarSilhouette } from "@/components/fx";
import { gsap, prefersReducedMotion, scrollToId, useGSAP } from "@/lib/motion";

/** Five pairs of red lights. They come on one by one, then all go out. */
function StartLights({ onOut }: { onOut: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      const cols = gsap.utils.toArray<HTMLElement>("[data-col]", ref.current);
      if (prefersReducedMotion()) {
        onOut();
        return;
      }
      const tl = gsap.timeline({ delay: 0.6 });
      cols.forEach((col, i) => tl.set(col, { attr: { "data-on": "true" } }, i * 0.4));
      tl.set(cols, { attr: { "data-on": "false" } }, `+=${gsap.utils.random(0.5, 1)}`).call(onOut);
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="inline-flex gap-1.5 p-1.5 bg-black/70 backdrop-blur-sm border border-white/10" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} data-col data-on="false" className="group flex flex-col gap-1 p-1 bg-white/[0.04] rounded-sm">
          {[0, 1].map((j) => (
            <span
              key={j}
              className="block w-3.5 h-3.5 rounded-full bg-[#2a0605] transition-[background-color,box-shadow] duration-75 group-data-[on=true]:bg-red group-data-[on=true]:shadow-[0_0_12px_3px_rgba(225,6,0,0.7)]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Three live readouts. Decorative: values wander like real telemetry once the race starts. */
function Telemetry({ racing }: { racing: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !racing || prefersReducedMotion()) return;
    const q = (k: string) => el.querySelector<HTMLElement>(`[data-t="${k}"]`)!;
    const speed = q("speed");
    const gear = q("gear");
    const thr = q("thr");
    const start = performance.now();
    const id = setInterval(() => {
      const phase = (((performance.now() - start) / 1000) % 6) / 6;
      const braking = phase > 0.78 && phase < 0.9;
      const v = braking ? 312 - (phase - 0.78) * 1500 : 140 + Math.min(1, phase / 0.78) * 178;
      speed.textContent = String(Math.round(v));
      gear.textContent = String(Math.max(2, Math.min(8, Math.round(v / 40))));
      thr.style.transform = `scaleX(${braking ? 0.02 : Math.min(1, 0.55 + phase)})`;
    }, 90);
    return () => clearInterval(id);
  }, [racing]);

  return (
    <div ref={ref} className="grid grid-cols-3 gap-6 sm:gap-10 max-w-md" aria-hidden="true">
      <div>
        <p className="label text-[10px] text-concrete">Speed</p>
        <p className="num text-2xl sm:text-3xl text-paddock"><span data-t="speed">0</span><span className="unit">km/h</span></p>
      </div>
      <div>
        <p className="label text-[10px] text-concrete">Gear</p>
        <p className="num text-2xl sm:text-3xl text-papaya" data-t="gear">N</p>
      </div>
      <div>
        <p className="label text-[10px] text-concrete">Throttle</p>
        <div className="mt-3 h-1.5 bg-white/15 overflow-hidden">
          <span data-t="thr" className="block h-full bg-green origin-left transition-transform duration-100" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
}

/** Hero: the start grid, on a real race photo. */
export function Grid() {
  const root = useRef<HTMLElement>(null);
  const [out, setOut] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the camera settles onto the shot, then drifts a little as you scroll (parallax)
      gsap.fromTo("[data-photo]", { scale: 1.14, xPercent: -2 }, { scale: 1.04, xPercent: 0, duration: 2.6, ease: "power3.out" });
      gsap.to("[data-photo-wrap]", { yPercent: 18, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      // name and lines arrive like cars off the line: fast, blurred, braking hard
      gsap
        .timeline({ defaults: { ease: "expo.out" }, delay: 0.15 })
        .set("[data-arrive]", { filter: "url(#mblur-3)" })
        .from("[data-arrive]", { x: -140, opacity: 0, duration: 0.9, stagger: 0.07 }, 0)
        .set("[data-arrive]", { filter: "url(#mblur-1)" }, 0.3)
        .set("[data-arrive]", { clearProps: "filter" }, 0.55);
    },
    { scope: root },
  );

  // Lights out: a car blasts across the frame, speed lines burst, the camera jolts once
  useGSAP(
    () => {
      if (!out || prefersReducedMotion()) return;
      const car = root.current?.querySelector<HTMLElement>("[data-pass]");
      if (car) {
        gsap
          .timeline()
          .set(car, { xPercent: -120, left: "0%", opacity: 1, filter: "url(#mblur-3)" })
          .to(car, { left: "100%", xPercent: 20, duration: 1.1, ease: "power2.in" })
          .set(car, { opacity: 0 });
        car.querySelectorAll<SVGGElement>("[data-wheel]").forEach((w) =>
          gsap.fromTo(w, { rotation: 0 }, { rotation: 1800, svgOrigin: `${w.dataset.cx} 25`, duration: 1.1, ease: "power2.in" }),
        );
      }
      gsap.fromTo("[data-burst]", { opacity: 0.9 }, { opacity: 0, duration: 1.4, ease: "power2.out" });
      gsap.fromTo("[data-photo]", { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      gsap.from("[data-go]", { x: 40, opacity: 0, duration: 0.6, ease: "expo.out", delay: 0.2 });
    },
    { scope: root, dependencies: [out] },
  );

  return (
    <section id="grid" ref={root} className="relative min-h-[100svh] overflow-hidden bg-black flex flex-col" aria-labelledby="driver-name">
      {/* the photo, black and white, so the red accents carry the colour */}
      <div data-photo-wrap className="absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-photo
          src="/img/track/hero.jpg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-[50%_70%] grayscale contrast-[1.1] brightness-[0.8]"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_10_11/0.92)_0%,rgb(10_10_11/0.55)_38%,rgb(10_10_11/0.25)_62%,rgb(10_10_11/0.95)_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(10_10_11/0.7),transparent_60%)]" aria-hidden="true" />
      <div data-burst className="speedlines absolute inset-0 opacity-0" aria-hidden="true" />

      {/* the car that goes past at lights out */}
      <div data-pass className="absolute bottom-[2%] w-[min(56vw,560px)] opacity-0 pointer-events-none motion-reduce:hidden" aria-hidden="true">
        {/* light trail streaming behind the car */}
        <div className="absolute right-[85%] top-[45%] h-[28%] w-[80vw] bg-[linear-gradient(270deg,rgb(225_6_0/0.55),rgb(225_6_0/0.15)_40%,transparent)] blur-[6px]" />
        <CarSilhouette className="relative w-full h-auto" />
      </div>

      <div className="page relative z-10 flex-1 flex flex-col pt-32 sm:pt-28 pb-10">
        <div className="flex items-center justify-between gap-4">
          <p className="label text-[11px] text-paddock/60">
            Round 01 · {me.location} · <span className={out ? "text-green" : "text-red"}>{out ? "Green flag" : "Formation lap"}</span>
          </p>
          <StartLights onOut={() => setOut(true)} />
        </div>

        <div className="mt-auto pt-16">
          <p data-arrive className="label text-sm text-red mb-4">Driver #{me.number}</p>
          <h1 id="driver-name" className="display text-[clamp(3.2rem,11vw,8.5rem)] text-paddock">
            <span data-arrive className="block">Meng</span>
            <span data-arrive className="block">Heng</span>
          </h1>
          <div data-arrive className="flex gap-1.5 mt-5 -skew-x-[30deg] ml-1" aria-hidden="true">
            <span className="block h-1.5 w-28 bg-red" />
            <span className="block h-1.5 w-12 bg-papaya" />
            <span className="block h-1.5 w-5 bg-paddock" />
          </div>

          <div data-arrive className="mt-7 max-w-xl">
            <p className="label text-[11px] text-papaya flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-papaya blink" aria-hidden="true" /> Team radio
            </p>
            <p className="display text-[clamp(1.3rem,2.6vw,1.9rem)] leading-[1.05] text-paddock mt-2">&ldquo;{me.tagline}&rdquo;</p>
            <p className="text-paddock/70 mt-3">
              {me.role} at {me.workplace}, {me.location}.
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-10 mt-10">
            <div data-arrive className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollToId("races")}
                className="sweep mblur-hover label text-sm bg-red text-paddock pl-6 pr-8 py-3.5 [clip-path:polygon(0_0,100%_0,calc(100%-14px)_100%,0_100%)] hover:bg-[#ff1a12]"
              >
                <span className="mblur-target inline-block">Race results &rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToId("radio")}
                className="sweep mblur-hover label text-sm border border-white/25 text-paddock px-6 py-3.5 hover:border-paddock backdrop-blur-sm"
              >
                <span className="mblur-target inline-block">Team radio</span>
              </button>
            </div>
            <Telemetry racing={out} />
          </div>
          <p data-go className={`font-mono text-[12px] text-concrete mt-8 ${out ? "" : "invisible"}`} aria-hidden="true">
            &gt; Lights out and away we go.
          </p>
        </div>
      </div>
    </section>
  );
}
