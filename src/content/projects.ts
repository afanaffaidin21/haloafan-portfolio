/** The project view the site renders; `ProjectRow` in src/lib/content.ts extends it. */
export type Project = {
  slug: string;
  name: string;
  type: string;
  /** detail-page hero heading */
  heading: string;
  year: string;
  description: string;
  scope: string[];
  liveUrl: string;
  thumbnail: string;
  quote: { text: string; bold: string; name: string; role: string; avatar: string };
  blocks: MediaBlock[];
};

export type MediaTile =
  /** `mobileSrc` replaces `src` on screens below 768px. */
  | { kind: "image"; src: string; alt: string; mobileSrc?: string }
  | { kind: "video"; src: string; poster?: string };

export type MediaBlock = {
  layout: "full" | "two" | "three";
  tiles: MediaTile[];
  /** Rendered as `text` followed by `bold` in one paragraph, so `text` ends with a space. */
  description?: { heading: string; bold: string; text: string };
};

/**
 * A project as the seed writes it. Projects carry no pull quote; `client` is
 * set for client work only. Sources for every claim are listed in
 * docs/content/copy-draft.md.
 */
export type ProjectSource = Omit<Project, "quote"> & {
  kind: "client" | "experiment";
  client: string;
  tech: string[];
  repoUrl: string;
  /** The home collage shows featured projects, capped at four. */
  featured: boolean;
};

