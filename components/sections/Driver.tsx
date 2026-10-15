"use client";

import { useRef } from "react";
import { driver, me, prints } from "@/lib/data";
import { SectionHeading, useCameraFlash } from "@/components/fx";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

const SECTOR = ["var(--purple)", "var(--green)", "var(--amber)"];

/** One press photo from the paddock, with a camera flash when it comes into view. */
function PressPhoto({ p }: { p: (typeof prints)[number] }) {
  const flash = useCameraFlash<HTMLElement>();
  return (
    <figure ref={flash} className="mblur-hover group">
      <div className="relative overflow-hidden aspect-[4/3] bg-sand-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imageSrc} alt={`${p.where}: ${p.what}`} loading="lazy" className="mblur-target w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        <span className="absolute right-2 bottom-1.5 font-mono text-[11px] text-amber [text-shadow:0_0_6px_rgba(0,0,0,0.9)]">{p.stamp}</span>
        <div className="flash-layer" />
      </div>
      <figcaption className="pt-3">
        <p className="label text-[13px] text-sand-ink">{p.where}</p>
        <p className="text-sm text-sand-ink/65 mt-0.5">{p.what}</p>
      </figcaption>
    </figure>
  );
}

/** About: a race-programme driver bio on sun-bleached paper. */
export function Driver() {
  const root = useRef<HTMLElement>(null);
  const flash = useCameraFlash<HTMLDivElement>();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // career sectors go green one after another, like a timing screen
      gsap.from("[data-sector-bar]", {
        scaleX: 0,
        duration: 0.6,
        stagger: 0.25,
        ease: "power3.inOut",
        scrollTrigger: { trigger: "[data-career]", start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="driver" ref={root} className="desert relative py-24 sm:py-32" aria-labelledby="driver-title">
      <div className="page">
        <div id="driver-title">
          <SectionHeading tag="01 · Race programme" title="The Driver" dark={false} />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-12 lg:gap-20 items-start">
          {/* driver card */}
          <div ref={flash} className="relative max-w-sm w-full mx-auto lg:mx-0 bg-black">
            <div className="relative overflow-hidden aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/portrait.png" alt={`Portrait of ${me.name}`} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between">
                <p className="display text-2xl text-paddock leading-none">{me.short}</p>
                <p className="display text-3xl text-red leading-none">{me.number}</p>
              </div>
              <div className="flash-layer" />
            </div>
            <div className="flex" aria-hidden="true">
              <span className="h-1 flex-[5] bg-red" />
              <span className="h-1 flex-[2] bg-papaya" />
              <span className="h-1 flex-1 bg-paddock" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xl sm:text-2xl leading-snug font-medium text-sand-ink">{driver.intro}</p>
            <blockquote className="mt-8 border-l-2 border-red pl-5">
              <p className="text-lg leading-relaxed text-sand-ink/80">&ldquo;{driver.quote}&rdquo;</p>
            </blockquote>

            <dl className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-x-6 border-t border-sand-ink/25">
              {driver.stats.map((s) => (
                <div key={s.k} className="border-b border-sand-ink/15 py-3">
                  <dt className="label text-[10px] text-sand-ink/55">{s.k}</dt>
                  <dd className={`mt-1 ${s.k === "Number" ? "display text-2xl text-red" : "label text-[15px] text-sand-ink tracking-[0.06em]"}`}>{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* career progression, as three timed sectors */}
        <div data-career className="mt-24">
          <p className="label text-xs text-red mb-6">Career · Academy to team</p>
          <ol className="grid md:grid-cols-3 gap-8 md:gap-6">
            {driver.career.map((c, i) => (
              <li key={c.stage}>
                <div className="h-1 bg-sand-ink/10 mb-5 overflow-hidden" aria-hidden="true">
                  <span data-sector-bar className="block h-full origin-left" style={{ background: SECTOR[i] }} />
                </div>
                <p className="label text-[11px] text-sand-ink/55">{c.sector} · {c.stage}</p>
                <p className="display text-xl sm:text-2xl text-sand-ink mt-2 leading-[1]">{c.name}</p>
                <p className="text-[15px] leading-relaxed text-sand-ink/70 mt-3">{c.note}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* off track: volunteer media work */}
        <div className="mt-24">
          <p className="label text-xs text-red mb-2">Off track</p>
          <h3 className="display text-2xl sm:text-4xl text-sand-ink mb-3">Behind the camera</h3>
          <p className="text-sand-ink/70 max-w-[58ch] mb-10">
            Away from the keyboard I&apos;m usually behind a camera, volunteering on media teams for events around Phnom Penh.
          </p>
          <ul className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-6">
            {prints.map((p) => (
              <li key={p.id}>
                <PressPhoto p={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
