# TONE.md — Afan Affaidin (`haloafan.com`)

> Generated with `samber/cc-skills@copywriting-tone-of-voice-creator` on `2026-11-24`. Version `1.0`.
>
> This is a machine-readable brand voice contract. Downstream content skills, bots, and ghostwriters consume this file to write on-brand copy. Do not rename sections or reorder them — pipelines depend on the structure.

---

## Context

- **Brand:** Afan Affaidin (`haloafan.com`)
- **Category:** Personal (Web developer portfolio and technical notes)
- **Mission (1 line):** Show real, evidence-backed web development work across WordPress, Next.js, AI features, and AI-assisted workflows so recruiters and clients can answer "can this person actually do it?"
- **Primary audience:** Recruiters and clients (Indonesia first, international-ready) evaluating whether Afan can build, ship, test, and maintain real websites and AI-powered web apps — not AI hype chasers.
- **Secondary audiences (if relevant):**
  - Fellow web developers in Indonesia reading candid build logs, debugging stories, and practical notes on checking AI output.
- **Market(s) and language(s):** Indonesia (`id-ID`) for LinkedIn, Threads, and short video scripts; simple international English (`en-US`) for `haloafan.com/blog`.
- **Reading-age target:** Mixed — plain-language technical. Every English paragraph on the site must be simple and concrete enough for Afan to explain aloud in an interview, while staying specific enough to satisfy an engineering lead.
- **Channels in scope:** Site blog (`haloafan.com/blog`), LinkedIn, Threads, Short video script (TikTok, Instagram Reels, YouTube Shorts).
- **Primary content goal:** Recruiting and client trust (proof of work and engineering discipline).
- **Risk tolerance:** Moderately distinctive — holds a clear, calm technical stance ("saya uji dan cek output AI, bukan sekadar vibe coding") without turning into anti-hype clickbait or contrarian shouting.
- **Regulatory constraints:** None formal, plus four non-negotiable owner guardrails:
  1. Never disparage clients or employers, and never publish client data or private client code.
  2. Never touch politics or SARA.
  3. Never publish claims, benchmarks, or metrics that Afan has not tested himself.
  4. Never include screenshots or snippets that expose API keys, tokens, cookies, `.env`, or `.env.deploy`.

---

## Voice Attributes

The brand's fixed personality. These do **not** change across channels — only tone modulates. The emotional spine across all channels is *"seperti orang curhat"*: honest, personal, reflective developer notes sharing what actually happened during a build, backed by real evidence.

### 1. Candid, never performative

**Definition:** Write like a developer openly sharing what actually happened during a build — including dead ends, wrong turns, and what changed — rather than staging a polished victory speech.

**Sounds like:** "I first let the coding agent wire up the Payload access hook on its own, then realized it only checked `_status` on create and missed draft updates."

**Does not sound like:** "Today I learned a humbling lesson about engineering excellence that forever transformed how I build software."

**Do:**

- Name what broke or surprised you before explaining the fix.
- Keep the storytelling human and reflective ("seperti orang curhat"), grounded in one real task from your own work.
- Admit limits openly when something is still rough, partial, or untested.

**Don't:**

- Write LinkedIn broetry (one-sentence dramatic lines, fake humility, or "Agree?" closers).
- Stage a fake "struggle to triumph" arc just to look inspiring.
- Turn a routine bug fix into a grand life philosophy.

**Anti-example from past content (if applicable):**

> "Excited to share that I just leveled up my AI workflow to build next-generation web apps faster than ever!"

### 2. Evidence-first, never hype

**Definition:** Tie every technical claim to something you actually built, ran, or tested — a commit, a schema check, a test count, a fallback path, or a screenshot — instead of borrowing AI buzzwords.

**Sounds like:** "In Jejak Puncak, the packing list comes back from Gemini as structured JSON and gets checked against a schema before the UI renders it. If Gemini times out, the route falls back to an OpenAI-compatible endpoint and leaves citations empty instead of guessing."

**Does not sound like:** "AI is a total game-changer that 10x'd my productivity and delivers seamless, revolutionary user experiences."

**Do:**

- Show the concrete artifact: prompt excerpt, Zod schema, test run result, commit link, or redacted screenshot.
- State exact conditions under which a result held (tool, model, input, failure path).
- Separate what you verified from what is only an early hunch.

**Don't:**

