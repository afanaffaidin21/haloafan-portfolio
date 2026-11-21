/**
 * Pure helpers for the seed's media pass. They live apart from `seed.ts`,
 * which boots Payload on import, so the counting rules can be tested.
 */

/** The files a seed source directory contributes: dotfiles are skipped. */
export function seedFiles(names: readonly string[]): string[] {
  return names.filter((name) => !name.startsWith(".")).sort();
}

export type MediaCount = {
  /** One record per seed source file. */
  expected: number;
  /** Records whose filename is a seed source file. */
  found: number;
  /** Seed source files with no record. */
  missing: string[];
};

/**
 * Compare the Media records against the files the seed uploads. Records the
 * owner uploaded in the admin are not seed records, so they are not counted.
 */
export function countSeededMedia(
  docs: readonly { filename?: string | null }[],
  sources: readonly string[],
): MediaCount {
  const wanted = new Set(sources);
  const stored = new Set(docs.flatMap((doc) => (doc.filename && wanted.has(doc.filename) ? [doc.filename] : [])));
  return {
    expected: wanted.size,
    found: stored.size,
    missing: [...wanted].filter((name) => !stored.has(name)),
  };
}

/**
 * Map every seed filename to its source path. Media records are keyed by
 * filename, so the same name in two source directories is an error rather
 * than a silent overwrite.
 */
export function seedSourceMap(dirs: readonly { dir: string; names: readonly string[] }[]): Map<string, string> {
  const sources = new Map<string, string>();
  for (const { dir, names } of dirs) {
    for (const name of seedFiles(names)) {
      const taken = sources.get(name);
      if (taken) throw new Error(`"${name}" is in more than one seed directory (${taken} and ${dir}/${name})`);
      sources.set(name, `${dir}/${name}`);
    }
  }
  return sources;
}

/** A stored Media doc, as far as file checks are concerned. */
export type MediaFiles = {
  filename?: string | null;
  url?: string | null;
  sizes?: Record<string, { filename?: string | null; url?: string | null } | null | undefined> | null;
};

/**
 * Where each file of a Media doc lives: the original and every generated
 * size. Locally that is `./media/<filename>`; with R2 it is the public URL
 * Payload stored for each file.
 */
export function mediaLocations(doc: MediaFiles, mode: { local: string } | { remote: true }): string[] {
  const sizes = Object.values(doc.sizes ?? {}).filter((s): s is NonNullable<typeof s> => Boolean(s));
  if ("local" in mode) {
    return [doc.filename, ...sizes.map((s) => s.filename)].filter((f): f is string => Boolean(f)).map((f) => `${mode.local}/${f}`);
  }
  return [doc.url, ...sizes.map((s) => s.url)].filter((u): u is string => Boolean(u));
}

/**
 * The files of `doc` that `exists` cannot find. An empty list means the
 * record is whole; anything else is re-uploaded from its seed source.
 */
export async function missingFiles(
  doc: MediaFiles,
  mode: { local: string } | { remote: true },
  exists: (location: string) => Promise<boolean>,
): Promise<string[]> {
  const locations = mediaLocations(doc, mode);
  if (locations.length === 0) return ["(no file recorded)"];
  const found = await Promise.all(locations.map(exists));
  return locations.filter((_, i) => !found[i]);
}

/** Migrations in the repo that the database has not recorded as run. */
export function pendingMigrations(applied: readonly string[], all: readonly string[]): string[] {
  const done = new Set(applied);
  return all.filter((name) => !done.has(name));
}
