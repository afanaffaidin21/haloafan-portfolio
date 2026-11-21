import type { ReactElement } from "react";

import { IconAI, IconPerformance, IconSupport, IconUX, IconWebApp, IconWordPress } from "../components/icons";
import {
  ToolChatGPT,
  ToolClaude,
  ToolElementor,
  ToolFigma,
  ToolGemini,
  ToolNextJs,
  ToolPHP,
  ToolReact,
  ToolSupabase,
  ToolTypeScript,
  ToolWooCommerce,
  ToolWordPress,
} from "../components/tool-logos";

/**
 * Closed registry of the service-row icons. Keys are lowercase semantics and
 * back the `Skills.icon` select; they are also the only keys `resolveIcon`
 * recognises.
 */
export const iconFor = {
  wordpress: IconWordPress,
  webapp: IconWebApp,
  ai: IconAI,
  ux: IconUX,
  support: IconSupport,
  performance: IconPerformance,
} as const;

/**
 * Closed registry of the tech-stack tile logos. Keys are product names as
 * written ("Next.js") and back the `Skills.tool` select. The two maps are
 * deliberately separate: they resolve to different components and use
 * different key conventions (`wordpress` vs `WordPress`).
 */
export const toolFor: Record<string, (p: { className?: string }) => ReactElement> = {
  WordPress: ToolWordPress,
  Elementor: ToolElementor,
  WooCommerce: ToolWooCommerce,
  PHP: ToolPHP,
  "Next.js": ToolNextJs,
  React: ToolReact,
  TypeScript: ToolTypeScript,
  Supabase: ToolSupabase,
  Figma: ToolFigma,
  Gemini: ToolGemini,
  ChatGPT: ToolChatGPT,
  Claude: ToolClaude,
};

export const ICON_KEYS: readonly string[] = Object.keys(iconFor);
export const TOOL_KEYS: readonly string[] = Object.keys(toolFor);

export type SkillIcon = (typeof iconFor)[keyof typeof iconFor];
export type ToolIcon = (p: { className?: string }) => ReactElement;

/** Widened view of the closed row-icon map for lookups by arbitrary string. */
const iconByKey: Readonly<Record<string, SkillIcon>> = iconFor;

/**
 * Resolve a row icon key to a component. A key saved via the API or a stale
 * seed can fall outside the closed set, and React would throw on an undefined
 * component, so unknown keys resolve to the neutral web-app icon.
 */
export function resolveIcon(key: string): SkillIcon {
  return iconByKey[key] ?? IconWebApp;
}

/**
 * Resolve a tech-stack tile key to a component, with the same neutral
 * fallback. Separate from `resolveIcon` because tool logos accept only
 * `className`.
 */
export function resolveTool(name: string): ToolIcon {
  return toolFor[name] ?? IconWebApp;
}
