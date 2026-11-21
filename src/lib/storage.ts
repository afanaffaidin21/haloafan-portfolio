const R2_ENV_KEYS = [
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_ENDPOINT",
  "R2_PUBLIC_URL",
] as const;

/**
 * Uploads go to Cloudflare R2 only when every credential and the public URL
 * are present. Without them (local development) Media keeps writing to
 * `./media`, because the production filesystem on Vercel is read-only
 * outside `/tmp`.
 */
export function storageEnabled(): boolean {
  return R2_ENV_KEYS.every((key) => Boolean(process.env[key]));
}

/**
 * The public URL of an R2 object: the bucket's custom domain, then the
 * object key (`<prefix>/<filename>`, or just the filename). Files are read
 * straight from R2, not through Payload's /api/media/file route.
 */
export function r2FileUrl(publicUrl: string, filename: string, prefix?: string | null): string {
  const base = publicUrl.replace(/\/+$/, "");
  const dir = (prefix ?? "").replace(/^\/+|\/+$/g, "");
  return [base, ...(dir ? dir.split("/").map(encodeURIComponent) : []), encodeURIComponent(filename)].join("/");
}
