import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { RevealWords } from "@/components/motion-primitives";
import { IconDownload, IconMail } from "@/components/icons";
import { ProjectBlocks, ProjectHero, ProjectQuote } from "@/components/project-detail";
import { RelatedNotes } from "@/components/related-notes";
import type { Metadata } from "next";
import { getPostsForProject, getProject, getProjects, getSiteSettings } from "@/lib/content";
import { DEFAULT_OG_IMAGE, pageTitle } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProject(slug), getSiteSettings()]);
  if (!project) return {};
  const title = pageTitle(project.name, settings.name);
  const description = project.description || settings.seo.description;
  const images = [project.thumbnail || settings.seo.ogImage || DEFAULT_OG_IMAGE];
  return {
    title,
    description,
    openGraph: { type: "article", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, settings, projects, relatedPosts] = await Promise.all([
    getProject(slug),
    getSiteSettings(),
    getProjects(),
    getPostsForProject(slug),
  ]);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== slug).slice(0, 2);
  const { project: copy, contactCta } = settings.copy;

  return (
    <>
      <ProjectHero project={project} />

      <main className="flex w-full flex-col items-center">
        <ProjectBlocks blocks={project.blocks} />
        <ProjectQuote quote={project.quote} />
        <RelatedNotes posts={relatedPosts} heading={copy.relatedNotesHeading} />

        <section className="section-pad flex w-full flex-col items-center gap-12">
          <div className="container-1080 flex flex-col gap-12">
            <h2 className="t-h2">
              <RevealWords text={copy.moreHeading} />
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col justify-center gap-3 rounded-[16px] bg-surface p-8 shadow-card">
                <p className="t-h4">{copy.placeholderCard}</p>
              </div>
              {others.slice(0, 1).map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
            <Link href="/projects/" className="flex w-fit items-center gap-1 max-md:min-h-11">
              <span className="t-body-lg whitespace-pre">View all my projects</span>
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
        </section>

        <section className="section-pad flex w-full justify-center">
          <div className="container-1080">
            <div className="flex flex-col items-center gap-6 rounded-[16px] bg-surface p-8 shadow-card">
              <h2 className="t-h2 text-center">
                <span className="text-ink-3">{contactCta.line1}</span>
                <br />
                <span>{contactCta.line2}</span>
              </h2>
              <div className="flex items-center gap-[18px]">
                <a
                  href={`mailto:${settings.email}`}
                  className="flex h-11 items-center gap-2 rounded-[24px] bg-invert px-3 text-invert-ink shadow-btn transition-opacity hover:opacity-90"
                >
                  <IconMail
                    className="size-[18px] text-invert-ink"
                    strokeWidth={1.5}
                  />
                  <span className="t-label whitespace-pre">Email me</span>
                </a>
                {settings.resume ? (
                  <a
                    href={settings.resume}
                    download
                    className="flex h-11 items-center gap-2 rounded-[24px] border border-line px-3 transition-opacity hover:opacity-70"
                  >
                    <IconDownload
                      className="size-[18px]"
                      strokeWidth={1.5}
                    />
                    <span className="t-label whitespace-pre">Download CV</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
