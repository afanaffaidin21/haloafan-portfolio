import Link from "next/link";
import { RevealWords } from "@/components/motion-primitives";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import { articlesLayout } from "@/lib/select";
import type { Post } from "@/content/posts";
import type { SiteSettingsView } from "@/lib/content";

function Card({
  slug,
  title,
  category,
  date,
  image,
  description,
  author,
  wide = false,
}: {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  description: string;
  author: string;
  wide?: boolean;
}) {
  return (
    <Link
      href={`/blog/${slug}/`}
      className={`group flex size-full overflow-hidden rounded-[16px] border border-line bg-surface shadow-card ${
        wide ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          wide ? "aspect-[496/500] md:w-1/2" : "aspect-[490/276] w-full"
        }${emptyFrame(image)}`}
      >
        <MaybeImg
          src={image}
          alt=""
          className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div
        className={`flex flex-col gap-4 p-8 ${
          wide ? "flex-1 justify-center" : "flex-1"
        }`}
      >
        <div className="flex flex-col gap-4">
          {category ? <p className="t-micro text-ink-2">{category}</p> : null}
          <h3 className={`whitespace-pre-wrap ${wide ? "t-h4" : "t-h4"}`}>{title}</h3>
          <div className="flex items-center gap-3">
            {date ? <time className="t-micro text-ink-2 whitespace-pre">{date}</time> : null}
            <p className="t-micro whitespace-pre">By {author}</p>
          </div>
        </div>
        {wide && description ? (
          <p className="t-body-sm text-ink-2 line-clamp-3">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Articles: heading + View All, then a 2-col grid where the first card spans
 * both columns (992x500) and the next two are 490x400.
 */
export function Articles({
  posts,
  author,
  copy,
}: {
  posts: Post[];
  author: string;
  copy: SiteSettingsView["copy"]["articles"];
}) {
  const layout = articlesLayout(posts);
  if (!layout) return null;
  const { featured, second, third } = layout;

  return (
    <section className="section-pad flex w-full flex-col items-center gap-16">
      <div className="container-1080 flex flex-col gap-16">
        <div className="flex items-end justify-between gap-6">
          <h2 className="t-h2">
            <RevealWords text={copy.heading.line1} />
            <br />
            <RevealWords text={copy.heading.line2} delay={0.08} />
          </h2>
          <Link href="/blog/" className="flex shrink-0 items-center gap-1 pb-1">
            <span className="t-body-lg whitespace-pre">View All</span>
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
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2 md:h-[500px]">
            <Card author={author}
              wide
              slug={featured.slug}
              title={featured.title}
              category={featured.category}
              date={featured.date}
              image={featured.image}
              description={featured.description}
            />
          </div>
          <div className="md:min-h-[400px]">
            <Card author={author}
              slug={second.slug}
              title={second.title}
              category={second.category}
              date={second.date}
              image={second.image}
              description={second.description}
            />
          </div>
          <div className="md:min-h-[400px]">
            <Card author={author}
              slug={third.slug}
              title={third.title}
              category={third.category}
              date={third.date}
              image={third.image}
              description={third.description}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