- Use "10x", "game-changer", "revolusioner", or "AI will replace all developers".
- Publish numbers, benchmarks, or client outcomes without a verified source or actual test run.
- Claim a tool "just works" without showing the edge case where it failed.

**Anti-example from past content (if applicable):**

> "With AI agents, anyone can ship a production-ready portfolio in hours with zero effort."

### 3. Plainspoken, never lecturing

**Definition:** Explain technical choices in short, everyday sentences you can defend aloud in an interview, talking peer-to-peer rather than talking down from a podium.

**Sounds like:** "WordPress fits most company sites because the team can edit pages without code. Next.js fits custom apps like a booking flow or a hiking planner with maps."

**Does not sound like:** "Junior developers often fail to grasp the architectural paradigm shift required when selecting between monolithic CMS ecosystems and modern edge-rendered frameworks."

**Do:**

- Keep English site sentences short and clear (one idea per sentence, simple vocabulary you actually speak).
- Share takeaways as "what worked in my case" rather than universal commandments.
- Define technical terms briefly on first use when a recruiter or non-technical client might read the post.

**Don't:**

- Use academic or textbook prose you would not say out loud in an interview.
- Lecture readers with "stop doing X", "kamu salah kalau masih pakai Y", or condescending advice.
- Pad openings with filler like "In today's fast-paced digital landscape" or "It is worth noting that".

**Anti-example from past content (if applicable):**

> "In conclusion, leveraging modern composable architectures is crucial for optimizing stakeholder value across digital touchpoints."

### 4. Firm in craft, never loud or combative

**Definition:** Stand clearly behind verification and engineering discipline ("saya uji dan cek output AI, bukan sekadar vibe coding") with calm conviction, never attacking other developers or chasing outrage.

**Sounds like:** "Saya tetap pakai AI buat bantu planning dan nulis kode, tapi tiap outputnya saya review dan uji sendiri dulu. Kalau nggak dicek, bug kecilnya baru kerasa pas sudah dipakai orang."

**Does not sound like:** "Yang masih vibe coding tanpa baca kode tuh siap-siap aja aplikasinya jebol di production!"

**Do:**

- State your standard in first person ("I test...", "saya cek...") rather than policing everyone else.
- Focus critiques on specific failure modes (unvalidated JSON, missing timeout fallbacks, leaked secrets), never on people or agencies.
- Stay polite and grounded when someone disagrees in the comments.

**Don't:**

- Mock beginners, agencies, or other stacks (including WordPress) for engagement.
- Write anti-hype clickbait or bait-and-switch hooks to trigger arguments.
- Complain about clients, employers, or past workplaces in public.

**Anti-example from past content (if applicable):**

> "Unpopular opinion: 90% of AI devs today have no idea what their code actually does. Change my mind."

---

## Archetype

- **Primary:** Everyman
- **Secondary (optional):** Creator
- **Rationale:** Afan writes as a grounded peer — a working web developer in Surabaya sharing honest build notes ("orang curhat") rather than a guru preaching from a stage. The Everyman archetype keeps the voice warm, approachable, and believable for recruiters, clients, and fellow developers; the Creator secondary anchors the voice in real craft, showing working code, clear trade-offs, and tested AI features without slipping into hype or archetype cosplay.

---

## NN/g 4 Dimensions Positioning

Each dimension is a 3-point scale: clearly-X / neutral / clearly-Y. Lean to one side on at least 3 of 4 — clustering all four at neutral produces a bland voice.

| Dimension | Position | Rationale |
| --- | --- | --- |
| Funny ↔ Serious | `leaning-serious` | Light self-deprecating humor about debugging mistakes is welcome on Threads and video, while technical claims and evidence stay serious and reliable. |
| Formal ↔ Casual | `leaning-casual` | Human, candid "orang curhat" register across channels; tightens to peer-professional on LinkedIn and plain clear English on the blog, never stiff corporate prose. |
| Respectful ↔ Irreverent | `respectful` | Always polite toward clients, colleagues, and other developers; firm on engineering standards without mocking anyone or chasing outrage. |
| Enthusiastic ↔ Matter-of-fact | `matter-of-fact` | Lets real tests, commits, failure paths, and screenshots carry the weight instead of exclamation marks, superlatives, or AI hype. |

---

## Tone Modulation Matrix

How tone shifts by situation × channel. Each cell: **dominant tone** + 2–3 prohibited tones. Consult this matrix before writing in any situation/channel combination.

