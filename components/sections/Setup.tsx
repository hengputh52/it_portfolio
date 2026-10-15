"use client";

import { useRef, useState } from "react";
import { setup, type CarPart } from "@/lib/data";
import { SectionHeading } from "@/components/fx";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

/** Top-down F1 car. Each part lights up when its row is hovered or focused. */
function Car({ active }: { active: CarPart | null }) {
  const part = (p: CarPart) => ({
    className: "transition-[fill,stroke] duration-200",
    fill: active === p ? "var(--papaya)" : "#1E2024",
    stroke: active === p ? "#FFC27A" : "rgb(255 255 255 / 0.22)",
    strokeWidth: 1.2,
  });
  const tyre = { ...part("tires"), rx: 5 };
  return (
    <svg viewBox="0 0 200 440" className="w-full h-auto max-h-[64vh]" aria-hidden="true">
      <path d="M18 34 H182 L176 52 H24 Z" {...part("aero")} />
      <path d="M30 22 H170 V30 H30 Z" {...part("aero")} />
      <path d="M92 52 Q100 40 108 52 L116 150 Q122 190 124 250 L120 330 H80 L76 250 Q78 190 84 150 Z" {...part("chassis")} />
      <rect x="22" y="78" width="34" height="62" {...tyre} />
      <rect x="144" y="78" width="34" height="62" {...tyre} />
      <path d="M56 98 L88 110 M56 124 L86 132 M144 98 L112 110 M144 124 L114 132" stroke="rgb(255 255 255 / 0.25)" strokeWidth="2" />
      <ellipse cx="100" cy="190" rx="15" ry="26" {...part("cockpit")} />
      <path d="M86 176 Q100 160 114 176" fill="none" stroke={active === "cockpit" ? "#FFC27A" : "rgb(255 255 255 / 0.4)"} strokeWidth="3" />
      <path d="M76 214 Q50 222 46 252 L50 322 Q60 336 78 330 Z" {...part("bodywork")} />
      <path d="M124 214 Q150 222 154 252 L150 322 Q140 336 122 330 Z" {...part("bodywork")} />
      <path d="M88 222 Q100 210 112 222 L114 330 Q100 344 86 330 Z" {...part("engine")} />
      <rect x="90" y="334" width="20" height="40" rx="3" {...part("gearbox")} />
      <rect x="16" y="318" width="40" height="70" {...tyre} />
      <rect x="144" y="318" width="40" height="70" {...tyre} />
      <path d="M40 392 H160 V412 H40 Z" {...part("aero")} />
      <path d="M36 388 V418 M164 388 V418" stroke="rgb(255 255 255 / 0.3)" strokeWidth="3" />
      <text x="100" y="100" textAnchor="middle" fill="rgb(255 255 255 / 0.5)" fontSize="13" fontFamily="var(--font-display)" fontWeight="900">52</text>
    </svg>
  );
}

/** Stack: languages, frameworks and databases as components of the car. */
export function Setup() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<CarPart | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the car rolls in from the garage, then the spec sheet fills in line by line
      gsap.from("[data-car]", { y: 80, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: "[data-car]", start: "top 85%", once: true } });
      gsap.from("[data-row]", {
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: "[data-rows]", start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="setup" ref={root} className="relative bg-carbon py-24 sm:py-32" aria-labelledby="setup-title">
      <div className="page">
        <div id="setup-title">
          <SectionHeading tag="03 · Garage" title="Car setup">
            Every tool I trust, fitted where it does its job. Hover a component to find it on the car.
          </SectionHeading>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] gap-12 lg:gap-20 items-start">
          <div data-car className="lg:sticky lg:top-28 max-w-[260px] w-full mx-auto">
            <Car active={active} />
            <p className="label text-[11px] text-concrete text-center mt-4" aria-hidden="true">
              {active ? setup.find((s) => s.part === active)?.name : "Car #52 · top view"}
            </p>
          </div>

          <ul data-rows className="border-t border-white/[0.08]">
            {setup.map((c, i) => (
              <li key={c.tech} data-row>
                <div
                  tabIndex={0}
                  onMouseEnter={() => setActive(c.part)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(c.part)}
                  onBlur={() => setActive(null)}
                  className={`group grid grid-cols-[2.5rem_minmax(0,1fr)] sm:grid-cols-[2.5rem_10rem_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 py-5 border-b border-white/[0.08] transition-colors ${
                    active === c.part ? "bg-white/[0.03]" : ""
                  }`}
                >
                  <span className="font-mono text-[11px] text-concrete">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`label text-xs transition-colors ${active === c.part ? "text-papaya" : "text-concrete"}`}>{c.name}</span>
                  <div className="col-start-2 sm:col-start-auto min-w-0">
                    <h3 className="display text-xl sm:text-2xl text-paddock">{c.tech}</h3>
                    <p className="text-[15px] leading-relaxed text-paddock/60 mt-1.5">{c.note}</p>
                  </div>
                  <p className="col-start-2 sm:col-start-auto num text-lg text-paddock/80 sm:text-right whitespace-nowrap" aria-hidden="true">
                    {c.spec.value.toLocaleString("en-US")}
                    <span className="unit">{c.spec.unit}</span>
                    <span className="block label text-[9px] text-concrete mt-0.5">{c.spec.label}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
