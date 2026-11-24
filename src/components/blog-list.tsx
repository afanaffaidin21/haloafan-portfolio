"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import type { Post } from "@/content/posts";

function Card({
  slug,
  title,
  category,
  date,
  image,
  description,
  author,
}: {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  description: string;
  author: string;
}) {
  return (
    <Link
      href={`/blog/${slug}/`}
      className="group flex flex-col overflow-hidden rounded-[16px] bg-surface shadow-card"
    >
      <div className={`relative aspect-[490/276] w-full overflow-hidden${emptyFrame(image)}`}>
        <MaybeImg
          src={image}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex min-h-[216px] flex-col gap-4 p-8">
        <div className="flex flex-col gap-4">
          {category ? <p className="t-micro text-ink-2">{category}</p> : null}
          <h3 className="t-h4 whitespace-pre-wrap">{title}</h3>
          <div className="flex items-center gap-3">
            {date ? <time className="t-micro text-ink-2 whitespace-pre">{date}</time> : null}
            <p className="t-micro whitespace-pre">By {author}</p>
          </div>
        </div>
        {description ? <p className="t-body-sm line-clamp-3 text-ink-2">{description}</p> : null}
      </div>
    </Link>
  );
}

/**
 * Search + category filter over the CMS posts, with the newest post featured.
 * With no posts it shows the `empty` message instead, or nothing without one.
 */
export function BlogList({ posts, author, empty = "" }: { posts: Post[]; author: string; empty?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  // A post without a category stays under "All" instead of adding a blank option.
  const categories = ["All", ...new Set(posts.map((p) => p.category).filter(Boolean))];

  const [featured, ...rest] = posts;
  const listed = rest.slice(0, 5);

  // While a filter is active the featured card must obey it too, and the grid
  // searches the whole collection rather than the four-card rest list.
  const active = category !== "All" || query.trim().length > 0;

  const filtered = useMemo(() => {
    return (active ? posts : listed).filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category, active, posts, listed]);

  if (!featured) {
    return empty ? (
      <section className="section-pad flex w-full flex-col items-center">
        <div className="container-1080 flex justify-center">
          <p className="t-body text-center text-ink-2">{empty}</p>
        </div>
      </section>
    ) : null;
  }

  return (
    <>
      <section className="flex w-full flex-col items-center pt-16">
        <div className="container-1080 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex h-11 items-center gap-2 rounded-[24px] bg-surface px-4 shadow-card">
              <span className="t-micro text-ink-2">Search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="t-body-sm w-32 bg-transparent outline-none"
                placeholder="Search…"
                aria-label="Search articles"
              />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-[24px] bg-surface px-4 shadow-card">
              <span className="t-micro text-ink-2">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="t-body-sm bg-transparent outline-none"
                aria-label="Filter by category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {active ? null : (
          <Link
            href={`/blog/${featured.slug}/`}
            className="group grid grid-cols-1 overflow-hidden rounded-[16px] border border-line bg-surface shadow-card md:grid-cols-2"
          >
            <div className={`relative aspect-[496/500] w-full overflow-hidden${emptyFrame(featured.image)}`}>
              <MaybeImg
                src={featured.image}
                alt=""
                className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex items-center p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  {featured.category ? (
                    <p className="t-micro text-ink-2">{featured.category}</p>
                  ) : null}
                  <h2 className="t-h4">{featured.title}</h2>
                  <div className="flex items-center gap-3">
                    {featured.date ? (
                      <time className="t-micro text-ink-2 whitespace-pre">
                        {featured.date}
                      </time>
                    ) : null}
                    <p className="t-micro whitespace-pre">By {author}</p>
                  </div>
                </div>
                {featured.description ? (
                  <p className="t-body-sm text-ink-2">{featured.description}</p>
                ) : null}
              </div>
            </div>
          </Link>
          )}
        </div>
      </section>

      <section className="section-pad flex w-full flex-col items-center">
        <div className="container-1080 flex flex-col gap-14">
          {active && filtered.length === 0 ? (
            <p className="t-body text-ink-2">No articles match that search.</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((p) => (
              <Card author={author}
                key={p.slug}
                slug={p.slug}
                title={p.title}
                category={p.category}
                date={p.date}
                image={p.image}
                description={p.description}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
