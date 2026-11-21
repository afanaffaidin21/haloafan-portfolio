import type { Payload } from "payload";

const FALLBACK_NAME = "Afan Affaidin";

/** The brand name lives in the CMS; one read with a static fallback. */
export async function readAdminName(payload: Payload): Promise<string> {
  try {
    const settings = (await payload.findGlobal({
      slug: "site-settings",
      depth: 0,
      overrideAccess: true,
    })) as { name?: string | null } | null;
    return settings?.name?.trim() || FALLBACK_NAME;
  } catch {
    return FALLBACK_NAME;
  }
}

export async function AdminLogo({ payload }: { payload: Payload }) {
  const name = await readAdminName(payload);
  return <span className="padmin-wordmark">{name}</span>;
}

/**
 * StepNav home mark (18px) and the admin OG image (38px, `fill` passed by the
 * OG route). No stylesheet or hooks, so both paths render the same SVG.
 */
export function AdminIcon({ fill = "currentColor" }: { fill?: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 18 18" aria-hidden>
      <path
        fill={fill}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 0h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4Zm5 4.6L5.4 13.4h1.9l.7-2h2l.7 2h1.9L9 4.6Zm0 3.2L8.4 10h1.2L9 7.8Z"
      />
    </svg>
  );
}
