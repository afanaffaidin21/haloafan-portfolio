# Copy draft: Afan Affaidin portfolio

Status: **disetujui owner** (2026-11-21). Jawaban pertanyaan ada di bagian 6.

Semua copy di bawah sudah melewati copy-editing (Seven Sweeps + AI-tell check),
humanizer, dan antislop-copywriting. Catatan perubahan dari pass tersebut ada di
bagian paling bawah.

## Sumber fakta

Setiap klaim diberi kode sumber di kolom/akhir baris:

| Kode | Sumber |
|---|---|
| FS | Fact sheet di brief task (diverifikasi owner dari CV, LinkedIn, repo, konfirmasi) |
| CV | `D:\Afan-Files\CV\output\pdf\Ahmad_Afan_Affaidin_Web_Developer_CV_public.pdf` (isi sama dengan `web_cv_content.json`) |
| RPT | `D:\Afan-Files\CV\output\pdf\Web_CV_report.md` |
| OWN | Keputusan owner di brief task (positioning, testimonial, blog, domain) |
| UI | Bukan klaim fakta: label navigasi/antarmuka |
| ? | Perlu konfirmasi owner (lihat "Pertanyaan untuk owner") |

Aturan yang dipegang: tanpa metrik, angka, testimonial, atau klaim di luar sumber;
tanpa "5+ years"; tanpa nomor HP atau alamat; tanpa em dash; kalimat pendek dan
kosakata sederhana agar bisa dijelaskan sendiri saat interview.

---

## 1. Identitas (`src/content/site.ts`)

| Field | Copy | Sumber |
|---|---|---|
| name | Afan Affaidin | FS |
| role | Web Developer | FS, OWN |
| tagline | I build websites and web apps. | OWN (positioning) |
| availabilityStatus | open | OWN |
| availabilityNote | Open to full-time and freelance work | OWN (empat channel kerja) |
| email | afanaffaidin.work@gmail.com | FS |
| socials | LinkedIn `https://www.linkedin.com/in/afanaffaidin`, GitHub `https://github.com/afanaffaidin21`, Threads `https://www.threads.com/@afanaffaidin` | FS |
| followerCount | (kosong, tidak punya X) | FS |
| resume | `/files/Ahmad_Afan_Affaidin_CV.pdf` (salinan CV publik, sudah dicek tanpa nomor HP) | FS, RPT |
| seo.title | Afan Affaidin, Web Developer (WordPress & Next.js) | FS, OWN |
| seo.description | Web developer in Surabaya, Indonesia. I build WordPress and Next.js websites and add AI features to web apps. Open to full-time, part-time, and freelance work. | FS, OWN |
| copyright | © 2026 Afan Affaidin | brief |
| footer wordmark | (kosong, jadi nama depan: AFAN) | UI |
| bigQuote | (kosong, section tersembunyi) | OWN |

Tagline dipecah otomatis di tengah kata. Hasilnya dua baris, baris pertama abu-abu:

> **I build websites** / **and web apps.**

Alternatif tagline (pilih satu bila mau ganti):

- A. `I build websites and web apps.` (dipilih) Paling sederhana; pecahan baris jatuh di tempat yang wajar. WordPress/Next.js dijelaskan di subcopy tepat di bawahnya.
- B. `I build websites you can manage.` Lebih condong ke klien (admin bisa mengubah isi sendiri). Kurang kuat untuk recruiter.
- C. `I build WordPress sites and Next.js apps.` Paling spesifik, tapi baris pertama (23 karakter) kemungkinan pecah jadi 3-4 baris di 72px; akan saya cek di screenshot kalau dipilih.

### Work history (maks 3 kartu, format tanggal mengikuti komponen)

| company | role | dates | Sumber |
|---|---|---|---|
| Namaka Photography | Freelance Web Developer | 2026-Present | FS |
| Onero Solutions | Web Developer & Technical Support | 2022-Present | FS |
| We Are Social Singapore | Freelance WordPress Developer | 2026 | FS |

---

## 2. Section copy (`src/lib/copy-defaults.ts`)

### hero

| Key | Copy | Sumber |
|---|---|---|
| subcopyLead (tebal) | Web developer for WordPress and Next.js. | FS (headline CV) |
| subcopyBody | I build responsive websites from Figma designs and support them after launch. I also add AI features to web apps, and I check the AI output before it is used. | CV (Figma, responsive, support), FS (Applied AI: validasi output) |

