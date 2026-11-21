"use client";

import { useState } from "react";
import type { FaqView } from "@/lib/content";

/**
 * FAQ accordion: closed row 80px, radius 16, white, 12px/16px padding on the
 * question row, 16px gap between items. `+` rotates to `−` when open.
 */
export function FaqAccordion({ faqs }: { faqs: FaqView[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-4">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.n}
            className="overflow-hidden rounded-[16px] bg-surface"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-5 px-4 py-3 text-left"
            >
              <span className="t-micro w-[18px] shrink-0">{f.n}</span>
              <span className="t-body flex-1">{f.q}</span>
              <span className="relative grid size-7 shrink-0 place-items-center">
                <span className="absolute block h-[1.5px] w-3.5 rounded-full bg-invert" />
                <span
                  className="absolute block h-3.5 w-[1.5px] rounded-full bg-invert transition-transform duration-300"
                  style={{ transform: isOpen ? "scaleY(0)" : "scaleY(1)" }}
                />
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(.4,0,.2,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="t-body-sm px-4 py-4 pl-[44px]">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
