"use client";

import { useEffect, useState, type Ref } from "react";
import { IconDownload, IconMail } from "@/components/icons";

/** Lenis smooth scroll — the reference ships it (`html.lenis`). */
export function SmoothScroll() {
  useEffect(() => {
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let frame = 0;
    let cancelled = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis = instance as unknown as { raf: (t: number) => void; destroy: () => void };
      const raf = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return null;
}

/**
 * Sticky bottom bar. The reference stacks five backdrop-blur layers ramping
 * 0.3125 → 5px, with the pill (Email me / Download CV) on top.
 */
export function StickyCta({ email, resume }: { email: string; resume: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    const update = () => {
      if (!footer) return;
      const footerTop = footer.getBoundingClientRect().top;
      // The reference drops the bar as soon as the footer enters the viewport.
      setVisible(window.scrollY > 320 && footerTop > window.innerHeight - 80);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <StickyCtaBar visible={visible} email={email} resume={resume} />;
}

// Progressive blur: five layers, each masked to its own band (reference values).
const layers = [
  { blur: 0.3125, mask: "linear-gradient(rgba(0,0,0,0) 37.5%, #000 50%, #000 62.5%, rgba(0,0,0,0) 75%)" },
  { blur: 0.625, mask: "linear-gradient(rgba(0,0,0,0) 50%, #000 62.5%, #000 75%, rgba(0,0,0,0) 87.5%)" },
  { blur: 1.25, mask: "linear-gradient(rgba(0,0,0,0) 62.5%, #000 75%, #000 87.5%, rgba(0,0,0,0) 100%)" },
  { blur: 2.5, mask: "linear-gradient(rgba(0,0,0,0) 75%, #000 87.5%, #000 100%)" },
  { blur: 5, mask: "linear-gradient(rgba(0,0,0,0) 87.5%, #000 100%)" },
];

/** Hidden means gone for pointer, keyboard, and screen reader alike, not just faded out. */
export function StickyCtaBar({
  ref,
  visible,
  email,
  resume,
}: {
  ref?: Ref<HTMLDivElement>;
  visible: boolean;
  email: string;
  resume: string;
}) {
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed bottom-0 left-0 z-[5] h-[225px] w-full"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .3s ease" }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="absolute inset-0 overflow-hidden">
        {layers.map((layer, i) => (
          <div
            key={layer.blur}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              zIndex: 4 + i,
              maskImage: layer.mask,
              WebkitMaskImage: layer.mask,
            }}
          />
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 z-[20] -translate-x-1/2">
        <div className={`${visible ? "pointer-events-auto" : "pointer-events-none"} flex h-16 items-center rounded-[48px] bg-surface/50 py-3 pl-6 pr-3 backdrop-blur-[5px]`}>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-[18px]"
          >
            <span className="flex flex-col gap-[5px]">
              <span className="t-label whitespace-pre">Email me</span>
              <span className="text-[12px] font-medium leading-[13.44px] tracking-[-0.24px] text-ink-2 whitespace-pre">
                {email}
              </span>
            </span>
            <span className="grid size-10 place-items-center rounded-full bg-invert text-invert-ink">
              <IconMail className="size-4" />
            </span>
          </a>
          {resume ? (
            <a
              href={resume}
              download
              aria-label="Download CV"
              className="ml-2 grid size-10 place-items-center rounded-full bg-invert text-invert-ink transition-opacity hover:opacity-90"
            >
              <IconDownload className="size-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