### home

| Key | Copy | Sumber |
|---|---|---|
| latestProjectsHeading | Selected Projects | UI (grid diurutkan `order`, bukan tanggal, jadi "Latest" kurang tepat) |

### skills

| Key | Copy | Sumber |
|---|---|---|
| heading.line1 (abu-abu) | From WordPress | FS |
| heading.line2 | to Next.js and AI. | FS |
| techStackLabel | My tech stack | UI (sama dengan template; label netral) |

### about

| Key | Copy | Sumber |
|---|---|---|
| heading.line1 (abu-abu) | A web developer | FS |
| heading.line2 | in Surabaya, Indonesia. | FS |

Paragraf (lead tebal + body):

1. **I have been building websites since 2021.** I studied Information Systems at Universitas Airlangga. As an intern there, I built a study program website in WordPress, and it won 1st Place in the university's Best Study Program Website Competition (2021).
   - Sumber: FS (since 2021, pendidikan, penghargaan), CV (Intern WordPress Developer, Airlangga University, Jan-Mar 2021: "Built the study program homepage with Elementor; the website won 1st Place"). Situs itu tidak ditautkan (FS).
2. **WordPress is still a big part of my work.** At Onero Solutions, I build WooCommerce and Elementor pages, write custom plugins, and solve support tickets. I have also worked on WordPress sites for a university, a packaging company, and We Are Social Singapore.
   - Sumber: CV (Onero: Elementor Pro, WooCommerce, custom plugins, support tickets), FS (USG, Karya Pratama, We Are Social Singapore).
3. **Now I also build web apps with Next.js and AI.** I built a booking system for Namaka Photography and Jejak Puncak, an AI hiking planner that won Best UI/UX Implementation at the CODEPOLITAN Vibe Coding Showcase (2026). When I add AI, I validate the output and plan for the moments when the AI provider fails.
   - Sumber: FS (Namaka, Jejak Puncak, penghargaan, validasi output, fallback/timeout).

Catatan: Gaji Cermat (Part-time WooCommerce Developer, 2025-2026) tidak saya masukkan agar paragraf 2 tetap pendek. Bisa ditambah satu kalimat bila owner mau: "At Gaji Cermat, I fixed the WooCommerce product filters." (CV).

### faq

| Key | Copy | Sumber |
|---|---|---|
| heading.line1 | Before you | UI |
| heading.line2 (abu-abu) | get in touch. | UI |
| cardHeading.line1 (abu-abu) | Still have a question? | UI |
| cardHeading.line2 | Send me an email. | UI |
| cardBody | Tell me about the role or the project. I will reply with my availability and the next steps. | OWN (dua jenis pembaca); waktu respons: lihat pertanyaan Q2 |

### articles (section home, tersembunyi selama post < 3)

| Key | Copy |
|---|---|
| heading.line1 | From my blog, |
| heading.line2 | notes on web work. |

### blog

| Key | Copy | Sumber |
|---|---|---|
| title | Notes on web development | OWN (blog tetap ada) |
| intro | Articles about WordPress, Next.js, and AI features for websites. | FS (bidang kerja) |
| empty | No articles yet. | OWN (empty state) |
| followTitle | Find me online | UI |
| followBody | I am on LinkedIn, GitHub, and Threads. | FS |
| moreHeading | More articles | UI |

### projects (halaman `/projects`)

| Key | Copy | Sumber |
|---|---|---|
| title.line1 | Client work and | FS (kind client/experiment) |
| title.line2 | personal projects | FS |
| subtitle | Each project shows what I built, the tools I used, and a link to the live site. | FS (semua project punya live URL) |

### project (halaman detail)

| Key | Copy |
|---|---|
| moreHeading | More Projects |
| placeholderCard | Have a project in mind? Email me and tell me what you need. |

### contactCta (kartu penutup `/projects` dan detail project)

| Key | Copy |
|---|---|
| line1 (abu-abu) | Hiring, or need a website? |
| line2 | Let's talk. |

### footer

| Key | Copy |
|---|---|
| lead | Let's |
| cycleWords | build, fix, launch |
| line2 | your website. |

Dibaca: "Let's build / fix / launch your website." Revisi setelah verifikasi 390px:
draft yang disetujui memakai "your website together.", tetapi baris itu (398px) terpotong
di kontainer mobile 302px (template "incredible work together." juga terpotong, 442px).
"your website." 240px dan muat.