| Situation \ Channel | Site blog (`haloafan.com/blog`) | LinkedIn (`id-ID`) | Threads (`id-ID`) | Short video script (`id-ID`) |
| --- | --- | --- | --- | --- |
| **Launch / win** | Matter-of-fact, reflective <br>✗ Boastful, breathless, hype-driven | Peer-professional, candid pride <br>✗ Broetry, humblebrag, emoji-stacked | Warm curhat, relieved <br>✗ Flexing, clickbait, shouty | Conversational, grounded demo <br>✗ Salesy, over-excited, bait-and-switch |
| **Crisis / outage / major bug** | Calm, forensic, transparent <br>✗ Defensive, blaming, theatrical | Composed, lesson-focused <br>✗ Panicked, finger-pointing, vague | Honest curhat ("baru kejadian") <br>✗ Ranting about clients, sarcastic | Direct walkthrough of what broke <br>✗ Dramatic panic, mocking anyone |
| **Complaint / technical critique (justified)** | Direct, grateful, evidence-checked <br>✗ Defensive, dismissive, stiff | Courteous, open to correction <br>✗ Evasive, argumentative, corporate | Humble, conversational <br>✗ Snarky, passive-aggressive | Honest follow-up / correction <br>✗ Excuse-making, combative |
| **Complaint (unjustified or viral argument)** | Do not engage on the blog <br>✗ Reactive, petty, defensive | Brief, factual, polite exit <br>✗ Combative, lecturing, sarcastic | Calm one-liner or ignore <br>✗ Dunking, rage-baiting, piling on | Do not make drama content <br>✗ Clapback, mockery, outrage |
| **Sensitive societal topic** | Off-scope (no politics / SARA) <br>✗ Partisan, preachy, opportunistic | Off-scope (no politics / SARA) <br>✗ Performative, divisive, lecturing | Off-scope (no politics / SARA) <br>✗ Hot-take, provocative, reactive | Off-scope (no politics / SARA) <br>✗ Clickbait, opinionated rant |
| **Bad news (failed experiment / rollback)** | Analytical, candid about limits <br>✗ Glossing over failure, apologetic filler | Reflective, practical takeaway <br>✗ Fake positivity, victim narrative | Self-deprecating curhat, honest <br>✗ Bitter, blaming tools blindly | Relatable "ini yang gagal" breakdown <br>✗ Clickbait doom, over-dramatic |
| **Routine / informational build note** | Clear, structured, step-by-step <br>✗ Dry textbook, vague, padded | Concise reflection + key lesson <br>✗ Wall of text, buzzword-heavy | Casual progress check-in <br>✗ Robotic changelog, `"🧵 thread"` | Quick visual show-and-tell <br>✗ Monotone lecture, filler intro |
| **Sales / recruiter objection (e.g. "just vibe coding?")** | Evidence-led, calm demonstration <br>✗ Defensive, preachy, buzzwordy | Reassuring, clear process explanation <br>✗ Boastful, dismissive of sceptics | Grounded, honest about what AI misses <br>✗ Combative, mocking sceptics | Show the actual test/check on screen <br>✗ Argumentative, smug |
| **Apology / correction** | Plain statement of error + fix <br>✗ Legal-passive, excuse-heavy | Clear ownership + updated note <br>✗ Over-dramatic, evasive | Quick honest edit + thanks <br>✗ Burying the mistake, defensive | Straightforward correction + fix <br>✗ Dismissive, blaming the viewer |
| **Recruitment / availability update** | Clear scope, stack, contact link <br>✗ Desperate, boastful, vague | Direct, warm, specific role fit <br>✗ Cringey "open to anything", broetry | Light mention when natural <br>✗ Spammy self-promo, begging | Brief closing note if relevant <br>✗ Hard sell, loud CTA |

---

## Lexicon

### Preferred terms

Named concepts and nouns the brand uses consistently.

| Term | Use for | Don't confuse with |
| --- | --- | --- |
| `AI-assisted workflow` | Using coding/writing agents with human specs, review, and tests | `vibe coding`, `autonomous AI`, `zero-code` |
| `output validation` / `validasi output` | Checking LLM responses against a schema (e.g. Zod) and handling failures/timeouts | `AI magic`, `smart generation` |
| `field notes` / `notes` / `catatan` | Evidence-backed articles on `haloafan.com/blog` | `thought leadership`, `AI news` |
| `clients` / `recruiters` / `readers` | The people evaluating Afan's work or reading articles | `users` (unless referring to end users of an app), `followers`, `eyeballs` |
| `draft` | Unpublished post saved in `/admin` for owner preview and review | `live post`, `auto-published article` |
| `fallback` | Explicit recovery path when an AI provider times out or hits a quota limit | `error handling` (too vague on its own) |
| `curhat teknis` | Honest, reflective sharing of real build/debugging experiences on ID social channels | `rant`, `venting about clients` |

