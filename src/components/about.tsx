"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { RevealWords } from "@/components/motion-primitives";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import { workHistoryHeight } from "@/lib/select";
import { SOCIAL_LABELS, resolveSocialIcon } from "@/lib/social-icons";
import type { SiteSettingsView } from "@/lib/content";

/** Spring tuned to the reference: ~0.5s settle with a ~1% overshoot. */
const spring = { type: "spring", stiffness: 120, damping: 18, mass: 1 } as const;

/**
 * About: 64px heading, then left column (371px portrait with social chips and
 * work-history stack) / right column (3 philosophy paragraphs, 1.5fr).
 */
export function About({
  workHistory,
  site,
  photo,
  copy,
}: {
  workHistory: SiteSettingsView["workHistory"];
  site: Pick<SiteSettingsView, "name" | "role" | "followerCount" | "socials" | "signature">;
  photo: string;
  copy: SiteSettingsView["copy"]["about"];
}) {
  const [expanded, setExpanded] = useState(false);
  // The panel's height comes from the same count as the cards, so the stack
  // and its box cannot drift apart.
  const entries = workHistory.slice(0, 3);

  return (
    <section className="section-pad flex w-full flex-col items-center gap-16">
      <div className="container-1080 flex flex-col gap-16">
        <h2 className="t-h2">
          <RevealWords text={copy.heading.line1} tone="muted" />
          <br />
          <RevealWords text={copy.heading.line2} delay={0.12} />
        </h2>

        <div className="flex flex-col items-start gap-8 md:flex-row md:gap-12 lg:gap-16">
          <div className="flex w-full flex-col gap-8 md:flex-1 lg:gap-16">
            <div className="flex flex-col gap-4">
              <div
                className={`relative w-full overflow-hidden rounded-[16px]${emptyFrame(photo)}`}
                style={{ aspectRatio: "0.904762 / 1" }}
              >
                <MaybeImg src={photo} alt={site.name} loading="lazy" className="size-full object-cover" />
                {site.socials.length > 0 ? (
                  <div className="absolute bottom-3 right-3 flex w-[207px] items-center justify-end gap-[6px] max-md:gap-[14px]">
                    {site.socials.map((social, i) => {
                      const Icon = resolveSocialIcon(social.platform);
                      // The X chip widens to carry the follower count; the rest are 30px squares.
                      const count = social.platform === "x" ? site.followerCount : "";
                      return (
                        <a
                          key={`${social.platform}-${i}`}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${SOCIAL_LABELS[social.platform]} Link`}
                          className={
                            social.platform === "x"
                              ? "flex h-[30px] items-center gap-1 rounded-[24px] bg-black/50 px-2 text-white backdrop-blur-[10px] max-md:relative max-md:tap-target"
                              : "grid size-[30px] place-items-center rounded-[24px] bg-black/50 text-white backdrop-blur-[10px] max-md:relative max-md:tap-target"
                          }
                        >
                          <Icon className="size-3.5" strokeWidth={1.5} />
                          {count ? <span className="t-micro">{count}</span> : null}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="t-lead">{site.name}</p>
                <p className="t-label text-ink-2">{site.role}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="t-body-lg">My work history</p>
              <motion.div
                initial={false}
                animate={{
                  height: workHistoryHeight(
                    entries.length,
                    expanded,
                  ),
                }}
                transition={spring}
                className="relative"
              >
                {entries.map((w, i) => (
                  <motion.div
                    key={w.company}
                    initial={false}
                    animate={{
                      y: expanded ? 0 : i * 8 - i * 89,
                      scale: expanded ? 1 : 1 - i * 0.05,
                    }}
                    transition={spring}
                    style={{ position: "absolute", top: i * 89, left: 0, right: 0, zIndex: 3 - i }}
                    className="flex items-center justify-between rounded-[16px] bg-surface p-[18px] text-left shadow-card"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="t-body whitespace-pre">{w.company}</span>
                      <span className="t-micro text-ink-2 whitespace-pre">{w.role}</span>
                    </span>
                    <span className="t-micro text-ink-2 whitespace-pre">{w.dates}</span>
                  </motion.div>
                ))}
                <motion.button
                  type="button"
                  initial={false}
                  onClick={() => setExpanded((v) => !v)}
                  aria-expanded={expanded}
                  animate={{ bottom: expanded ? 41 : 0 }}
                  transition={spring}
                  className="t-micro absolute left-1/2 flex h-[30px] -translate-x-1/2 items-center gap-1 rounded-[24px] bg-surface pl-4 pr-3 shadow-pill max-md:tap-target"
                >
                  {expanded ? "Hide" : "Show all"}
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 256 256"
                    aria-hidden
                    fill="currentColor"
                    initial={false}
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={spring}
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,93.66-40,40a8,8,0,0,1-11.32,0l-40-40a8,8,0,0,1,11.32-11.32L128,140.69l34.34-34.35a8,8,0,0,1,11.32,11.32Z" />
                  </motion.svg>
                </motion.button>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-12 lg:flex-[1.5]">
            <div className="flex flex-col gap-8">
              {copy.paragraphs.map((paragraph, i) => (
                <p key={i} className="t-lead">
                  <strong className="font-semibold">{paragraph.lead}</strong>{" "}
                  {paragraph.body}
                </p>
              ))}
            </div>
            <MaybeImg src={site.signature} alt="" loading="lazy" className="h-[97px] w-[97px] object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}