---

## 3. FAQ (`src/content/site.ts` → koleksi `faqs`)

1. **What kind of work are you open to?** (category: availability)
   Full-time, part-time, freelance, and per-project work. For a job, tell me about the team and the role. For a project, tell me what the site needs to do, and I will reply with a plan and the next steps.
   - Sumber: OWN (empat channel).
2. **Where are you based, and do you work remotely?** (category: availability)
   I live in Surabaya, Indonesia, and my time zone is WIB (UTC+7). I work remotely, and I have worked with clients in Singapore and in other Indonesian cities. Calls can be in Indonesian or English.
   - Sumber: FS (Surabaya, WIB), CV (We Are Social Singapore; Onero di Tangerang; Gaji Cermat di Jakarta). "I work remotely": brief FAQ "remote". ?: bahasa meeting.
3. **How do you use AI in your work?** (category: process)
   In web apps, I build features with the Gemini API. I check the AI output against a schema, add a fallback for timeouts, and when AI fills in data, an admin reviews it before saving. In my own work, I use AI tools to help me plan and write code, and I review and test that code myself.
   - Sumber: FS (Gemini, structured JSON + validasi, fallback/timeout, admin autofill dengan review). ?: kalimat terakhir (alur kerja) perlu konfirmasi owner, lihat Q3.
4. **Should my site use WordPress or Next.js?** (category: role)
   WordPress fits most company sites, catalogs, and online stores, because your team can edit the pages without code. Next.js fits custom web apps, like a booking system or a planner with maps and AI. If you are not sure, tell me what the site needs to do, and I will suggest one.
   - Sumber: FS (contoh: Karya Pratama, USG, WooCommerce; Namaka, Jejak Puncak).
5. **What happens after launch?** (category: process)
   You get documentation and short video tutorials, and I can train your admin team to update the site. I can also support you with updates, plugin issues, and fixes. I test updates on a staging copy before they go live.
   - Sumber: CV (Onero: training with documentation and tutorials, staging before deployment, plugin troubleshooting; Menulis.ID: admin tutorial videos). ?: janji waktu respons, lihat Q2.

---

## 4. Skills (`services` + `techStack` → koleksi `skills`)

### Baris (6, dengan ikon)

| Label | Ikon (key) | Grup | Sumber |
|---|---|---|---|
| WordPress & WooCommerce Development | `wordpress` (baru) | build | CV |
| Next.js Web Apps | `webapp` (ikon laptop yang sudah ada) | build | CV, FS |
| AI Features for Web Apps | `ai` (baru) | generative-ai | FS (Applied AI) |
| Figma to Responsive UI | `ux` (ikon layout yang sudah ada) | design | CV |
| Website Maintenance & Support | `support` (baru) | build | CV (Website Operations) |
| Performance & Security | `performance` (baru) | build | CV (caching, GTmetrix, website security) |

### Tile tech stack (12)

WordPress, Elementor, WooCommerce, PHP, Next.js, React, TypeScript, Supabase, Figma,
Gemini, ChatGPT, Claude.

- Sumber: CV untuk semua kecuali ChatGPT dan Claude. Keduanya ada di daftar usulan
  brief, tetapi tidak ada di CV; lihat Q3.
- Logo baru dari Simple Icons (CC0): WordPress, Elementor, WooCommerce, PHP, Next.js,
  React, TypeScript, Supabase, Google Gemini. Figma, ChatGPT, Claude memakai logo yang
  sudah ada.

---

## 5. Projects (`src/content/projects.ts`)

Format blok: **heading**, lalu `text` diikuti `bold` (komponen menampilkan text
dulu, lalu bold di kalimat yang sama). Tanpa quote di semua project.
Urutan = `order`; 1-4 `featured` (kolase home), 5-6 hanya di grid.

### 1. Jejak Puncak (`jejak-puncak`)

| Field | Isi | Sumber |
|---|---|---|
| kind | experiment | FS |
| type | AI hiking planner | FS |
| heading | A hiking planner with maps and AI. | FS |
| year | 2026 | FS |
| client | (kosong, experiment; lihat Q4) | FS |
| description | Jejak Puncak helps hikers choose a mountain and plan what to pack. It won Best UI/UX Implementation at the CODEPOLITAN Vibe Coding Showcase. | FS |
| scope | Full-stack development, AI features, Map integration | FS |
| tech | Next.js, TypeScript, Supabase, Mapbox GL, Gemini API, Zod, Vitest | FS |
| liveUrl | https://jejak-puncak.haloafan.com | FS |
| repoUrl | (kosong, repo privat) | FS |
| featured / order | ya / 1 | FS |

