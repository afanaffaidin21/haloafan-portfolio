import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { TextCycle } from "@/components/text-cycle";
import { SOCIAL_LABELS, resolveSocialIcon } from "@/lib/social-icons";
import type { SiteSettingsView } from "@/lib/content";

const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? "";

export function Footer({
  name,
  email,
  resume,
  socials,
  followerCount,
  copyright,
  wordmark,
  copy,
}: {
  name: string;
  email: string;
  resume: string;
  socials: SiteSettingsView["socials"];
  followerCount: string;
  copyright: string;
  wordmark: string;
  copy: SiteSettingsView["copy"]["footer"];
}) {
  // Chips follow the CMS order; only the X chip carries the follower count.
  const links = socials.map((s) => ({
    href: s.url,
    label: SOCIAL_LABELS[s.platform],
    icon: resolveSocialIcon(s.platform),
    count: s.platform === "x" ? followerCount : "",
  }));

  return (
    <footer className="relative w-full overflow-hidden bg-invert">
      <div className="container-1080 flex flex-col gap-6 pb-[211px] pt-16">
        <div className="flex flex-col gap-12 border-b-0 pb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <p className="t-h1 whitespace-pre text-invert-ink">{copy.lead}</p>
              <TextCycle words={copy.cycleWords} />
            </div>
            <p className="t-h1 whitespace-pre text-invert-ink-2">{copy.line2}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="t-label text-invert-ink-2">Email</p>
              <a
                href={`mailto:${email}`}
                className="t-body-lg text-invert-ink transition-opacity hover:opacity-70 max-md:relative max-md:tap-target"
              >
                {email}
              </a>
            </div>
            {resume ? (
              <div className="flex flex-col gap-2">
                <p className="t-label text-invert-ink-2">CV</p>
                <a
                  href={resume}
                  download
                  className="t-body-lg text-invert-ink transition-opacity hover:opacity-70 max-md:relative max-md:tap-target"
                >
                  Download CV
                </a>
              </div>
            ) : null}
            <div className="flex flex-col gap-4">
              <p className="t-label text-invert-ink-2">Social</p>
              <div className="flex flex-wrap items-center gap-[6px] max-md:gap-[14px]">
                {links.map((s2, i) => (
                  <a
                    key={`${s2.label}-${i}`}
                    href={s2.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s2.label}
                    className="flex h-[30px] items-center gap-1 rounded-[24px] bg-surface p-2 text-ink backdrop-blur-[10px] transition-opacity hover:opacity-80 max-md:relative max-md:tap-target"
                  >
                    <s2.icon className="size-3.5" strokeWidth={1.5} />
                    {s2.count ? <span className="t-micro">{s2.count}</span> : null}
                  </a>
                ))}
                <ThemeToggle className="grid size-[30px] shrink-0 place-items-center rounded-[24px] border border-invert-ink/30 text-invert-ink transition-opacity hover:opacity-80 max-md:relative max-md:tap-target" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between max-md:flex-col max-md:items-start max-md:gap-4">
          <div className="flex flex-col gap-[18px]">
            <p className="t-micro text-invert-ink-2">Menu</p>
            <div className="flex items-center gap-2.5 max-md:gap-5">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="t-micro text-invert-ink transition-opacity hover:opacity-70 max-md:relative max-md:tap-target"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <p className="t-micro text-invert-ink-3">{copyright}</p>
        </div>
      </div>

      {/* Fit-text wordmark: 992x272 svg (viewBox 0 0 1080 296) that scales the
          296px word to the container width, exactly like the reference.
          Below 768px the copyright sits on its own line under the menu (the
          menu links are spaced for 44px touch targets), so the wordmark moves
          down by that line and its gap: 13 + 16 = 29px. */}
      <div
        className="pointer-events-none absolute left-1/2 top-[430px] w-[1080px] max-w-full -translate-x-1/2 px-11 max-md:top-[459px]"
        aria-hidden
      >
        <svg
          viewBox="0 0 1080 296"
          className="block h-[272px] w-full"
        >
          <foreignObject width="100%" height="100%">
            <p
              className="whitespace-pre text-center text-invert-ink"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 296.143,
                lineHeight: "296.143px",
                letterSpacing: "-8.8843px",
                fontWeight: 500,
              }}
            >
              {wordmark || firstName(name).toUpperCase()}
            </p>
          </foreignObject>
        </svg>
      </div>
    </footer>
  );
}
