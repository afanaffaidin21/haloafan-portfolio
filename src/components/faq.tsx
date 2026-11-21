import { FaqAccordion } from "@/components/faq-accordion";
import { RevealWords } from "@/components/motion-primitives";
import { IconDownload, IconMail } from "@/components/icons";
import { MaybeImg, emptyFrame } from "@/components/maybe-img";
import type { FaqView, SiteSettingsView } from "@/lib/content";

/**
 * FAQ: left 1.5fr (heading + 5 accordion rows), right sticky card
 * (422x362, radius 16, white, card shadow, top:88px) with avatar,
 * two-tone heading, description, black email CTA + CV download.
 */
export function Faq({
  faqs,
  avatar,
  email,
  resume,
  copy,
}: {
  faqs: FaqView[];
  avatar: string;
  email: string;
  resume: string;
  copy: SiteSettingsView["copy"]["faq"];
}) {
  return (
    <section id="contact" className="section-pad flex w-full justify-center">
      <div className="container-1080 flex flex-col items-start gap-8 lg:grid lg:grid-cols-[14fr_11fr] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-16">
          <h2 className="t-h2">
            <RevealWords text={copy.heading.line1} />
            <br />
            <RevealWords text={copy.heading.line2} tone="muted" delay={0.08} />
          </h2>
          <FaqAccordion faqs={faqs} />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-8 rounded-[16px] bg-surface p-8 shadow-card lg:sticky lg:top-[88px]">
          <div className="flex flex-col gap-6">
            <span className={`block size-16 overflow-hidden rounded-full${emptyFrame(avatar)}`}>
              <MaybeImg
                src={avatar}
                alt=""
                className="size-16 rounded-full object-cover"
              />
            </span>
            <h3 className="t-h3 text-balance">
              <span className="text-ink-3">{copy.cardHeading.line1}</span>
              <br />
              {copy.cardHeading.line2}
            </h3>
            <p className="t-body-sm">{copy.cardBody}</p>
          </div>
          <div className="flex items-center gap-[18px]">
            <a
              href={`mailto:${email}`}
              className="flex h-11 items-center gap-2 rounded-[24px] bg-invert px-3 text-invert-ink shadow-btn transition-opacity hover:opacity-90"
            >
              <IconMail className="size-[18px] text-invert-ink" strokeWidth={1.5} />
              <span className="t-label whitespace-pre">Email me</span>
            </a>
            {resume ? (
              <a
                href={resume}
                download
                className="flex h-11 items-center gap-2 rounded-[24px] border border-line px-3 text-ink transition-opacity hover:opacity-70"
              >
                <IconDownload className="size-[18px]" strokeWidth={1.5} />
                <span className="t-label whitespace-pre">Download CV</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