Blok:

1. **The problem.** The right mountain depends on your experience and fitness. What you pack depends on the mountain, the trip length, and the season. **Jejak Puncak answers both questions, next to a mountain catalog and an interactive Mapbox map.**
2. **Three AI flows.** Gemini runs through Next.js API routes in three flows: a mountain matcher, a packing list, and an admin autofill. The packing list comes back as structured JSON and is validated before it is shown. **If Gemini hits a quota limit or times out, the app falls back to an OpenAI-compatible endpoint, and in that mode it leaves citations empty instead of guessing them.**
3. **Admin review.** The admin autofill uses Google Search grounding. It shows its sources, and the admin can edit every field before saving. User input is validated with Zod. **GPX route data: Rinjani Dawn Adventures.**

Sumber blok: FS (semua butir, termasuk kredit GPX wajib).

### 2. Namaka Photography (`namaka-photography`)

| Field | Isi | Sumber |
|---|---|---|
| kind | client | FS |
| type | Booking and operations system | FS |
| heading | A photography website with online booking. | FS |
| year | 2026 | FS |
| client | Namaka Photography | FS |
| description | A production website for a photography business in Surabaya. Clients can book a session, track their booking, and select their photos. | FS |
| scope | Web development, Workflow automation, Role-based access | FS |
| tech | Next.js, React, TypeScript, NextAuth (Google OAuth), Google Apps Script, Google Sheets, Google Calendar, Google Drive, Vercel | FS |
| liveUrl | https://namaka.web.id | FS |
| repoUrl | (kosong, repo privat) | FS |
| featured / order | ya / 2 | FS |

Blok:

1. **The problem.** Namaka needed one place where clients book, follow their booking, and choose their photos. The team also needed separate access for admins, editors, and freelancers. **Each role signs in with Google and gets its own workspace.**
2. **Automation with Google Apps Script.** The site connects to Google Sheets, Calendar, and Drive. Apps Script creates and updates calendar events, creates Drive folders, sends booking confirmations, and sends reminders one day before (H-1) and for the final payment. **The scripts are idempotent, so running one twice does not create a second event or folder.**
3. **Error handling and tests.** Each automation handles its own errors, and the Apps Script code has integration tests. **I work on the site as a freelance web developer, and it is live at namaka.web.id.**

Sumber blok: FS (alur booking/tracking/photo selection, workspace role via NextAuth, automasi, idempotent, failure handling, integration test, peran). ?: arti "H-1", lihat Q5.

### 3. Karya Pratama Packaging (`karya-pratama-packaging`)

Revisi setelah verifikasi 390px: `name` (judul kartu) menjadi "Karya Pratama" karena
"Karya Pratama Packaging" mendorong "View Project" 7px keluar kartu di mobile. `client`,
slug, dan baris Client di halaman detail tetap "Karya Pratama Packaging". Gambar diambil
dari situs live saat ini sesuai keputusan owner (situs sekarang versi Next.js di Vercel).

| Field | Isi | Sumber |
|---|---|---|
| kind | client | FS |
| type | Company profile and product catalog | FS |
| heading | A company website with a product catalog. | FS |
| year | 2024 | FS |
| client | Karya Pratama Packaging | FS |
| description | A company profile and product catalog for a packaging business. I worked directly with the business owner, from domain setup to launch. | FS |
| scope | WordPress development, Product catalog, Domain and hosting setup | FS |
| tech | WordPress, Elementor, Astra, JetEngine, CSS, JavaScript, PHP | FS |
| liveUrl | https://www.karyapratamapackaging.com | FS |
| featured / order | ya / 3 | FS |

Blok:

1. **Working with the owner.** I worked directly with the business owner to plan the company pages and the product catalog. **The site is built in WordPress with Elementor and Astra.**
2. **The product catalog.** I built the catalog with JetEngine, and added custom CSS, JavaScript, and PHP where the page builder was not enough. **Before launch, I set up the domain and hosting, security headers, redirects, and reCAPTCHA.**

Sumber blok: FS. Repo Next.js Karya Pratama tidak disebut (FS).