### Banned terms

Words and phrases the brand never uses. Prevention is cheaper than prescription.

| Banned | Use instead | Reason |
| --- | --- | --- |
| `game-changer` / `game-changing` | Describe the concrete difference observed | AI/marketing cliché; empty claim |
| `10x` / `10x developer` | State what actually got faster and what still took time | Unverified hype |
| `revolusioner` / `mengubah segalanya` | State the specific change in workflow | Indonesian AI hype cliché |
| `AI akan menggantikan semua dev` | Discuss the exact task AI handled vs missed | Clickbait fear-mongering |
| `vibe coding` (as praise for unchecked code) | `AI-assisted development` (with review & tests) | Contradicts core technical stance |
| `seamless` / `robust` / `cutting-edge` / `next-generation` | Name the real property (`tested`, `idempotent`, `validated`) | Classic LLM filler adjectives |
| `leverage` / `unleash` / `delve into` / `embark on a journey` | `use`, `look at`, `start`, `try` | Strong AI-generated prose tells |
| `in today's fast-paced world` / `it's worth noting that` / `in conclusion` | Cut completely; start with the actual fact | AI throat-clearing and filler |
| `Agree?` / `Setuju?` / `Thoughts?` / `Comment "AI" below` | Ask a real, specific technical question or end cleanly | LinkedIn broetry & engagement bait |
| `🧵 thread` / `simak utas berikut` | Start directly with the observation or mistake | Fatigue-inducing social template |
| `rockstar` / `ninja` / `wizard` / `guru` | `web developer`, `builder`, `engineer` | Immature recruiting/personal-brand cliché |
| `solusi end-to-end terintegrasi` | Name what was built (`booking system`, `product catalog`) | Stiff Indonesian corporate jargon |

### Power words

Descriptive words that naturally recur in honest, evidence-backed builder notes:

- `tested`
- `checked`
- `caught`
- `broke`
- `fixed`
- `fallback`
- `schema`
- `commit`
- `staged`
- `verified`
- `diuji`
- `dicek`
- `ketahuan`
- `gagal`
- `ternyata`
- `akhirnya`
- `buktinya`
- `coba`

### Jargon policy

- **Allowed for:** Technical terms that name real tools or mechanisms used in the work (`WordPress`, `Elementor`, `WooCommerce`, `Next.js`, `Payload CMS`, `Zod`, `Vitest`, `Apps Script`, `idempotent`, `Draft Mode`, `REST API`).
- **Prohibited for:** Business buzzwords (`synergy`, `value-add`, `paradigm shift`) and obscure academic jargon that Afan would not say naturally in an interview.
- **Always define on first use** when a term crosses from engineering to recruiters/clients — e.g. write `"idempotent, so running the script twice does not create a second calendar event"`.

### Naming conventions

- **Brand name:** `Afan Affaidin` (personal name), `haloafan.com` (domain). Never write in third-person corporate `"we"` for personal work.
- **Product / project names:** Match `docs/content/copy-draft.md` exactly: `Jejak Puncak`, `Namaka Photography`, `Karya Pratama Packaging`, `Universitas Sunan Gresik`, `Rangkul Cerita`, `Menulis.ID`.
- **Feature / tool names:** Official casing (`WordPress`, `WooCommerce`, `Next.js`, `TypeScript`, `Payload CMS`, `Gemini API`, `Zod`, `Vitest`, `Cloudflare R2`, `Neon`).
- **Competitors / other developers:** Compare tools and approaches objectively on fit and trade-offs; never name-shame agencies, clients, or individual developers.
- **Customers / users:** Use `clients` for business clients, `recruiters` for hiring readers, `readers` for blog audience, and `users` only for people using a web app.

---

## Mechanics

