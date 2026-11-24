import type { Access } from "payload";

export type Role = "owner" | "agent";

function getRole(user: unknown): unknown {
  if (typeof user !== "object" || user === null) return undefined;
  return (user as { role?: unknown }).role;
}

export function isOwner(user: unknown): boolean {
  return getRole(user) === "owner";
}

export function isAgent(user: unknown): boolean {
  return getRole(user) === "agent";
}

export const ownerOnly: Access = ({ req }) => isOwner(req.user);

export const ownerOrAgent: Access = ({ req }) => isOwner(req.user) || isAgent(req.user);