Revisi 2026-11-21 (fakta dari owner, diverifikasi di repo privat
`afanaffaidin21/karyapratama-packaging` dan situs live): situs WordPress dibangun
Nov-Dec 2024; pada Agustus 2026 owner membangun ulang frontend dengan Next.js 16 +
TypeScript (next-intl, Tailwind CSS), WordPress tetap CMS di
`cms.karyapratamapackaging.com`, katalog diambil lewat WPGraphQL (`POST /graphql`),
`/wp-content` di-rewrite ke CMS. Copy yang dipakai sekarang ada di
`src/content/projects.ts`: year 2024-2026, heading "A company website, rebuilt as
headless WordPress.", blok 1 "From WordPress to headless", blok 2 tetap pekerjaan
2024. Repo privat, jadi tanpa repoUrl. About paragraf 2 tetap akurat (CMS-nya masih
WordPress) dan tidak diubah.

### 4. Universitas Sunan Gresik (`universitas-sunan-gresik`)

| Field | Isi | Sumber |
|---|---|---|
| kind | client | FS |
| type | University website | FS |
| heading | A university website, from wireframe to launch. | FS |
| year | 2025 | FS |
| client | Universitas Sunan Gresik | FS |
| description | A WordPress website for Universitas Sunan Gresik. I compared other academic websites, made wireframes in Figma with the client, and built the pages in Elementor. | FS |
| scope | Benchmarking, Wireframing, WordPress development, Responsive testing | FS |
| tech | WordPress, Elementor Pro, Astra Pro, JetEngine, Figma, Canva | FS |
| liveUrl | https://usg.ac.id | FS |
| featured / order | ya / 4 | FS |

Blok:

1. **Planning first.** I started by comparing other academic websites. **Then I made wireframes in Figma and revised them with the client.**
2. **Build and launch.** I set up the domain, hosting, and WordPress, and built the pages with Elementor Pro, Astra Pro, and JetEngine. **I added security headers, redirects, and reCAPTCHA, and tested the layout on phones, tablets, and desktops.**

Sumber blok: FS. "phones, tablets, and desktops" = "uji responsif lintas perangkat".

### 5. Rangkul Cerita (`rangkul-cerita`)

| Field | Isi | Sumber |
|---|---|---|
| kind | experiment | FS |
| type | Wellbeing web app | FS |
| heading | A wellbeing app for young Indonesians. | FS |
| year | 2026 | FS |
| client | (kosong, experiment; lihat Q4) | FS |
| description | Rangkul Cerita lets young people in Indonesia check in on their emotions, write in a guided journal, and find where to get help. | FS |
| scope | Full-stack development, AI features | FS |
| tech | Next.js, TypeScript, Gemini API, Zod, Drizzle ORM, PostgreSQL, Upstash Redis | FS |
| liveUrl | https://rangkul-cerita.vercel.app | FS |
| repoUrl | https://github.com/afanaffaidin21/rangkul-cerita | FS |
| featured / order | tidak / 5 | FS |

Blok:

1. **What it does.** The app has an emotion check-in, a guided journal, and a page with help information. **It is written for young people in Indonesia.**
2. **AI reflections.** A Gemini endpoint writes reflections. Each response is checked against a schema before it is shown, and a timeout path handles provider failures. **The API routes have tests.**

Sumber blok: FS.

### 6. Menulis.ID (`menulis-id`)

| Field | Isi | Sumber |
|---|---|---|
| kind | client | FS |
| type | Website redesign | FS |
| heading | A website redesign, from Figma to WordPress. | FS |
| year | 2025 | FS |
| client | Menulis.ID | FS |
| description | I redesigned the Menulis.ID website in Figma, rebuilt it in WordPress, and recorded video tutorials for the admin. | FS |
| scope | UI/UX redesign, WordPress development, Admin tutorials | FS |
| tech | WordPress, Elementor, ACF, Figma | FS |
| liveUrl | https://menulis.id | FS |
| featured / order | tidak / 6 | FS |

Blok:

1. **Redesign.** I redesigned the UI/UX in Figma, then built it with Elementor. **Custom post types and fields (ACF) give each type of content its own fields.**
2. **Handover.** I added security headers and reCAPTCHA. **I also recorded video tutorials on managing the site and editing pages in Elementor.**

Sumber blok: FS.

