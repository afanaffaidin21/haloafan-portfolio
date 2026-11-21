"use client";

import { Appear } from "@/components/motion-primitives";
import { resolveIcon, resolveTool } from "@/lib/skill-icons";
import type { SiteSettingsView, SkillView } from "@/lib/content";

/**
 * Skills: two columns (1.5fr heading + tool tiles / 1fr skill rows).
 * Each row: 40px black circular icon + 22px label. Tool tiles: 56px white
 * radius-12 with a hover tooltip pill above.
 *
 * `variant` picks the arm: tiles resolve through `resolveTool` (logos accept
 * only `className`), rows through `resolveIcon` (icons accept `filled`/
 * `strokeWidth`). Unknown keys fall back to a neutral icon in both.
 */
export function Skills({ skills, copy }: { skills: SkillView[]; copy: SiteSettingsView["copy"]["skills"] }) {
  if (skills.length === 0) return null;

  const tiles = skills.filter((skill) => skill.variant === "tile");
  const rows = skills.filter((skill) => skill.variant === "row");

  return (
    <section id="skills" className="section-pad flex w-full flex-col items-center gap-16">
      <div className="container-1080 flex flex-col items-start gap-16 md:flex-row md:items-center">
        <div className="flex w-full flex-col gap-16 md:flex-[1.5]">
          <h2 className="t-h2">
            <span className="text-ink-3">{copy.heading.line1}</span>
            <br />
            <span>{copy.heading.line2}</span>
          </h2>

          <div className="flex flex-col gap-4">
            <p className="t-body-lg whitespace-pre">{copy.techStackLabel}</p>
            <div className="flex flex-wrap items-center gap-2">
              {tiles.map((skill, i) => {
                const Tool = resolveTool(skill.tool ?? "");
                return (
                  <div key={`${skill.name}-${i}`} className="group relative size-14">
                    <div className="grid size-14 place-items-center rounded-[12px] bg-surface shadow-card">
                      <Tool className="size-6 text-ink" />
                    </div>
                    <span
                      className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-pre rounded-full bg-invert px-2 py-1 text-[11px] font-medium text-invert-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ transitionDelay: `${i * 0.05}s` }}
                    >
                      {skill.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-12 md:flex-1">
          {rows.map((skill, i) => {
            const Icon = resolveIcon(skill.icon ?? "");
            return (
              <Appear key={`${skill.name}-${i}`} delay={0.05 * i} duration={0.5}>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-invert text-invert-ink shadow-btn">
                    <Icon className="size-6" filled strokeWidth={1.5} />
                  </span>
                  <p className="t-lead">{skill.name}</p>
                </div>
              </Appear>
            );
          })}
        </div>
      </div>
    </section>
  );
}