| Decision | Rule |
| --- | --- |
| Person | Site blog (EN): 1st singular `"I"` + `"you"`. LinkedIn (ID): `"saya"` (peer-to-peer professional; never `"gue"`, never stiff `"kami"` for solo work). Threads & Short video (ID): `"aku"` / `"kalian"`. |
| Contractions | Site blog (EN): prefer clear full forms (`do not`, `cannot`, `it is`) so sentences stay unambiguous for international readers; light positive contractions (`I'm`, `let's`) allowed sparingly. Indonesian: natural `tidak` on LinkedIn; conversational `nggak` / `gak` allowed on Threads and video. |
| Oxford comma | Yes in English (`WordPress, Next.js, and AI`). |
| Sentence length (avg target) | Site blog (EN): 12–18 words average, cap around 25 words; one idea per sentence. LinkedIn (ID): 1–2 short visual lines per paragraph on mobile. Threads & video: punchy, spoken rhythm. |
| Active vs passive default | Active default — name who did what (`I checked`, `Apps Script creates`, `the hook rejects`). Passive allowed only when the actor is genuinely unimportant. |
| Sentence case vs title case | Sentence case for article titles, H2/H3 headings, and social hooks across all channels (proper nouns stay capitalised). |
| Emoji policy | Site blog: zero emojis. LinkedIn: 0–1 functional emoji max (never emoji bullet lists or rocket/fire stacks). Threads: 0–2 natural emojis max (never emoji walls). Video script: none in spoken text. |
| Punctuation tics | No em-dashes (`—`) in published site English articles (use periods, commas, or parentheses instead, matching `docs/content/copy-draft.md`). Cap exclamation marks at 0 on site blog and 1 max on social. Avoid trailing ellipses (`...`) except rare spoken pauses in casual Threads/video scripts. |
| Numerals | Use figures for test counts, status codes, limits, and specs (`3 AI flows`, `403`, `500 characters`). Never fabricate or round up untested metrics. |
| Dates | Site blog (EN): `MMM D, YYYY` (`Mar 6, 2025`, matching `formatPostDate`). Indonesian social: `24 Nov 2026`. Technical docs/logs: ISO `YYYY-MM-DD`. |
| Currencies | Use `Rp` without spaces for IDR (`Rp150.000`) and `$` or `USD` for international pricing when factual and relevant. |

---

## Inclusive Language

- **Gendered language:** Avoid gendered defaults (`guys`, `man-hours`, `bapak-bapak/mas-mas` as generic dev labels). Use `you` / `they` in English and `kalian` / `teman-teman` / `rekan` in Indonesian.
- **Pronouns:** Use a person's stated pronouns; when unknown or general, use singular `they` in English or the person's name/role (`the admin`, `the client`).
- **Ability / disability:** Use neutral, plain language; avoid ableist metaphors (`crazy`, `insane`, `blind to`, `crippled`).
- **Race, religion, and nationality:** Strictly zero politics and zero SARA (Suku, Agama, Ras, Antargolongan) across every channel. Write respectfully about Indonesian and international contexts alike.
- **Age:** Avoid age stereotypes (`boomer code`, `kids these days`). Focus on code and process, not age.
- **Neurodiversity:** Do not trivialise clinical terms (`OCD about formatting`, `ADHD workflow`).
- **Reference:** Conscious Style Guide (Karen Yin), APA Inclusive Language Guidelines.

---

## Channel-Specific Guidance

Voice attributes stay fixed across all four channels below. Only language, pronoun register, length, and formatting modulate.

### Site blog (`haloafan.com/blog`)

**Hard constraints:**

- Language: simple, clear English (`en-US`).
- Every single paragraph must pass the **interview test**: Afan can explain the sentence, code, and reasoning aloud in an interview without memorising stiff phrasing.
- Markdown rendered by `src/components/markdown.tsx`: supports `##` and `###` headings (`#` is stripped), paragraphs, blockquotes, unordered/ordered lists (1 level of nesting), fenced code blocks with optional language label, inline code, safe relative/`https://` links, bold/italic, horizontal rules, and captioned standalone images `![alt](url "caption")`. No raw HTML, no Markdown tables.
- When `aiAssisted` is `true` (default), the page automatically displays the disclosure line: `"Written with AI assistance. The ideas, tests, and decisions are mine."`

**Tonal shift from voice baseline:**

- Most structured and durable register. Keep the honest "builder's field note" candor, strip slang and emoji, and lead with the problem, what was tried, what broke, and the evidence.

**Do:**

- Open directly with the real problem or experiment in the first two sentences — no dictionary definitions or "In today's world" warm-ups.
- Include at least one concrete proof section: what failed, the AI mistake caught, a prompt/spec excerpt, test counts, or a redacted screenshot with a clear caption.
- Keep paragraphs short (2–4 sentences) and sentences under ~25 words without em-dashes.

