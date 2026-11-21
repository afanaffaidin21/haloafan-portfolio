const DEV_SECRET = "dev-only-secret";

/**
 * Payload signs admin sessions with this secret. Production must supply its
 * own; the fixed fallback only exists so development and tests boot without one.
 */
export function payloadSecret(env: Record<string, string | undefined> = process.env): string {
  if (env.PAYLOAD_SECRET) return env.PAYLOAD_SECRET;
  if (env.NODE_ENV === "production") {
    throw new Error("PAYLOAD_SECRET is not set. Set it in the production environment before starting Payload.");
  }
  return DEV_SECRET;
}
