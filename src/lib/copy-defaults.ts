/**
 * The site's section copy. Edit it here: it ships with the code, and the Site
 * Settings `copy` fields only override it.
 *
 * Read in two places: each Payload field's `admin.placeholder` (so an empty
 * field shows what will render) and `fillCopy` in `toSiteSettingsView` (the
 * only fallback for an empty field). Components never import this module;
 * they render `settings.copy`.
 */

/** A two-line heading. Which line is muted stays a decision of the component. */
export type TwoLine = { line1: string; line2: string };

export type SiteCopy = {
  hero: { subcopyLead: string; subcopyBody: string };
  home: { latestProjectsHeading: string };
  skills: { heading: TwoLine; techStackLabel: string };
  about: { heading: TwoLine; paragraphs: { lead: string; body: string }[] };
  faq: { heading: TwoLine; cardHeading: TwoLine; cardBody: string };
  articles: { heading: TwoLine };
  blog: {
    title: string;
    intro: string;
    /** Shown on /blog in place of the list while there are no posts. */
    empty: string;
    followTitle: string;
    followBody: string;
    moreHeading: string;
    previewBar: string;
    previewExit: string;
    toolsLabel: string;
    relatedLabel: string;
    aiDisclosure: string;
    discussedOn: string;
  };
  projects: { title: TwoLine; subtitle: string };
  project: { relatedNotesHeading: string; moreHeading: string; placeholderCard: string };
  /** Shared by the closing card on `/projects` and `/projects/[slug]`. */
  contactCta: TwoLine;
  footer: { lead: string; cycleWords: string[]; line2: string };
};

export const COPY_DEFAULTS: SiteCopy = {
  hero: {
    subcopyLead: "Web developer for WordPress and Next.js.",
    subcopyBody:
      "I build responsive websites from Figma designs and support them after launch. I also add AI features to web apps, and I check the AI output before it is used.",
  },
  home: { latestProjectsHeading: "Selected Projects" },
  skills: {
    heading: { line1: "From WordPress", line2: "to Next.js and AI." },
    techStackLabel: "My tech stack",
  },
  about: {
    heading: { line1: "A web developer", line2: "in Surabaya, Indonesia." },
    paragraphs: [
      {
        lead: "I have been building websites since 2021.",
        body: "I studied Information Systems at Universitas Airlangga. As an intern there, I built a study program website in WordPress, and it won 1st Place in the university's Best Study Program Website Competition (2021).",
      },
      {
        lead: "WordPress is still a big part of my work.",
        body: "At Onero Solutions, I build WooCommerce and Elementor pages, write custom plugins, and solve support tickets. I have also worked on WordPress sites for a university, a packaging company, and We Are Social Singapore.",
      },
      {
        lead: "Now I also build web apps with Next.js and AI.",
        body: "I built a booking system for Namaka Photography and Jejak Puncak, an AI hiking planner that won Best UI/UX Implementation at the CODEPOLITAN Vibe Coding Showcase (2026). When I add AI, I validate the output and plan for the moments when the AI provider fails.",
      },
    ],
  },
  faq: {
    heading: { line1: "Before you", line2: "get in touch." },
    cardHeading: { line1: "Still have a question?", line2: "Send me an email." },
    cardBody: "Tell me about the role or the project. I will reply with my availability and the next steps.",
  },
  articles: { heading: { line1: "From my blog,", line2: "notes on web and AI." } },
  blog: {
    title: "Notes on web development and AI",
    intro: "Experiments, workflows, and lessons from building websites and web apps with AI.",
    empty: "No articles yet.",
    followTitle: "Find me online",
    followBody: "I am on LinkedIn, GitHub, and Threads.",
    moreHeading: "More articles",
    previewBar: "Preview, not published",
    previewExit: "Exit preview",
    toolsLabel: "Tools",
    relatedLabel: "Related project",
    aiDisclosure: "Written with AI assistance. The ideas, tests, and decisions are mine.",
    discussedOn: "Discussed on",
  },
  projects: {
    title: { line1: "Client work and", line2: "personal projects" },
    subtitle: "Each project shows what I built, the tools I used, and a link to the live site.",
  },
  project: {
    relatedNotesHeading: "Related notes",
    moreHeading: "More Projects",
    placeholderCard: "Have a project in mind? Email me and tell me what you need.",
  },
  contactCta: { line1: "Hiring, or need a website?", line2: "Let's talk." },
  footer: {
    lead: "Let's",
    cycleWords: ["build", "fix", "launch"],
    line2: "your website.",
  },
};
