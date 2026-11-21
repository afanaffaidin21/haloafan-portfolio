import type { Payload } from "payload";
import { readAdminName } from "./AdminLogo";

const LINKS = [
  { href: "/admin/collections/projects", label: "Projects" },
  { href: "/admin/collections/posts", label: "Posts" },
  { href: "/admin/collections/media", label: "Media" },
  { href: "/admin/collections/skills", label: "Skills" },
  { href: "/admin/collections/faqs", label: "FAQs" },
  { href: "/admin/globals/site-settings", label: "Site Settings" },
] as const;

export async function DashboardHeader({ payload }: { payload: Payload }) {
  const name = await readAdminName(payload);
  const firstName = name.split(" ")[0];

  return (
    <section className="padmin-header">
      <p className="padmin-eyebrow">Portfolio CMS</p>
      <h1 className="padmin-title">Welcome back, {firstName}</h1>
      <p className="padmin-body">
        Manage projects, writing, media, skills, and the FAQ.
      </p>
      <nav className="padmin-links">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="padmin-link">
            {link.label}
          </a>
        ))}
      </nav>
    </section>
  );
}
