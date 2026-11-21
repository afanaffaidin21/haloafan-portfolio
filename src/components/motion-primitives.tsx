"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView, useReducedMotion } from "motion/react";

const subscribeNever = () => () => {};

/**
 * Framer's "appear on scroll" reveal: each word rises and un-blurs, staggered.
 * Measured from the reference: initial blur(6px) + translateY(20px) + opacity 0,
 * resolving to blur(0)/0/1 with cubic-bezier(.4,0,.2,1) at 0.5s.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: As = "span",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "span" | "div";
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const reduce = useReducedMotion();

  return (
    <As
      ref={ref as never}
      className={className}
      style={{
        display: "inline-block",
        opacity: reduce || inView ? 1 : 0,
        filter: reduce || inView ? "blur(0px)" : "blur(6px)",
        transform: reduce || inView ? "none" : "translateY(20px)",
        transition: `opacity .5s cubic-bezier(.4,0,.2,1) ${delay}s, filter .5s cubic-bezier(.4,0,.2,1) ${delay}s, transform .5s cubic-bezier(.4,0,.2,1) ${delay}s`,
      }}
    >
      {children}
    </As>
  );
}

/**
 * Splits a heading into words and reveals them with a stagger.
 * Supports the reference's two-tone headings (first line muted #828282).
 */
export function RevealWords({
  text,
  className,
  stagger = 0.06,
  delay = 0,
  tone = "dark",
}: {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  tone?: "dark" | "muted";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="reveal-word"
          style={{
            color: tone === "muted" ? "var(--color-ink-3)" : undefined,
            opacity: reduce || inView ? 1 : 0,
            filter: reduce || inView ? "blur(0px)" : "blur(6px)",
            transform: reduce || inView ? "none" : "translateY(20px)",
            transition: `opacity .5s cubic-bezier(.4,0,.2,1) ${delay + i * stagger}s, filter .5s cubic-bezier(.4,0,.2,1) ${delay + i * stagger}s, transform .5s cubic-bezier(.4,0,.2,1) ${delay + i * stagger}s`,
          }}
        >
          {w}
          {i < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </span>
  );
}

/** Page-load appear (Framer's `appear` animations, which fire on mount). */
export function Appear({
  children,
  delay = 0,
  duration = 0.6,
  from = { opacity: 0.001 },
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: { opacity?: number; y?: number; scale?: number };
  className?: string;
}) {
  // false on the server and during hydration, true on every client render after.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const reduce = useReducedMotion();

  const visible = mounted || !!reduce;

  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : (from.opacity ?? 0.001),
        transform: visible
          ? "none"
          : `translateY(${from.y ?? 0}px) scale(${from.scale ?? 1})`,
        transition: `opacity ${duration}s cubic-bezier(.4,0,.2,1) ${delay}s, transform ${duration}s cubic-bezier(.4,0,.2,1) ${delay}s`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
