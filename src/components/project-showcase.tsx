"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Project } from "@/content/projects";
import { MaybeImg } from "@/components/maybe-img";

/**
 * The hero collage and the "Latest Projects" grid share their cards: the four
 * measured collage slots (grid cells 0–3) lift the featured projects, while the
 * grid lists every card the page passed it. A card keeps its own cell's offset,
 * and grid cards past the fourth slot stay put so a growing CMS list cannot
 * stack onto the collage.
 *
 * Measured from the reference:
 *   card 0  translate( 530, -850)  rotate( 10deg) scale(.70)  z 3
 *   card 1  translate(  80, -850)  rotate( 15deg) scale(.70)  z 0
 *   card 2  translate( 480,-1250)  rotate( -5deg) scale(.70)  z 1
 *   card 3  translate(  30,-1200)  rotate(  5deg) scale(.70)  z 2
 *
 * Scroll 0→800px eases every transform back to identity. The caption also
 * collapses while a card sits in the hero (reference card = 363px there,
 * 418px once settled), so the grid row height grows with the same progress.
 */
const measured = [
  { x: 530, y: -850, rotate: 10, z: 3 },
  { x: 80, y: -850, rotate: 15, z: 0 },
  { x: 480, y: -1250, rotate: -5, z: 1 },
  { x: 30, y: -1200, rotate: 5, z: 2 },
];

/**
 * The reference measures from below its client-logo row (py-8 around 35px
 * logos), which this site dropped. The grid therefore sits 99px higher, and the
 * y offsets shrink by the same amount so the collage keeps its place in the hero.
 */
const DROPPED_LOGO_ROW = 99;
const offsets = measured.map((offset) => ({ ...offset, y: offset.y + DROPPED_LOGO_ROW }));

/** The collage only exists at the desktop breakpoint in the reference. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 992px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export function ProjectShowcase({
  projects,
  collage,
}: {
  /** Grid order, capped by the page. */
  projects: Project[];
  /** Featured projects, capped at the four collage slots by the page. */
  collage: Project[];
}) {
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, 800], [0, 1], { clamp: true });
  // offsets are keyed to the grid cell, so a featured card must land on its
  // own cell's offset — not on its rank within the featured list.
  const featured = new Set(collage.map((project) => project.slug));

  return (
    <div className="relative z-[2] grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      {projects.map((project, i) => (
        <ShowcaseCard
          key={project.slug}
          project={project}
          index={i}
          slot={featured.has(project.slug) && i < offsets.length ? i : -1}
          progress={progress}
        />
      ))}
    </div>
  );
}

function ShowcaseCard({
  project,
  index,
  slot,
  progress,
}: {
  project: Project;
  index: number;
  slot: number;
  progress: MotionValue<number>;
}) {
  // Only the four collage cards fly out of the hero; grid cards past the
  // fourth would reuse offsets[0] and overlap the top-left card.
  const off = slot >= 0 ? offsets[slot] : undefined;
  const isDesktop = useIsDesktop();
  const [hover, setHover] = useState(false);

  const x = useTransform(progress, [0, 1], [isDesktop && off ? off.x : 0, 0]);
  const y = useTransform(progress, [0, 1], [isDesktop && off ? off.y : 0, 0]);
  const rotate = useTransform(progress, [0, 1], [isDesktop && off ? off.rotate : 0, 0]);
  const scale = useTransform(progress, [0, 1], [isDesktop && off ? 0.7 : 1, 1]);
  // Caption collapses to zero while the card lives in the hero collage.
  const captionHeight = useTransform(progress, [0.15, 0.9], [0, 43]);
  const captionOpacity = useTransform(progress, [0.25, 0.85], [0, 1]);
  const captionGap = useTransform(progress, [0.15, 0.9], [0, 12]);

  return (
    <motion.div
      style={{ x, y, rotate, scale, zIndex: off?.z }}
      className="flex flex-col will-change-transform"
    >
      <Link
        href={`/projects/${project.slug}/`}
        className="block w-full overflow-hidden rounded-[16px] bg-surface-muted"
        style={{ aspectRatio: "484 / 363" }}
        aria-label={project.type ? `${project.name} — ${project.type}` : project.name}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <MaybeImg
          src={project.thumbnail}
          alt=""
          loading={index < 2 ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: hover ? "scale(1.04)" : "scale(1)" }}
        />
      </Link>

      <motion.div
        style={{ height: captionHeight, opacity: captionOpacity, marginTop: captionGap }}
        className="flex items-start justify-between gap-4 overflow-hidden"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="flex flex-col gap-1">
          <p className="t-body-lg whitespace-pre">{project.name}</p>
          {project.type ? <p className="t-micro text-ink-2">{project.type}</p> : null}
        </div>
        <div
          className="flex shrink-0 items-center gap-1 pt-1 transition-opacity duration-300"
          style={{ opacity: hover ? 1 : 0.6 }}
        >
          <span className="grid size-[18px] place-items-center rounded-full bg-invert text-invert-ink">
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
              <path
                d="M1 7L7 1M7 1H2.2M7 1v4.8"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p className="t-micro whitespace-pre">View Project</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
