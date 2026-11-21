import type { ReactElement } from "react";

import {
  IconBehance,
  IconDribbble,
  IconExternal,
  IconGitHub,
  IconInstagram,
  IconLinkedIn,
  IconThreads,
  IconX,
} from "../components/icons";

export type SocialIcon = (p: { className?: string; strokeWidth?: number }) => ReactElement;

/**
 * Closed registry of the social chips. Keys back the `SiteSettings.socials`
 * platform select and are the only platforms the site renders; the map order
 * is the order the admin lists them in.
 */
export const socialIconFor = {
  x: IconX,
  github: IconGitHub,
  linkedin: IconLinkedIn,
  instagram: IconInstagram,
  threads: IconThreads,
  dribbble: IconDribbble,
  behance: IconBehance,
} as const satisfies Record<string, SocialIcon>;

export type SocialKey = keyof typeof socialIconFor;

export const SOCIAL_KEYS = Object.keys(socialIconFor) as SocialKey[];

/** Display names: admin option labels and each chip's accessible name. */
export const SOCIAL_LABELS: Record<SocialKey, string> = {
  x: "X",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  threads: "Threads",
  dribbble: "Dribbble",
  behance: "Behance",
};

export function isSocialKey(key: string): key is SocialKey {
  return Object.hasOwn(socialIconFor, key);
}

/**
 * Resolve a platform key to its icon. A key written through the API can fall
 * outside the closed set, and React throws on an undefined component, so
 * unknown keys resolve to a neutral outbound-link icon.
 */
export function resolveSocialIcon(key: string): SocialIcon {
  return isSocialKey(key) ? socialIconFor[key] : IconExternal;
}
