"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/gsap";
import { faq } from "@/lib/content";

export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useGSAP(
    () => {
      registerGsap();
      if (!sectionRef.current) return;

      // Drop the pin animation. Letting the FAQ section grow naturally is the
      // only way every item + opened answer stays visible without clipping at
      // any viewport height.
      gsap.set(".faq-window", { width: "100%", height: "auto", borderRadius: 0 });
      gsap.set(".faq-mini", { display: "none" });
      gsap.set(".faq-expanded", { opacity: 1, position: "static" });

      gsap.fromTo(
        ".faq-headline-word",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.7,
          ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current!, start: "top 75%" },
        }
      );
      gsap.fromTo(
        ".faq-item",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.6,
          ease: "expo.out",
          scrollTrigger: { trigger: ".faq-list", start: "top 85%" },
        }
      );

      return () => {
        ScrollTrigger.refresh();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section id="faq" ref={sectionRef} className="relative bg-bg py-16 sm:py-24">
      <div className="relative flex w-full items-stretch justify-center bg-bg">
        <div className="faq-window relative z-10 flex w-full flex-col bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.6)]">
          {/* Mini state */}
          <div className="faq-mini absolute inset-0 p-8">
            <h3
              className="text-[2.2rem] font-medium leading-none text-[#0a0a0a]"
              style={{
                fontFamily: "var(--font-tech), ui-sans-serif, system-ui",
              }}
            >
              FAQ
            </h3>
            <div
              aria-hidden
              className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full text-white shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset]"
              style={{ background: "var(--gradient-brand)" }}
            >
              <ArrowUpRight className="size-5" />
            </div>
          </div>

          {/* Expanded state — natural flow so all items stay reachable */}
          <div className="faq-expanded flex flex-col opacity-0">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col px-7 pt-10 pb-8 sm:px-12 sm:pt-14 sm:pb-12 lg:px-20 lg:pt-16 lg:pb-16">
              <h2
                className="shrink-0 text-center text-[clamp(2rem,4.2vw,4.25rem)] font-normal leading-[1.05] tracking-[-0.015em] text-[#0a0a0a]"
                style={{
                  fontFamily:
                    "var(--font-tech), ui-sans-serif, system-ui, -apple-system",
                }}
              >
                <span className="inline-flex flex-nowrap items-baseline gap-x-4 whitespace-nowrap sm:gap-x-6 lg:gap-x-8">
                  <span className="faq-headline-word inline-block">Frequently</span>
                  <span className="faq-headline-word inline-block h-[1.5px] w-16 self-end translate-y-[-0.5em] bg-[#0a0a0a]/30 sm:w-28 lg:w-40" />
                  <span className="faq-headline-word inline-block">Asked</span>
                  <span className="faq-headline-word inline-block h-[1.5px] w-16 self-end translate-y-[-0.5em] bg-[#0a0a0a]/30 sm:w-28 lg:w-40" />
                  <span className="faq-headline-word inline-block">Questions</span>
                </span>
              </h2>

              {/* Natural flow — no inner scroll, page scrolls past */}
              <div className="faq-list mx-auto mt-6 w-full max-w-[820px] space-y-1.5 sm:mt-8 sm:space-y-2 lg:mt-8">
                {faq.items.map((item, i) => {
                  const isOpen = openIdx === i;
                  return (
                    <div
                      key={item.q}
                      className={`faq-item transition-colors ${
                        isOpen
                          ? "rounded-[28px] bg-[#0a0a0a]/[0.05]"
                          : "rounded-full bg-[#0a0a0a]/[0.04] hover:bg-[#0a0a0a]/[0.06]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenIdx((curr) => (curr === i ? null : i))
                        }
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-5 rounded-full px-6 py-2 text-left sm:px-8 sm:py-2.5"
                      >
                        <span
                          className="text-[15px] font-normal leading-snug text-[#0a0a0a] sm:text-[17px] lg:text-[18px]"
                          style={{
                            fontFamily:
                              "var(--font-tech), ui-sans-serif, system-ui",
                          }}
                        >
                          {i + 1}. {item.q}
                        </span>
                        <span
                          aria-hidden
                          className="grid size-9 shrink-0 place-items-center rounded-full text-white shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset] sm:size-10"
                          style={{ background: "var(--gradient-brand)" }}
                        >
                          {isOpen ? (
                            <Minus className="size-4" />
                          ) : (
                            <Plus className="size-4" />
                          )}
                        </span>
                      </button>
                      {isOpen && (
                        <div
                          className="px-6 pb-3 pt-0.5 text-[13px] font-normal leading-snug text-[#0a0a0a]/70 sm:px-8 sm:pb-3.5 sm:text-[13.5px] lg:text-[14px]"
                          style={{
                            fontFamily:
                              "var(--font-tech), ui-sans-serif, system-ui",
                          }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer — anchored to the bottom of the window so it never clips */}
              <div className="faq-footer mt-4 flex shrink-0 flex-col items-start justify-between gap-3 pt-4 sm:flex-row sm:items-center sm:gap-5">
                <div
                  className="flex max-w-xl items-start gap-3 text-[13px] leading-snug text-[#0a0a0a]/55 sm:text-[14px] lg:text-[15px]"
                  style={{
                    fontFamily:
                      "var(--font-tech), ui-sans-serif, system-ui",
                  }}
                >
                  <Plus className="mt-0.5 size-4 shrink-0" />
                  <span>{faq.hint}</span>
                </div>
                <a
                  href={faq.community.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex shrink-0 items-center gap-3 text-[#0a0a0a]"
                >
                  <span
                    aria-hidden
                    className="grid size-[48px] place-items-center rounded-[14px] bg-[#3b5bff] text-white transition-transform group-hover:-translate-y-0.5"
                  >
                    <span className="inline-flex gap-1.5">
                      <span className="size-1.5 rounded-full bg-white" />
                      <span className="size-1.5 rounded-full bg-white" />
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>
                  </span>
                  <span
                    className="text-[13px] font-semibold leading-tight sm:text-[14px]"
                    style={{
                      fontFamily:
                        "var(--font-tech), ui-sans-serif, system-ui",
                    }}
                  >
                    Any Questions? Ask
                    <br />
                    The Community.
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
