"use client";

import { useRef, useState } from "react";
import { me } from "@/lib/data";
import { CheckerStrip, SectionHeading } from "@/components/fx";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {})
      }
      className="label text-[10px] border border-white/20 px-2.5 py-1 hover:border-papaya hover:text-papaya"
    >
      {copied ? "Copy, received" : "Copy"}
    </button>
  );
}

/** Contact: radio channels, over a photo of the pit lane. */
export function Radio() {
  const root = useRef<HTMLElement>(null);
  const [live, setLive] = useState<string | null>(null);

  const channels = [
    { label: "Email",  value: me.email, href: `mailto:${me.email}`, copy: true },
    { label: "GitHub", value: me.github.replace("https://", ""), href: me.github },
    ...(me.linkedin ? [{ label: "LinkedIn", value: me.linkedin.replace(/^https:\/\/(www\.)?/, ""), href: me.linkedin }] : []),
    { label: "Phone",  value: me.telephone, href: `tel:${me.telephone.replace(/\s/g, "")}` },
  ];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // looking down the pit lane: the photo pushes in as you arrive
      gsap.fromTo("[data-pit]", { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
    },
    { scope: root },
  );

  return (
    <section id="radio" ref={root} className="relative bg-black overflow-hidden" aria-labelledby="radio-title">
      {/* pit lane photo: a band on small screens, the right half on large ones */}
      <div className="relative h-64 sm:h-80 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-1/2 overflow-hidden" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-pit src="/img/track/pitlane.jpg" alt="" loading="lazy" className="w-full h-full object-cover object-[50%_70%] brightness-[0.7] saturate-[0.85]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--black),transparent_45%)] lg:bg-[linear-gradient(90deg,var(--black),rgb(10_10_11/0.3)_45%,transparent)]" />
      </div>

      <div className="page relative py-20 sm:py-28 lg:py-36">
        <div className="lg:max-w-[52%]">
          <div id="radio-title">
            <SectionHeading tag="04 · Comms" title="Team radio">
              Box, box. Need a backend built, tuned or fixed before the next session? Open a channel. Every call gets an answer, in Khmer or English.
            </SectionHeading>
          </div>

          <ul className="border-t border-white/[0.08]">
            {channels.map((c, i) => (
              <li
                key={c.label}
                onMouseEnter={() => setLive(c.label)}
                onMouseLeave={() => setLive(null)}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-4 border-b border-white/[0.08]"
              >
                <span className="font-mono text-[10px] text-concrete">
                  CH {String(i + 1).padStart(2, "0")}
                  <span className={`block label text-[12px] mt-0.5 transition-colors ${live === c.label ? "text-papaya" : "text-paddock"}`}>{c.label}</span>
                </span>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  onFocus={() => setLive(c.label)}
                  onBlur={() => setLive(null)}
                  className="min-w-0 font-mono text-[15px] text-paddock break-all hover:text-papaya"
                >
                  {c.value}
                </a>
                <span className="col-start-2 sm:col-start-auto flex items-center gap-3">
                  {c.copy && <CopyButton value={c.value} />}
                  <span className={`font-mono text-[10px] transition-colors ${live === c.label ? "text-green" : "text-concrete/60"}`} aria-hidden="true">
                    {live === c.label ? "● LIVE" : "○ STBY"}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${me.email}`}
            className="sweep mblur-hover group inline-flex items-center gap-4 mt-10 bg-red text-paddock pl-5 pr-8 py-4 [clip-path:polygon(0_0,100%_0,calc(100%-16px)_100%,0_100%)] hover:bg-[#ff1a12]"
          >
            <span className="grid place-items-center w-9 h-9 rounded-full border-2 border-paddock/80" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-paddock group-hover:animate-ping" />
            </span>
            <span className="mblur-target">
              <span className="label text-[10px] block opacity-80">Push to talk</span>
              <span className="display text-lg">Radio the driver</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/** Footer: the chequered flag, and credits for the photography. */
export function Finish() {
  return (
    <footer className="bg-black">
      <CheckerStrip />
      <div className="page flex flex-col md:flex-row md:items-end justify-between gap-6 py-10">
        <p className="display text-xl text-paddock">
          Chequered flag <span className="text-red">#{me.number}</span>
        </p>
        <div className="md:text-right font-mono text-[11px] text-concrete space-y-1">
          <p>&copy; 2026 {me.name}. Engineered in {me.location}.</p>
          <p>
            Photos on{" "}
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-paddock">Unsplash</a>
            : sydney Rae, Charlie Schroeder, Chris Kursikowski.
          </p>
        </div>
      </div>
    </footer>
  );
}
