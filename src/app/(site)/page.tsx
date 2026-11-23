import { Appear, RevealWords } from "@/components/motion-primitives";
import { ProjectShowcase } from "@/components/project-showcase";
import { Skills } from "@/components/skills";
import { About } from "@/components/about";
import { BigQuote } from "@/components/big-quote";
import { Faq } from "@/components/faq";
import { Articles } from "@/components/articles";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import { featuredProjects, heroLines as splitHero } from "@/lib/select";
import Link from "next/link";
import {
  getFaqs,
  getPosts,
  getProjects,
  getSiteSettings,
  getSkills,
} from "@/lib/content";

export const revalidate = 3600;

export default async function HomePage() {
  const [projects, settings, skills, faqs, posts] = await Promise.all([
    getProjects(),
    getSiteSettings(),
    getSkills(),
    getFaqs(),
    getPosts(),
  ]);

  // The collage floats the four featured projects out of the hero; the grid
  // lists the first six, so a fifth project never lands on the collage.
  const collage = featuredProjects(projects);
  const gridProjects = projects.slice(0, 6);
  // The reference headline is two lines, the first muted. Split the editor's
  // single-line tagline at its midpoint word so any copy keeps that shape.
  const heroLines = splitHero(settings.tagline, settings.name);

  return (
    <>
      {/* Hero: the four project cards start as a rotated collage here. */}
      <section className="relative z-[1] flex w-full flex-col items-center pt-36">
        <div className="container-1080 flex flex-col gap-8 pb-24">
          <div className="flex flex-col gap-6">
            <Appear delay={0.4} className="w-fit">
              <div className="flex h-[30px] w-fit items-center gap-2 rounded-[24px] bg-surface py-3 pl-2 pr-4 shadow-pill">
                <span className="relative grid size-4 place-items-center">
                  <span className="absolute block size-4 rounded-full bg-green opacity-60 motion-safe:animate-ping" />
                  <span className="block size-2 rounded-full bg-green" />
                </span>
                {settings.availabilityNote ? (
                  <p className="t-micro whitespace-pre">{settings.availabilityNote}</p>
                ) : null}
              </div>
            </Appear>

            <div className="flex flex-col gap-6">
              <h1 className="t-h1 max-w-[496px]">
                {heroLines.length > 1 ? (
                  <>
                    <span className="text-ink-3">{heroLines[0]}</span>
                    <br />
                    <span>{heroLines[1]}</span>
                  </>
                ) : (
                  <span>{heroLines[0]}</span>
                )}
              </h1>
              <p className="t-body-lg max-w-[390px] text-balance">
                <strong className="font-semibold">{settings.copy.hero.subcopyLead}</strong>{" "}
                <span className="text-ink-2">{settings.copy.hero.subcopyBody}</span>
              </p>
            </div>
          </div>

          <Appear delay={0.4} className="flex w-fit items-center gap-3">
            <a
              href={`mailto:${settings.email}`}
              className="flex h-11 items-center gap-2.5 rounded-[24px] bg-invert py-2 pl-2 pr-4 text-invert-ink shadow-btn transition-opacity hover:opacity-90"
            >
              <span className={`block size-7 overflow-hidden rounded-full${emptyFrame(settings.avatar)}`}>
                <MaybeImg src={settings.avatar} alt="" className="size-7 rounded-full object-cover" />
              </span>
              <span className="t-label whitespace-pre">Email me</span>
            </a>
            {settings.resume ? (
              <a
                href={settings.resume}
                download
                className="t-label flex h-11 items-center rounded-[24px] border border-line px-4 transition-opacity hover:opacity-70"
              >
                Download CV
              </a>
            ) : null}
          </Appear>
        </div>
      </section>

      {/* Latest Projects — the collage cards ease into this grid over 800px. */}
      <section className="section-pad flex w-full flex-col items-center">
        <div className="container-1080 flex flex-col items-center gap-16">
          <h2 className="t-h2 w-full">
            <RevealWords text={settings.copy.home.latestProjectsHeading} />
          </h2>
          <ProjectShowcase projects={gridProjects} collage={collage} />
          <Link href="/projects/" className="flex items-center gap-1 max-md:min-h-11">
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

      <BigQuote {...settings.bigQuote} />
      <Skills skills={skills} copy={settings.copy.skills} />
      <About workHistory={settings.workHistory} site={settings} photo={settings.avatarHero} copy={settings.copy.about} />
      <Faq
        faqs={faqs}
        avatar={settings.avatar}
        email={settings.email}
        resume={settings.resume}
        copy={settings.copy.faq}
      />
      <Articles posts={posts} author={settings.name} copy={settings.copy.articles} />
    </>
  );
}
