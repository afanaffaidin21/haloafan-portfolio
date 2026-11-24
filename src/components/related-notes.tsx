import Link from "next/link";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import { RevealWords } from "@/components/motion-primitives";
import type { Post } from "@/content/posts";

/**
 * Up to three published notes referencing a project, rendered on the project
 * detail page right before "More Projects". Returns null when empty so the
 * project page DOM stays unchanged when no notes reference it.
 */
export function RelatedNotes({
  posts,
  heading,
}: {
  posts: Post[];
  heading: string;
}) {
  const items = posts.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section className="section-pad flex w-full flex-col items-center gap-12 pb-0">
      <div className="container-1080 flex flex-col gap-12">
        <h2 className="t-h2">
          <RevealWords text={heading} />
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group flex items-center gap-4 rounded-[16px] bg-surface p-4 shadow-card transition-opacity hover:opacity-90"
            >
              <span
                className={`relative block size-16 shrink-0 overflow-hidden rounded-[12px]${emptyFrame(post.image)}`}
              >
                <MaybeImg src={post.image} alt="" className="size-16 object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="t-body truncate">{post.title}</span>
                {post.date ? <time className="t-micro text-ink-2">{post.date}</time> : null}
              </span>
              <span className="grid size-[18px] shrink-0 place-items-center rounded-full bg-invert text-invert-ink">
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
          ))}
        </div>
      </div>
    </section>
  );
}