Gambar project (Langkah 2): screenshot dari live URL di atas, desktop 1440x900 dan
mobile 390x844, thumbnail 484:363. Rencana per project: blok 1 = desktop full width,
blok 2 = dua screenshot mobile, blok 3 (bila ada) = desktop halaman kedua.

---

## 6. Pertanyaan untuk owner

Jawaban owner (2026-11-21):

- Q1: "Calls can be in Indonesian or English." (sudah dimasukkan ke FAQ 2)
- Q2: tanpa janji waktu balas (copy seperti draft)
- Q3: ya, ChatGPT dan Claude; kalimat FAQ 3 dan kedua tile tetap
- Q4: (b) project `kind: experiment` menampilkan "Personal project" di baris Client
- Q5: tetap "one day before (H-1)"
- Q6: `C:\Users\asus\Downloads\afan-affaidin.png` disimpan sebagai `public/img/afan-affaidin.jpg`
- Q7: tanpa Gaji Cermat

Pertanyaan semula:

- **Q1. Bahasa meeting/call.** Saya tulis "Calls can be in [...]" di FAQ 2. Pilihan:
  "Indonesian or English" / "Indonesian; English for written messages" / hapus kalimatnya.
- **Q2. Waktu respons.** Mau menjanjikan waktu balas email? Contoh: "I reply within
  one working day." Kalau tidak, kartu FAQ dan FAQ 5 tetap tanpa angka seperti di atas.
- **Q3. AI di alur kerja + tile ChatGPT/Claude.** Benarkah Anda memakai ChatGPT/Claude
  (atau tool AI lain) untuk merencanakan dan menulis kode, lalu mereview dan mengetes
  sendiri? Kalau tidak, kalimat terakhir FAQ 3 dan tile ChatGPT/Claude saya hapus.
- **Q4. Label "Client" untuk project experiment.** Halaman detail selalu menampilkan
  "Client: <nama>"; tanpa client, ia memakai nama project, jadi Jejak Puncak dan
  Rangkul Cerita akan tampil "Client Jejak Puncak". Pilihan:
  (a) isi `client` = "Personal project" (tanpa ubah kode, tampil "Client Personal project");
  (b) ubah kecil: project `kind: experiment` menampilkan "Personal project" di tempat
  baris Client (geometri sama); (c) biarkan.
  Saran saya: (b).
- **Q5. Arti "H-1" di Namaka.** Reminder H-1 itu satu hari sebelum sesi foto, atau
  sebelum jatuh tempo pelunasan? Saya tulis "one day before (H-1)" agar aman.
- **Q6. Foto avatar.** Path file foto Anda untuk avatar (hero, FAQ, About)?
- **Q7. Gaji Cermat** (opsional): tambah satu kalimat di About paragraf 2?

---

## 7. Catatan pass editing

copy-editing (Seven Sweeps + AI-tell check):

- Clarity: kalimat dipotong maks ~25 kata; satu ide per kalimat. "Latest Projects"
  diganti "Selected Projects" karena grid diurutkan manual.
- Prove it / Specificity: klaim tanpa sumber dihapus. Contoh: "Most of my work is
  WordPress" menjadi "WordPress is still a big part of my work"; "built sites for We Are
  Social" menjadi "worked on WordPress sites for"; "a safe response" di Rangkul Cerita
  dihapus karena tidak ada di sumber; "for each booking" di folder Drive dihapus.
- Zero risk: CTA penutup menyebut dua pembaca ("Hiring, or need a website?").

humanizer:

- Dihapus: staged opener "In two ways." di FAQ 3; idiom "keep a person in the loop";
  closer "Like what you see?" (idiom template).
- Triad dibatasi: tiap section paling banyak satu daftar tiga, dan hanya bila memang
  ada tiga hal (tiga alur Gemini, tiga role Namaka).
- Kata AI yang dicek dan tidak dipakai: showcase (kecuali nama acara CODEPOLITAN),
  seamless, robust, leverage, crucial, enhance, elevate.

antislop-copywriting:

- Tidak ada em dash di copy. Tidak ada angka/metrik/testimonial.
- Setiap kalimat punya pelaku ("I", "the admin", "Apps Script").
- Audit akhir: "Apa yang paling terasa AI?" Pola "X, so Y" di beberapa blok; sudah
  dikurangi menjadi satu per project. "Apakah ada fakta di luar sumber?" Tiga hal
  ditandai "?" dan masuk daftar pertanyaan (bahasa meeting, alur kerja AI, arti H-1).
