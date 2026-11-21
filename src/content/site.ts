import type { SocialKey } from "@/lib/social-icons";

/**
 * The seed identity for the Site Settings global. Sources for every claim are
 * listed in docs/content/copy-draft.md.
 */
export const site: {
  name: string;
  role: string;
  tagline: string;
  availabilityStatus: "open" | "selective" | "closed";
  availabilityNote: string;
  email: string;
  socials: { platform: SocialKey; url: string }[];
  avatar: string;
  /** `/files/<name>.pdf`, seeded from `public/files`; empty for no CV. */
  resume: string;
  followerCount: string;
  seo: { title: string; description: string };
  copyright: string;
} = {
  name: "Afan Affaidin",
  role: "Web Developer",
  tagline: "I build websites and web apps.",
  availabilityStatus: "open",
  availabilityNote: "Open to full-time and freelance work",
  email: "afanaffaidin.work@gmail.com",
  socials: [
    { platform: "linkedin", url: "https://www.linkedin.com/in/afanaffaidin" },
    { platform: "github", url: "https://github.com/afanaffaidin21" },
    { platform: "threads", url: "https://www.threads.com/@afanaffaidin" },
  ],
  avatar: "/img/afan-affaidin.jpg",
  resume: "/files/Ahmad_Afan_Affaidin_CV.pdf",
  followerCount: "",
  seo: {
    title: "Afan Affaidin, Web Developer (WordPress & Next.js)",
    description:
      "Web developer in Surabaya, Indonesia. I build WordPress and Next.js websites and add AI features to web apps. Open to full-time, part-time, and freelance work.",
  },
  copyright: "© 2026 Afan Affaidin",
};

/** Skill rows. `icon` is a key of `iconFor` in src/lib/skill-icons.ts. */
export const services = [
  { label: "WordPress & WooCommerce Development", icon: "wordpress" },
  { label: "Next.js Web Apps", icon: "webapp" },
  { label: "AI Features for Web Apps", icon: "ai" },
  { label: "Figma to Responsive UI", icon: "ux" },
  { label: "Website Maintenance & Support", icon: "support" },
  { label: "Performance & Security", icon: "performance" },
] as const;

/** Tech stack tiles. Each name is a key of `toolFor` in src/lib/skill-icons.ts. */
export const techStack = [
  "WordPress",
  "Elementor",
  "WooCommerce",
  "PHP",
  "Next.js",
  "React",
  "TypeScript",
  "Supabase",
  "Figma",
  "Gemini",
  "ChatGPT",
  "Claude",
] as const;

export const faqs: {
  n: string;
  q: string;
  a: string;
  category: "availability" | "role" | "process" | "general";
}[] = [
  {
    n: "01",
    q: "What kind of work are you open to?",
    a: "Full-time, part-time, freelance, and per-project work. For a job, tell me about the team and the role. For a project, tell me what the site needs to do, and I will reply with a plan and the next steps.",
    category: "availability",
  },
  {
    n: "02",
    q: "Where are you based, and do you work remotely?",
    a: "I live in Surabaya, Indonesia, and my time zone is WIB (UTC+7). I work remotely, and I have worked with clients in Singapore and in other Indonesian cities. Calls can be in Indonesian or English.",
    category: "availability",
  },
  {
    n: "03",
    q: "How do you use AI in your work?",
    a: "In web apps, I build features with the Gemini API. I check the AI output against a schema, add a fallback for timeouts, and when AI fills in data, an admin reviews it before saving. In my own work, I use AI tools to help me plan and write code, and I review and test that code myself.",
    category: "process",
  },
  {
    n: "04",
    q: "Should my site use WordPress or Next.js?",
    a: "WordPress fits most company sites, catalogs, and online stores, because your team can edit the pages without code. Next.js fits custom web apps, like a booking system or a planner with maps and AI. If you are not sure, tell me what the site needs to do, and I will suggest one.",
    category: "role",
  },
  {
    n: "05",
    q: "What happens after launch?",
    a: "You get documentation and short video tutorials, and I can train your admin team to update the site. I can also support you with updates, plugin issues, and fixes. I test updates on a staging copy before they go live.",
    category: "process",
  },
];

/** The About stack shows at most three cards. */
export const workHistory = [
  { company: "Namaka Photography", role: "Freelance Web Developer", dates: "2026-Present" },
  { company: "Onero Solutions", role: "Web Developer & Technical Support", dates: "2022-Present" },
  { company: "We Are Social Singapore", role: "Freelance WordPress Developer", dates: "2026" },
];
