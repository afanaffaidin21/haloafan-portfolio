import { Fragment } from "react";
import Link from "next/link";
import type { Post } from "@/content/posts";
import type { SiteSettingsView } from "@/lib/content";
import type { SiteCopy } from "@/lib/copy-defaults";
import { SOCIAL_LABELS, resolveSocialIcon } from "@/lib/social-icons";

/**
 * Article header metadata: tools used, related portfolio projects, and the
 * AI-assistance disclosure. Every line drops itself when empty, and the
 * wrapper returns null when nothing applies.
 */
export function ArticleMeta({
  post,
  copy,
}: {
  post: Post;
  copy: SiteCopy["blog"];
}) {
  const hasTools = post.tools.length > 0;
  const hasRelated = post.relatedProjects.length > 0;
  const hasDisclosure = post.aiAssisted;

  if (!hasTools && !hasRelated && !hasDisclosure) return null;

  return (
    <div className="flex max-w-[580px] flex-col gap-2">
      {hasTools || hasRelated ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {hasTools ? (
            <p className="t-body-sm text-ink-2">
              {`${copy.toolsLabel}: ${post.tools.join(", ")}`}
            </p>
          ) : null}
          {hasRelated ? (
            <p className="t-body-sm text-ink-2">
              {`${copy.relatedLabel}: `}
              {post.relatedProjects.map((project, index) => (
                <Fragment key={project.slug}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={`/projects/${project.slug}/`}
                    className="text-ink underline decoration-ink-3 underline-offset-4 transition-opacity duration-300 hover:opacity-70"
                  >
                    {project.name || project.slug}
                  </Link>
                </Fragment>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}
      {hasDisclosure ? (
        <p className="t-micro text-ink-2">{copy.aiDisclosure}</p>
      ) : null}
    </div>
  );
}

/** Outbound links to external threads or videos discussing the article. */
export function DiscussionLinks({
  items,
  label,
}: {
  items: Post["discussion"];
  label: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
      <p className="t-label text-ink-2">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const Icon = resolveSocialIcon(item.platform);
          const platformLabel = SOCIAL_LABELS[item.platform] ?? item.platform;
          return (
            <a
              key={`${item.platform}-${index}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label}: ${platformLabel}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[24px] bg-surface px-3 text-ink shadow-card transition-opacity duration-300 hover:opacity-70 max-md:min-h-11"
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
              <span className="t-micro">{platformLabel}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/** Closing social card on article pages, linking to every configured CMS social profile. */
export function FollowCard({
  title,
  body,
  socials,
  followerCount = "",
}: {
  title: string;
  body: string;
  socials: SiteSettingsView["socials"];
  followerCount?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[16px] bg-surface p-6 shadow-card">
      <p className="t-body-lg">{title}</p>
      <p className="t-body-sm text-ink-2">{body}</p>
      {socials.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {socials.map((item, index) => {
            const Icon = resolveSocialIcon(item.platform);
            const platformLabel = SOCIAL_LABELS[item.platform] ?? item.platform;
            const count = item.platform === "x" ? followerCount : "";
            return (
              <a
                key={`${item.platform}-${index}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platformLabel}
                className="inline-flex h-9 items-center gap-1.5 rounded-[24px] bg-invert px-3 text-invert-ink transition-opacity duration-300 hover:opacity-80 max-md:min-h-11"
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.5} />
                <span className="t-micro">{platformLabel}</span>
                {count ? <span className="t-micro text-invert-ink-2">{count}</span> : null}
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