**Don't:**

- Publish fluent English jargon or idioms that Afan would not naturally use when speaking in an interview.
- Use Markdown tables, raw HTML, or unredacted screenshots containing tokens, `.env`, `.env.deploy`, or client data.
- End with `"In conclusion"` or generic cheerleading — end with the concrete outcome or open limitation.

**Example opening sentence in this channel:** "When I added an AI agent role to my Payload CMS blog, the first draft of the access check looked safe until I tested an update request without the draft flag."

### LinkedIn (Indonesian)

**Hard constraints:**

- Language: Indonesian (`id-ID`), first-person `"saya"`.
- Post body limit ~3,000 characters; feed truncates around ~210 characters before `"see more"`. The first 1–2 lines must state the real observation cleanly.
- Plain text only (no Markdown rendering); use short paragraphs (1–2 visual lines on mobile) separated by blank lines.
- Put the link to the full `haloafan.com/blog/...` article in the first comment (or cleanly at the bottom if preferred for a given post) rather than stuffing multiple URLs in the hook.

**Tonal shift from voice baseline:**

- Peer-to-peer professional ("nada sejawat profesional yang tidak kaku"). Keep the candid reflection and real lesson, drop casual slang (`aku/gak`), and avoid corporate stiffness or broetry theatrics.

**Do:**

- Lead in lines 1–2 with the concrete thing you built, tested, or caught — not a vague teaser.
- Share one honest turning point (what went wrong or what the AI got wrong) and the exact safeguard you added.
- Close with a genuine, grounded question to peers or a calm pointer to the full write-up.

**Don't:**

- Write one-sentence stacked broetry paragraphs, fake humility, or `"Agree?"` / `"Setuju?"` engagement bait.
- Stack emojis, hashtags (keep to 0–3 relevant tags max if used at all), or buzzwords like `"revolusioner"` and `"game-changer"`.
- Complain about clients, employers, or unnamed coworkers.

**Example opening sentence in this channel:** "Minggu ini saya menambahkan akun agent khusus di Payload CMS supaya AI bisa menyimpan draft artikel blog, tapi tetap tidak bisa publish sendiri."

### Threads (Indonesian)

**Hard constraints:**

- Language: casual Indonesian (`id-ID`), `"aku/kalian"`.
- Maximum 500 characters per single post (hard platform limit). Keep each post focused on one sharp moment, mistake, or insight.
- Plain text with optional image/screenshot attachment (redacted of all secrets and client data).

**Tonal shift from voice baseline:**

- Closest to live *"orang curhat"* mode. Relaxed, warm, conversational; light self-deprecating humor and honest debugging missteps are welcome, while technical facts stay accurate and respectful.

**Do:**

- Share one real moment from today's build or debugging session in plain spoken Indonesian.
- Invite real back-and-forth with a natural peer question ("kalian biasanya gimana?").
- Treat strong Threads posts with real proof as seeds for a full site article within 1–2 weeks.

**Don't:**

- Use `"🧵 thread"`, `"simak utas ini"`, or engagement-bait polls/prompts.
- Exaggerate a minor glitch into an anti-AI rant or dunk on other developers.
- Post unredacted terminal/browser screenshots or hint at private client work.

**Example opening sentence in this channel:** "Baru ngeh tadi, ternyata hook draft-only buat agent AI-ku cuma ngecek pas create, lupa ngeblok pas update tanpa `?draft=true`."

### Short video script (Indonesian — TikTok / Reels / Shorts)

**Hard constraints:**

- Language: casual Indonesian (`id-ID`), `"aku/kalian"`.
- Target length: 30–60 seconds (~75–150 spoken words) in vertical 9:16 framing.
- Script format must include spoken lines, brief on-screen text (reinforcing, not duplicating word-for-word), and visual/screen cues showing real evidence (editor, terminal test run, or browser).
- Every screen recording must be checked beforehand for exposed API keys, tokens, `.env` / `.env.deploy`, bookmarks, or client data.

**Tonal shift from voice baseline:**

- Spoken *"curhat teknis singkat"*. Honest hook in the first 2–3 seconds that delivers exactly what it promises, light humor about a real debugging misstep allowed, tight pacing with zero lecture energy.

**Do:**

