"use client";

import { useEffect, useState } from "react";

/** Cycles a word vertically: design -> build -> create -> (loop). */
export function TextCycle({
  words,
  interval = 2000,
}: {
  words: string[];
  interval?: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [interval, words.length]);

  return (
    <span className="relative inline-block h-[68px] max-xl:h-auto overflow-hidden align-baseline">
      <span className="invisible t-h1 whitespace-pre">
        {words.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>
      {words.map((w, idx) => (
        <span
          key={w}
          className="absolute inset-0 whitespace-pre t-h1 text-invert-ink"
          style={{
            transform: `translateY(${(idx - i) * 100}%)`,
            opacity: idx === i ? 1 : 0,
            transition:
              "transform .6s cubic-bezier(.4,0,.2,1), opacity .6s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
