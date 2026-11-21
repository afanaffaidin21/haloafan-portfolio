import Link from "next/link";
import { notFound } from "next/navigation";
import { RevealWords } from "@/components/motion-primitives";
import { Markdown } from "@/components/markdown";
import { IconX } from "@/components/icons";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import type { Metadata } from "next";
import { getPost, getPosts, getSiteSettings } from "@/lib/content";
import { DEFAULT_OG_IMAGE, pageTitle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSiteSettings()]);
  if (!post) return {};
  const title = pageTitle(post.title, settings.name);
  const description = post.description || settings.seo.description;
  const images = [post.image || settings.seo.ogImage || DEFAULT_OG_IMAGE];
  return {
    title,
    description,
    openGraph: { type: "article", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, posts, settings] = await Promise.all([
    getPost(slug),
    getPosts(),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  const more = posts.filter((p) => p.slug !== slug).slice(0, 4);
  const body = post.body.replace(/^#\s.*$/m, "").trim();
  const xUrl = settings.socials.find((s) => s.platform === "x")?.url ?? "";
  const { blog } = settings.copy;

  return (
    <>
      <section className="flex w-full flex-col items-center pt-36">
        <div className="container-1080 flex flex-col gap-6 pb-12">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/blog/" className="t-micro transition-opacity hover:opacity-60">
              Blog
            </Link>
            {post.category ? <p className="t-micro">/</p> : null}
            {post.category ? <p className="t-micro text-ink-2">{post.category}</p> : null}
            <p className="t-micro">/</p>
            <p className="t-micro text-ink-2">{post.title}</p>
          </div>

          <h1 className="t-h1 max-w-[580px]" style={{ fontSize: 48, lineHeight: "52.8px", letterSpacing: "-1.44px" }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-3">
            {post.date ? <time className="t-micro text-ink-2 whitespace-pre">{post.date}</time> : null}
            <p className="t-micro whitespace-pre">By {settings.name}</p>
          </div>

          {post.description ? <p className="t-body max-w-[580px]">{post.description}</p> : null}
        </div>

        <div className="container-1080">
          <div className={`relative aspect-[992/500] w-full overflow-hidden rounded-[16px]${emptyFrame(post.image)}`}>
            <MaybeImg src={post.image} alt="" className="size-full object-cover" />
          </div>
        </div>
      </section>

      <section className="section-pad flex w-full justify-center pt-16">
        <div className="container-1080 flex flex-col gap-16">
          <div className="mx-auto flex w-full max-w-[672px] flex-col gap-16">
            <Markdown source={body} />

            <div className="flex flex-col gap-4 rounded-[16px] bg-surface p-6 shadow-card">
              <p className="t-body-lg">{blog.followTitle}</p>
              <p className="t-body-sm text-ink-2">{blog.followBody}</p>
              {xUrl && settings.followerCount ? (
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[30px] w-fit items-center gap-1 rounded-[24px] bg-invert px-2 text-invert-ink"
                >
                  <IconX className="size-3.5" strokeWidth={1.5} />
                  <span className="t-micro">{settings.followerCount}</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad flex w-full flex-col items-center gap-16 pt-0">
        <div className="container-1080 flex flex-col gap-16">
          <div className="flex items-end justify-between gap-6">
            <h2 className="t-h2">
              <RevealWords text={blog.moreHeading} />
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
            {more.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="group flex items-center gap-4 rounded-[16px] bg-surface p-4 shadow-card transition-opacity hover:opacity-90"
              >
                <span className={`relative block size-16 shrink-0 overflow-hidden rounded-[12px]${emptyFrame(p.image)}`}>
                  <MaybeImg src={p.image} alt="" className="size-16 object-cover" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="t-body truncate">{p.title}</span>
                  {p.date ? <time className="t-micro text-ink-2">{p.date}</time> : null}
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
    </>
  );
}