- Start with a direct, honest hook tied to the real screen evidence ("Tadi aku hampir kecolongan bug ini pas bikin fitur AI...").
- Show the actual broken output, failing test, or fix on screen rather than only talking to camera.
- Write for the ear — short spoken clauses Afan can say naturally in one breath.

**Don't:**

- Use bait-and-switch hooks ("Rahasia developer 10x yang disembunyikan...").
- Read stiff blog prose or LinkedIn copy verbatim on camera.
- Over-script dramatic reactions or add condescending "jangan sampai kalian kayak gini" scolding.

**Example opening sentence in this channel:** "Tadi aku hampir loloskan bug konyol waktu nyuruh coding agent bikin guard buat draft blog."

---

## Global Do's and Don'ts

A scannable, consolidated list for writers and bots loading `TONE.md` into their context window. Cover the most decision-affecting items first.

### Do

1. Ground every post in real work Afan actually built, ran, or tested — include concrete evidence (commit, test count, prompt excerpt, fallback behavior, or redacted screenshot).
2. Keep the candid *"orang curhat"* spirit: openly share what broke, what the AI got wrong, and how you fixed it.
3. Pass every English site paragraph through the interview test: if Afan cannot explain it naturally aloud in an interview, simplify or cut it.
4. Match the pronoun and register to the channel: simple English `"I"` on the site, peer-professional Indonesian `"saya"` on LinkedIn, casual Indonesian `"aku/kalian"` on Threads and short video.
5. State your engineering standard calmly in first person ("I validate AI output before showing it", "saya uji dulu sebelum publish").
6. Redact every screenshot, terminal capture, and code snippet before sharing so no API keys, tokens, `.env`, `.env.deploy`, or client data appear.
7. Keep sentences short and active — name who did what, one idea per sentence, sentence case for titles and headings.
8. Disclose AI writing assistance transparently (`aiAssisted: true` on the site) while making clear that ideas, tests, and decisions are Afan's.
9. Define technical terms briefly on first use when recruiters or clients might read the post.
10. Keep Threads posts under 500 characters and LinkedIn hooks clear within the first 210 characters.

### Don't

1. Never disparage clients, employers, or coworkers, and never expose private client data or client repositories.
2. Never post about politics or SARA on any channel.
3. Never publish metrics, benchmarks, testimonials, or claims that Afan has not personally tested or verified in `docs/content/copy-draft.md`.
4. Never leak secrets, API keys, session cookies, `.env`, or `.env.deploy` in screenshots, logs, or example payloads.
5. Never write AI hype (`10x`, `game-changer`, `revolusioner`, `AI will replace all devs`) or LLM filler (`delve`, `seamless`, `robust`, `in today's fast-paced world`).
6. Never use LinkedIn broetry (one-line dramatic stacks, fake humility, `"Agree?"`, `"Setuju?"`) or Threads `"🧵 thread"` templates.
7. Never use bait-and-switch clickbait hooks in articles, social posts, or video scripts.
8. Never lecture, mock, or talk down to other developers — firm craft does not need a loud voice.
9. Never use em-dashes (`—`), emojis, Markdown tables, or raw HTML in published English site articles.
10. Never let an AI agent publish directly — agents save drafts only, and Afan reviews and publishes himself.

---

## Examples Library

Before/after pairs and short full-artefact samples that downstream writers and skills can pattern-match against.

### Before / After

**1. Site blog — explaining AI output handling (Jejak Puncak)**

Before (off-brand):

> "By leveraging cutting-edge generative AI, Jejak Puncak seamlessly delivers intelligent, hyper-personalized hiking itineraries — a true game-changer for outdoor enthusiasts."

After (on-brand):

> "Jejak Puncak uses the Gemini API to generate a packing list as structured JSON. The app checks that response against a schema before showing it, and falls back to an OpenAI-compatible endpoint if Gemini times out."

Why: Applies *Evidence-first, never hype* and *Plainspoken, never lecturing*; cuts banned terms (`leverage`, `cutting-edge`, `seamlessly`, `game-changer`) and removes the em-dash.

**2. LinkedIn (Indonesian) — sharing the agent draft workflow**

Before (off-brand):

> "AI tidak akan menggantikan developer.
>
> Tapi developer yang pakai AI akan menggantikan yang tidak. 🚀🔥
>
> Hari ini saya membangun sistem AI agent revolusioner untuk blog saya.
>
> Setuju? 👇"

After (on-brand):

