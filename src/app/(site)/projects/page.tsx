import { Fragment } from "react";
import { ProjectCard } from "@/components/project-card";
import { IconDownload, IconMail } from "@/components/icons";
import { getProjects, getSiteSettings } from "@/lib/content";

export const revalidate = 3600;

/** One span per word, matching the reference heading markup. */
function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span>{word}</span>
    </Fragment>
  ));
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ]);
  const { projects: copy, contactCta } = settings.copy;

  return (
    <>
      <section className="flex w-full flex-col items-center pt-36">
        <div className="container-1080 flex flex-col items-center gap-6 pb-16 text-center">
          <h1 className="t-h2 max-w-[580px]">
            <Words text={copy.title.line1} />
            <br />
            <Words text={copy.title.line2} />
          </h1>
          <p className="t-body-lg max-w-[580px]">{copy.subtitle}</p>
        </div>
      </section>

      <section className="section-pad flex w-full flex-col items-center pt-0">
        <div className="container-1080">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad flex w-full justify-center">
        <div className="container-1080">
          <div className="flex flex-col items-center gap-6 rounded-[16px] bg-surface p-8 shadow-card">
            <h2 className="t-h2 text-center">
              <span className="text-ink-3">{contactCta.line1}</span>
              <br />
              {contactCta.line2}
            </h2>
            <div className="flex items-center gap-[18px]">
              <a
                href={`mailto:${settings.email}`}
                className="flex h-11 items-center gap-2 rounded-[24px] bg-invert px-3 text-invert-ink shadow-btn transition-opacity hover:opacity-90"
              >
                <IconMail className="size-[18px] text-invert-ink" strokeWidth={1.5} />
                <span className="t-label whitespace-pre">Email me</span>
              </a>
              {settings.resume ? (
                <a
                  href={settings.resume}
                  download
                  className="flex h-11 items-center gap-2 rounded-[24px] border border-line px-3 transition-opacity hover:opacity-70"
                >
                  <IconDownload className="size-[18px]" strokeWidth={1.5} />
                  <span className="t-label whitespace-pre">Download CV</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
