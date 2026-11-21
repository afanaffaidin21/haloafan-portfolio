"use client";

import Link from "next/link";
import { useState } from "react";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";

export type ProjectCardData = {
  slug: string;
  name: string;
  type: string;
  thumbnail: string;
};

/** 484x363 image (radius 16, overflow hidden) + name/type + "View Project". */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: ProjectCardData;
  priority?: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="group flex flex-col gap-3"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={`relative aspect-[484/363] w-full overflow-hidden rounded-[16px]${emptyFrame(project.thumbnail)}`}>
        <MaybeImg
          src={project.thumbnail}
          alt={project.type ? `${project.name} — ${project.type}` : project.name}
          loading={priority ? "eager" : "lazy"}
          className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: hover ? "scale(1.04)" : "scale(1)" }}
        />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="t-h4 whitespace-pre max-md:whitespace-normal">{project.name}</p>
          {project.type ? <p className="t-micro text-ink-2">{project.type}</p> : null}
        </div>
        <div
          className="flex shrink-0 items-center gap-1 transition-opacity duration-300"
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
      </div>
    </Link>
  );
}

/** Section header: 64px two-tone heading + optional trailing link. */
export function SectionHeading({
  lead,
  rest,
  trailing,
  className,
}: {
  lead: string;
  rest: string;
  trailing?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-6 ${className ?? ""}`}>
      <h2 className="t-h2">
        <span className="text-ink-3">{lead}</span>
        <br />
        <span>{rest}</span>
      </h2>
      {trailing ? (
        <Link
          href={trailing.href}
          className="group flex shrink-0 items-center gap-1 pb-1"
        >
          <span className="t-body-lg whitespace-pre">{trailing.label}</span>
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
        </Link>
      ) : null}
    </div>
  );
}