/** Ordered: the array position becomes `order`. */
export const projects: ProjectSource[] = [
  {
    slug: "jejak-puncak",
    name: "Jejak Puncak",
    kind: "experiment",
    type: "AI hiking planner",
    heading: "A hiking planner with maps and AI.",
    year: "2026",
    client: "",
    description:
      "Jejak Puncak helps hikers choose a mountain and plan what to pack. It won Best UI/UX Implementation at the CODEPOLITAN Vibe Coding Showcase.",
    scope: ["Full-stack development", "AI features", "Map integration"],
    tech: ["Next.js", "TypeScript", "Supabase", "Mapbox GL", "Gemini API", "Zod", "Vitest"],
    liveUrl: "https://jejak-puncak.haloafan.com",
    repoUrl: "",
    thumbnail: "/img/jejak-puncak-thumb.jpg",
    featured: true,
    blocks: [
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/jejak-puncak-desktop-1.jpg", alt: "Jejak Puncak home page on desktop" }],
        description: { heading: "The problem", text: "The right mountain depends on your experience and fitness. What you pack depends on the mountain, the trip length, and the season. ", bold: "Jejak Puncak answers both questions, next to a mountain catalog and an interactive Mapbox map." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/jejak-puncak-mobile-pair.jpg", alt: "Jejak Puncak home page and Mount Rinjani page on mobile", mobileSrc: "/img/jejak-puncak-mobile-single.jpg" }],
        description: { heading: "Three AI flows", text: "Gemini runs through Next.js API routes in three flows: a mountain matcher, a packing list, and an admin autofill. The packing list comes back as structured JSON and is validated before it is shown. ", bold: "If Gemini hits a quota limit or times out, the app falls back to an OpenAI-compatible endpoint, and in that mode it leaves citations empty instead of guessing them." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/jejak-puncak-desktop-2.jpg", alt: "Jejak Puncak Mount Rinjani page on desktop" }],
        description: { heading: "Admin review", text: "The admin autofill uses Google Search grounding. It shows its sources, and the admin can edit every field before saving. User input is validated with Zod. ", bold: "GPX route data: Rinjani Dawn Adventures." },
      },
    ],
  },
  {
    slug: "namaka-photography",
    name: "Namaka Photography",
    kind: "client",
    type: "Booking and operations system",
    heading: "A photography website with online booking.",
    year: "2026",
    client: "Namaka Photography",
    description:
      "A production website for a photography business in Surabaya. Clients can book a session, track their booking, and select their photos.",
    scope: ["Web development", "Workflow automation", "Role-based access"],
    tech: ["Next.js", "React", "TypeScript", "NextAuth (Google OAuth)", "Google Apps Script", "Google Sheets", "Google Calendar", "Google Drive", "Vercel"],
    liveUrl: "https://namaka.web.id",
    repoUrl: "",
    thumbnail: "/img/namaka-photography-thumb.jpg",
    featured: true,
    blocks: [
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/namaka-photography-desktop-1.jpg", alt: "Namaka Photography home page on desktop" }],
        description: { heading: "The problem", text: "Namaka needed one place where clients book, follow their booking, and choose their photos. The team also needed separate access for admins, editors, and freelancers. ", bold: "Each role signs in with Google and gets its own workspace." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/namaka-photography-mobile-pair.jpg", alt: "Namaka Photography home page and booking tracking page on mobile", mobileSrc: "/img/namaka-photography-mobile-single.jpg" }],
        description: { heading: "Automation with Google Apps Script", text: "The site connects to Google Sheets, Calendar, and Drive. Apps Script creates and updates calendar events, creates Drive folders, sends booking confirmations, and sends reminders one day before (H-1) and for the final payment. ", bold: "The scripts are idempotent, so running one twice does not create a second event or folder." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/namaka-photography-desktop-2.jpg", alt: "Namaka Photography booking tracking page on desktop" }],
        description: { heading: "Error handling and tests", text: "Each automation handles its own errors, and the Apps Script code has integration tests. ", bold: "I work on the site as a freelance web developer, and it is live at namaka.web.id." },
      },
    ],
  },
  {
    slug: "karya-pratama-packaging",
    name: "Karya Pratama",
    kind: "client",
    type: "Company website, rebuilt headless",
    heading: "A company website, rebuilt as headless WordPress.",
    year: "2024-2026",
    client: "Karya Pratama Packaging",
    description:
      "I built the Karya Pratama Packaging website and product catalog in WordPress in 2024. In 2026 I rebuilt the front end in Next.js and kept WordPress as the CMS, so products are still managed in WordPress.",
    scope: ["WordPress development", "Product catalog", "Headless rebuild", "Domain and hosting setup"],
    tech: ["WordPress", "Elementor", "Astra", "JetEngine", "PHP", "Next.js", "TypeScript", "WPGraphQL", "Tailwind CSS"],
    liveUrl: "https://www.karyapratamapackaging.com",
    repoUrl: "",
    thumbnail: "/img/karya-pratama-packaging-thumb.jpg",
    featured: true,
    blocks: [
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/karya-pratama-packaging-desktop-1.jpg", alt: "Karya Pratama home page on desktop" }],
        description: { heading: "From WordPress to headless", text: "In 2026 I rebuilt the front end in Next.js and TypeScript. WordPress stays the CMS, and the catalog loads products from it through WPGraphQL. ", bold: "The live site and these screenshots show this version." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/karya-pratama-packaging-mobile-pair.jpg", alt: "Karya Pratama home page and product catalog page on mobile", mobileSrc: "/img/karya-pratama-packaging-mobile-single.jpg" }],
        description: { heading: "The product catalog", text: "In 2024 I worked directly with the business owner and built the first site in WordPress, with Elementor, Astra, and JetEngine for the catalog. I added custom CSS, JavaScript, and PHP where the page builder was not enough. ", bold: "I also set up the domain and hosting, security headers, redirects, and reCAPTCHA." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/karya-pratama-packaging-desktop-2.jpg", alt: "Karya Pratama product catalog page on desktop" }],
      },
    ],
  },
  {
    slug: "universitas-sunan-gresik",
    name: "Universitas Sunan Gresik",
    kind: "client",
    type: "University website",
    heading: "A university website, from wireframe to launch.",
    year: "2025",
    client: "Universitas Sunan Gresik",
    description:
      "A WordPress website for Universitas Sunan Gresik. I compared other academic websites, made wireframes in Figma with the client, and built the pages in Elementor.",
    scope: ["Benchmarking", "Wireframing", "WordPress development", "Responsive testing"],
    tech: ["WordPress", "Elementor Pro", "Astra Pro", "JetEngine", "Figma", "Canva"],
    liveUrl: "https://usg.ac.id",
    repoUrl: "",
    thumbnail: "/img/universitas-sunan-gresik-thumb.jpg",
    featured: true,
    blocks: [
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/universitas-sunan-gresik-desktop-1.jpg", alt: "Universitas Sunan Gresik home page on desktop" }],
        description: { heading: "Planning first", text: "I started by comparing other academic websites. ", bold: "Then I made wireframes in Figma and revised them with the client." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/universitas-sunan-gresik-mobile-pair.jpg", alt: "Universitas Sunan Gresik home page and lecturers and staff page on mobile", mobileSrc: "/img/universitas-sunan-gresik-mobile-single.jpg" }],
        description: { heading: "Build and launch", text: "I set up the domain, hosting, and WordPress, and built the pages with Elementor Pro, Astra Pro, and JetEngine. ", bold: "I added security headers, redirects, and reCAPTCHA, and tested the layout on phones, tablets, and desktops." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/universitas-sunan-gresik-desktop-2.jpg", alt: "Universitas Sunan Gresik lecturers and staff page on desktop" }],
      },
    ],
  },
  {
    slug: "rangkul-cerita",
    name: "Rangkul Cerita",
    kind: "experiment",
    type: "Wellbeing web app",
    heading: "A wellbeing app for young Indonesians.",
    year: "2026",
    client: "",
    description:
      "Rangkul Cerita lets young people in Indonesia check in on their emotions, write in a guided journal, and find where to get help.",
    scope: ["Full-stack development", "AI features"],
    tech: ["Next.js", "TypeScript", "Gemini API", "Zod", "Drizzle ORM", "PostgreSQL", "Upstash Redis"],
    liveUrl: "https://rangkul-cerita.vercel.app",
    repoUrl: "https://github.com/afanaffaidin21/rangkul-cerita",
    thumbnail: "/img/rangkul-cerita-thumb.jpg",
    featured: false,
    blocks: [
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/rangkul-cerita-desktop-1.jpg", alt: "Rangkul Cerita home page on desktop" }],
        description: { heading: "What it does", text: "The app has an emotion check-in, a guided journal, and a page with help information. ", bold: "It is written for young people in Indonesia." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/rangkul-cerita-mobile-pair.jpg", alt: "Rangkul Cerita home page and help page on mobile", mobileSrc: "/img/rangkul-cerita-mobile-single.jpg" }],
        description: { heading: "AI reflections", text: "A Gemini endpoint writes reflections. Each response is checked against a schema before it is shown, and a timeout path handles provider failures. ", bold: "The API routes have tests." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/rangkul-cerita-desktop-2.jpg", alt: "Rangkul Cerita help page on desktop" }],
      },
    ],
  },
  {
    slug: "menulis-id",
    name: "Menulis.ID",
    kind: "client",
    type: "Website redesign",
    heading: "A website redesign, from Figma to WordPress.",
    year: "2025",
    client: "Menulis.ID",
    description:
      "I redesigned the Menulis.ID website in Figma, rebuilt it in WordPress, and recorded video tutorials for the admin.",
    scope: ["UI/UX redesign", "WordPress development", "Admin tutorials"],
    tech: ["WordPress", "Elementor", "ACF", "Figma"],
    liveUrl: "https://menulis.id",
    repoUrl: "",
    thumbnail: "/img/menulis-id-thumb.jpg",
    featured: false,
    blocks: [
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/menulis-id-desktop-1.jpg", alt: "Menulis.ID home page on desktop" }],
        description: { heading: "Redesign", text: "I redesigned the UI/UX in Figma, then built it with Elementor. ", bold: "Custom post types and fields (ACF) give each type of content its own fields." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/menulis-id-mobile-pair.jpg", alt: "Menulis.ID home page and category page on mobile", mobileSrc: "/img/menulis-id-mobile-single.jpg" }],
        description: { heading: "Handover", text: "I added security headers and reCAPTCHA. ", bold: "I also recorded video tutorials on managing the site and editing pages in Elementor." },
      },
      {
        layout: "full",
        tiles: [{ kind: "image", src: "/img/menulis-id-desktop-2.jpg", alt: "Menulis.ID category page on desktop" }],
      },
    ],
  },
];
