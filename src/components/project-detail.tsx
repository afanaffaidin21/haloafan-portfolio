import { IconExternal } from "@/components/icons";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import type { ProjectRow } from "@/lib/content";

/*
 * The project detail page, split so each part renders without a database.
 * Every optional field hides its own element when empty: no empty links, no
 * label without a value, no section without content. With every field filled
 * the markup is the page's original markup.
 */

/** A chip key that stays the plain label unless the label repeats. */
const chipKey = (items: string[], item: string, index: number): string =>
  items.indexOf(item) === index ? item : `${item}-${index}`;

/**
 * "Scope of Work" / "Tech": a muted label over a row of chips, or null. A plain
 * function, so the hero can tell whether the group rendered before placing it.
 */
function chipGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="t-body text-ink-2">{label}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((s, i) => (
          <span
            key={chipKey(items, s, i)}
            className="t-micro rounded-full bg-surface px-3 py-2 shadow-card"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex w-fit items-center gap-1.5 pb-1 max-md:min-h-11"
      target="_blank"
      rel="noreferrer"
    >
      <span className="t-body-lg whitespace-pre">{label}</span>
      <IconExternal className="size-[18px] text-ink" />
    </a>
  );
}

export function ProjectHero({ project }: { project: ProjectRow }) {
  const scope = chipGroup({ label: "Scope of Work", items: project.scope });
  const tech = chipGroup({ label: "Tech", items: project.tech ?? [] });
  const live = project.liveUrl ? <ExternalLink href={project.liveUrl} label="View Live Site" /> : null;
  const code = project.repoUrl ? <ExternalLink href={project.repoUrl} label="View Code" /> : null;

  return (
    <section className="flex w-full flex-col items-center pt-36">
      <div className="container-1080 flex flex-col items-center gap-6 pb-12 text-center">
        <h1 className="t-h1 max-w-[580px]">{project.heading || project.name}</h1>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* A personal project has no client; naming itself the client would misread. */}
          {project.kind === "experiment" && !project.client ? (
            <p className="t-body">
              <span className="text-ink-2">Type</span>{" "}
              <span className="font-semibold">Personal project</span>
            </p>
          ) : (
            <p className="t-body">
              <span className="text-ink-2">Client</span>{" "}
              <span className="font-semibold">{project.client || project.name}</span>
            </p>
          )}
          {project.year ? (
            <p className="t-body">
              <span className="text-ink-2">Year</span>{" "}
              <span className="font-semibold">{project.year}</span>
            </p>
          ) : null}
        </div>

        {project.description ? (
          <p className="t-body max-w-[580px] text-ink-2">{project.description}</p>
        ) : null}

        {/* Tech joins scope in one slot, so a project without it keeps the original markup. */}
        {tech ? (
          <div className="flex flex-col items-center gap-6">
            {scope}
            {tech}
          </div>
        ) : (
          scope
        )}

        {/* Paired actions sit 18px apart, like every other two-button row. */}
        {live && code ? (
          <div className="flex flex-wrap items-center justify-center gap-[18px]">
            {live}
            {code}
          </div>
        ) : (
          (live ?? code)
        )}
      </div>
    </section>
  );
}

export function ProjectBlocks({ blocks }: { blocks: ProjectRow["blocks"] }) {
  if (blocks.length === 0) return null;
  return (
    <section className="section-pad flex w-full justify-center pt-0">
      <div className="container-1080 flex flex-col gap-10">
        {blocks.map((block, bi) => (
          <div key={bi} className="flex flex-col gap-10">
            {block.tiles.length > 0 ? (
              <div
                className={`grid gap-2 ${
                  block.layout === "full"
                    ? "grid-cols-1"
                    : block.layout === "two"
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {block.tiles.map((tile, ti) => (
                  <div
                    key={ti}
                    className="relative overflow-hidden rounded-[16px] bg-surface-muted"
                  >
                    {tile.kind === "video" ? (
                      tile.poster ? (
                        <video
                          src={tile.src}
                          poster={tile.poster}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="h-auto w-full object-cover"
                        />
                      ) : (
                        <video
                          src={tile.src}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="aspect-video w-full object-cover"
                        />
                      )
                    ) : tile.mobileSrc && tile.src ? (
                      // `contents` keeps the box tree of a bare <img>, so wide screens lay out as before.
                      <picture className="contents">
                        <source media="(max-width: 767px)" srcSet={tile.mobileSrc} />
                        <MaybeImg src={tile.src} alt={tile.alt} loading="lazy" className="h-auto w-full object-cover" />
                      </picture>
                    ) : (
                      <MaybeImg
                        src={tile.src}
                        alt={tile.alt}
                        loading="lazy"
                        className="h-auto w-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {block.description ? (
              <div className="flex justify-center py-6">
                <div className="max-w-[580px]">
                  {block.description.heading ? (
                    <h2 className="t-h3 mb-3">{block.description.heading}</h2>
                  ) : null}
                  {block.description.text || block.description.bold ? (
                    <p className="t-body">
                      {block.description.text}
                      {block.description.bold ? (
                        <strong className="font-semibold">
                          {block.description.bold}
                        </strong>
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

const quoteClass =
  "max-w-[780px] text-center text-[28px] font-medium leading-[39.2px] tracking-[-0.84px]";

export function ProjectQuote({ quote }: { quote: ProjectRow["quote"] }) {
  if (!quote.text && !quote.bold) return null;

  const bold = quote.bold ? <strong className="font-semibold">{quote.bold}</strong> : null;
  const hasAttribution = Boolean(quote.name || quote.role);

  return (
    <section className="flex w-full flex-col items-center py-16">
      <div className="container-1080">
        <div className="flex flex-col items-center gap-6 p-6">
          {/* Two branches so a quote without a tail keeps its original markup. */}
          {quote.tail ? (
            <p className={quoteClass}>
              {quote.text}
              {bold}
              {quote.tail}
            </p>
          ) : (
            <p className={quoteClass}>
              {quote.text}
              {bold}
            </p>
          )}
          {hasAttribution || quote.avatar ? (
            <div className="flex items-center gap-3">
              <span className={`block size-[38px] overflow-hidden rounded-full${emptyFrame(quote.avatar)}`}>
                <MaybeImg
                  src={quote.avatar}
                  alt=""
                  className="size-[38px] object-cover"
                />
              </span>
              {hasAttribution ? (
                <div className="flex flex-col">
                  {quote.name ? <p className="t-label whitespace-pre">{quote.name}</p> : null}
                  {quote.role ? (
                    <p className="t-micro text-ink-2 whitespace-pre">
                      {quote.role}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