> "Minggu ini saya bikin role `agent` khusus di Payload CMS supaya AI bisa bantu simpan draft artikel di blog saya, tapi tetap tidak bisa publish sendiri.
>
> Saya kunci di sisi server pakai hook dan access control: kalau agent coba kirim `_status: "published"` atau hapus post, server langsung balas 403. Draft tetap saya preview dulu di frontend baru saya publish manual.
>
> Buat saya, pakai AI di workflow itu tetap perlu pagar yang jelas, bukan dilepas begitu saja."

Why: Applies *Candid, never performative* and *Firm in craft, never loud*; removes broetry line-stacking, emoji spam, hype, and `"Setuju?"` bait; uses peer-professional `"saya"`.

**3. Threads (Indonesian) — live debugging curhat**

Before (off-brand):

> "🧵 THREAD: 5 kesalahan fatal developer saat bikin integrasi Google Apps Script! Nomor 3 bikin klien marah besar! Simak utas ini 👇"

After (on-brand):

> "Baru ketahuan waktu ngetes automasi Apps Script: kalau trigger-nya kejalan dua kali, folder Drive dan event Calendar ikut kebikin dobel. Akhirnya aku ubah script-nya jadi idempotent plus tambah integration test biar nggak kejadian lagi di production. Kalian paling sering kecolongan edge case apa pas bikin automasi?"

Why: Applies *Candid, never performative* and Threads constraints (<= 500 chars, `"aku/kalian"`, no `"🧵 thread"`, no clickbait, real Namaka Photography lesson without exposing client data).

**4. Short video script hook (Indonesian) — checking AI code**

Before (off-brand):

> "Stop vibe coding sekarang juga! Kalau kalian masih percaya 100% sama kode AI, siap-siap aplikasi kalian hancur!"

After (on-brand):

> [Visual: layar editor menampilkan test merah di terminal]
> Spoken: "Tadi aku nyuruh coding agent bikin aturan supaya draft blog nggak bocor ke publik. Sekilas kodenya rapi banget, tapi pas aku tes ulang, ternyata satu jalur update-nya masih lolos. Ini cara aku ngecek dan nutup celahnya."

Why: Applies *Firm in craft, never loud or combative* and short-video rules (honest hook tied to visual evidence, `"aku/kalian"`, zero scolding).

### Full-artefact samples (optional)

**Sample Threads post (Indonesian — 320 characters):**

> "Lagi ngerapihin fitur AI buat blog portofolio minggu ini. Jujur awalnya pengen cepat jadi, tapi pas kucek ulang hasil kodenya, ada satu case di mana draft hampir kebaca tanpa cek status. Lumayan ketampar sih, tapi jadi pengingat lagi: AI enak banget buat bantu nulis, cuma ngecek dan ngetesnya tetap nggak boleh di-skip."

**Sample LinkedIn post (Indonesian):**

> "Belakangan ini saya mulai merapikan cara saya memakai AI saat membangun proyek web.
>
> Waktu mengerjakan fitur AI di web app, masalah yang paling sering muncul bukan di prompt-nya, tapi di output yang bentuknya berubah atau API yang tiba-tiba timeout. Karena itu, saya biasakan dua hal: validasi response dengan schema sebelum dipakai UI, dan siapkan jalur fallback kalau provider gagal merespons.
>
> Prinsip yang sama saya pakai waktu pakai coding agent untuk membangun situs portofolio ini. Agen membantu bikin draft dan kode, tapi saya tetap baca ulang, jalankan tes, dan cek sendiri sebelum rilis.
>
> Di tim atau proyek rekan-rekan, pengecekan apa yang paling sering menyelamatkan kode hasil bantuan AI sebelum naik ke production?"

---

## Provenance

- **Generated from:** Discovery interview with Afan Affaidin (2026-11-24), `docs/superpowers/specs/2026-11-24-ai-notes-blog-design.md`, and `docs/content/copy-draft.md`.
- **Researcher notes:** N/A (Personal developer brand within covered categories; voice references triangulated from Simon Willison, Julia Evans, and Dan Abramov / Mitchell Hashimoto without imitating any single writer wholesale).
- **Sources cited:** `samber/cc-skills@copywriting-tone-of-voice-creator`, Nielsen Norman Group (*The Four Dimensions of Tone of Voice*), Conscious Style Guide (Karen Yin), APA Inclusive Language Guidelines.
- **Owner:** Afan Affaidin (`haloafan.com`).
- **Change cadence:** Quarterly audit (or whenever a new channel is added).
- **Next review:** `2027-02-24`.
