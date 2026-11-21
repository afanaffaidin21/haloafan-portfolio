import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SmoothScroll, StickyCta } from "@/components/chrome";
import { getSiteSettings } from "@/lib/content";
import { DEFAULT_OG_IMAGE, siteOrigin } from "@/lib/seo";
import { THEME_KEY } from "@/lib/theme";
import type { Metadata } from "next";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seo.title || `${settings.name} — ${settings.role}`;
  const description = settings.seo.description || settings.tagline;
  const image = settings.seo.ogImage || DEFAULT_OG_IMAGE;

  return {
    metadataBase: new URL(siteOrigin()),
    title,
    description,
    openGraph: { type: "website", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint: dark is opt-in, so the default stays light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <div className="relative flex min-h-screen w-full flex-col items-center">
          {/* Page frame: 1080px wide hairline rules down the full page height. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 z-[1] w-full max-w-[1080px] -translate-x-1/2 border-x border-line"
          />
          <Nav avatar={settings.avatar} name={settings.name} email={settings.email} />
          <main className="flex w-full flex-col items-center">{children}</main>
          <Footer
            name={settings.name}
            email={settings.email}
            resume={settings.resume}
            socials={settings.socials}
            followerCount={settings.followerCount}
            copyright={settings.copyright}
            wordmark={settings.footerWordmark}
            copy={settings.copy.footer}
          />
          <StickyCta email={settings.email} resume={settings.resume} />
        </div>
      </body>
    </html>
  );
}
