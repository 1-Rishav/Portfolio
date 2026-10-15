# Sanity CMS Integration — Work Tracker

This groups the CMS work by **kind of task**, not by page. Several pages need
the exact same *kind* of change (e.g. "fetch a list and map over it"), so
solving that once and reusing it is the point of organizing it this way -
see the DRY note at the end of each category.

Status legend: ✅ done · ⬜ not started · ⏳ waiting on a step only you can do · ✂️ removed by design (reason recorded).

> **Status reset (Oct 2026):** the earlier ✅ marks on Categories 1-2 referred to code that is not in the
> project - `studio/`, `sanityClient.js`, `server/src/config/sanity.js` and the schemas were never part of
> `Portfolio_2.zip`. Both categories were restarted from scratch and are tracked below, one task at a time.

---

## Architecture decisions (apply to every category)

Settled during the Category 1 analysis (from reading the client, the server and the SDK). Later categories follow
these instead of re-deciding them.

1. **Read path - browser straight to Sanity's CDN.** Content is fetched at runtime from `<projectId>.apicdn.sanity.io`:
   tokenless, published perspective, public dataset. It never goes through the Express server. That server is on
   Render's free tier (it even self-pings every 14 minutes to avoid sleeping), so routing content through it would add
   cold-start latency and a second failure point to every page.
2. **Write path - Studio only.** Editors write in Sanity Studio. The only code that ever writes is the one-off seed
   script (Category 5), run locally with a write token that lives in `studio/.env` and nowhere else.
3. **The Express server gets no Sanity client or token.** No server feature consumes editorial content, and an
   Editor-access token on an internet-facing server is the most damaging credential in the system for no benefit.
   Revisit only when a server feature genuinely needs Sanity (then: read-only Viewer token, lazy init, no boot-time
   dependency).
4. **Data boundary.** Sanity = editorial content (showcased projects, services, FAQ, skills, labs, site settings, media).
   MongoDB + Cloudinary = visitor-generated and personal data (accounts, contact messages, and the "assign a project"
   requests with their PDFs - `server/src/controller/projectController.js` is that intake, *not* portfolio content). The
   second group is never migrated: it is private, written by visitors and must stay behind the authenticated API.
5. **Environment contract.** Client (Vite): `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET` (default `production`),
   optional `VITE_SANITY_API_VERSION`. Studio: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` (default
   `production`) in `studio/.env`. Project id and dataset name are not secrets (they appear in every public request);
   tokens are, and never get a `VITE_` prefix (Vite ships every `VITE_` variable to the browser).
6. **Failure-mode contract.** `sanityClient.js` never throws at import. With missing or invalid env,
   `isSanityConfigured` is `false` and `fetchSanity()` rejects at once without making a request; when configured it
   rejects on a timeout (10 s), an HTTP error, a network failure or an abort. Every consumer treats any rejection exactly
   like "Sanity returned nothing" and shows the hardcoded fallback (Category 8), so the live site keeps working before
   setup is finished and when Sanity is unreachable. `urlFor()` likewise returns `null` instead of throwing. (Measured:
   the SDK throws on a missing or placeholder project id and the image builder throws on a missing or malformed image -
   either would blank the whole app.)
7. **Versioning and caching.** Pinned `apiVersion` date (measured: without one the SDK silently falls back to the
   deprecated `v1`), `useCdn: true`, `perspective: 'published'` so drafts can never reach the browser. Images come from
   `cdn.sanity.io` through `urlFor()` with `auto('format')` by default.
8. **Security and CORS.** The dataset stays public (tokenless reads are the design). Register these CORS origins in
   Sanity (manage.sanity.io > project > API > CORS origins) with **credentials off**: `http://localhost:5173`,
   `https://www.rajrishav.co.in`, `https://rishav-labs.vercel.app` (taken from the server's own CORS list; add
   `https://rajrishav.co.in` if the apex domain serves the site, and a Vercel preview wildcard if previews should work).
9. **Studio is a separate app.** Sanity Studio v6 needs React 19 and Node >= 22.12; the client is on React 18. So the
   Studio lives in its own folder with its own dependencies, run locally (`sanity dev`) or hosted free (`sanity deploy`).
10. **No rebuild pipeline.** Content is fetched at runtime, so publishing in Studio goes live without a Vercel rebuild.
11. **One door to Sanity.** The rest of the app calls `fetchSanity(query, params, { signal })` and `urlFor(image)` from
    `sanityClient.js` and never touches the SDK. The official SDK sits behind it, loaded lazily: measured, `@sanity/client`
    is 40 KB gzipped (about +8 % on the 494 KB main chunk) and a static import would put that on the critical path of
    every first load, while this design costs 4.4 KB there (the module + the image builder) and the SDK chunk downloads on
    first use. Considered and rejected: a hand-rolled `fetch` client (0 KB) - it would re-implement parameter encoding and
    error handling the SDK already gets right. Because consumers only see `fetchSanity`, swapping the implementation later
    would not touch any of them.
12. **Content vs. presentation boundary.** Not everything in a component becomes a schema field. Styled, structural text -
    section eyebrow labels, h1/h2 headings, a decorative trailing accent like the emerald "." after a heading - stays
    hardcoded; only the words that could plausibly be rewritten without touching styling become CMS content (a project
    description, a link, an image, a paragraph of prose). Applied so far: `contactHeading` is the words only, not
    Contact.jsx's own "Contact" label or its accent (2.6); the Home hero's "Hi, Its Rishav Raj" heading and intro
    paragraph, the timeline's "My Tech Journey (2022-2025)" heading and intro paragraph, and the carousel's "Projects
    That Define Me ." heading are all left in their components rather than added to a schema (2.1) - flagged as
    borderline rather than silently decided, since unlike a page's eyebrow label these do contain a few words that could
    plausibly change (a year range that will go stale on its own, a pitch that could be refreshed). Any of these can
    become a field later with a one-line reason; until then they stay hardcoded by default, not by oversight.
13. **Fallback content stays in code, same shape as Sanity, same render path.** Every schema mirrors a plain-data module
    already hardcoded in a component (`heroProject` mirrors `HeroParalax.jsx`'s `products` array, `featuredProject`
    mirrors `Carousel.jsx`'s `data` plus `ProjectDescription.jsx`, and so on). Categories 3/4 keep that pairing explicit:
    one small hook wraps `fetchSanity()` with a fallback value of the exact same shape the query returns, so a component
    always renders through one code path - `content.title`, `content.description`, however it is styled - whether
    `content` came from Sanity or the fallback. Considered and rejected: two different render paths for "has CMS data"
    vs. "doesn't" (risks the two drifting out of visual sync, which a single render path consuming normalized data
    cannot do). This is the architecture-decision version of a single shared content file - the data moves to one place
    per content area; the JSX and styling stay exactly where they are.

---

## Category 1 — Infrastructure & Wiring
The prerequisite everything else depends on. Design rules: *Architecture decisions* above.
**Status: complete except 1.5, which only you can run (checklist in `studio/README.md`). Category 2 does not wait for it; Categories 3-5 do.**

- ✅ **1.1 Studio scaffold** at `studio/` - own `package.json` + lockfile (Sanity Studio v6, React 19, `engines` node >= 22.12), env-driven `sanity.config.js` / `sanity.cli.js` that fail with a clear message when the project id is missing, an empty `schemaTypes/` ready for Category 2, `.gitignore`, `.env.example`, `README.md`. Done when `npm ci && npx sanity build` succeeds offline. **Verified:** `npm ci` from the lockfile (924 packages), build with a valid-format id (~10 s, offline), the unedited `.env.example` placeholder and a missing id are both refused with a readable message, `--version` / `login` still work without env, git ignores `.env*` but tracks `.env.example`, and the built Studio boots in real Chrome and calls `https://<projectId>.api.sanity.io/v2026-05-04/...` with the id from `.env` (this sandbox's network blocks that call, so login and real content are checked by you in 1.5). Pinned API version `2026-05-04` = the one Studio v6.17 itself uses, so GROQ tried in the Vision tool behaves the same on the site.
- ✅ **1.2 Browser client** `client/src/utils/sanityClient.js` - public, read-only, no token. Exports `isSanityConfigured`, `fetchSanity(query, params, { signal })` and `urlFor(image)` and nothing else (decision 11). Never throws at import; `useCdn: true`, `perspective: 'published'`, pinned `apiVersion`, 10 s timeout; `urlFor()` returns `null` for a missing, empty or malformed image. Adds `@sanity/client` + `@sanity/image-url` to `client/package.json` and the lockfile (purely additive: +2 lines, +11 packages, CRLF kept). **Verified** in real Chrome on production builds - unconfigured (id absent / placeholder id / bad dataset name): no throw, no request, correct warnings; configured: the exact request on the wire (`abc12345.apicdn.sanity.io/v2026-05-04/data/query/production`, published perspective, no auth header, no cookies), SDK downloaded once and only on first use, HTTP 404/500, network failure, abort and the 10 s timeout all end as clean rejections with the client healthy afterwards, `urlFor` gives exact CDN urls and `null` (not an exception) for every unusable input, and a failed SDK download rejects cleanly. The real app build passes with the main bundle byte-identical (nothing imports the module yet); lint 70 -> 70, 0 problems in the new file.
- ✂️ **1.3 ~~`server/src/config/sanity.js` Editor-access client~~** - removed by design, see decision 3. Nothing on the server reads or writes editorial content; the write token the seed script needs lives in `studio/.env` instead (Category 5). **Checked:** no Sanity reference anywhere in `server/`, which is byte-identical to the previous zip.
- ✅ **1.4 Env contract** - `client/.env.example` documents the `VITE_SANITY_*` variables (including that Vite inlines them at build time, so Vercel needs them set before the deploy that should use the CMS), `studio/.env.example` documents `SANITY_STUDIO_*`, `studio/.gitignore` keeps `.env*` out of git. No secret is added anywhere in the repo and `server/.env` is untouched. **Verified:** a real git repo ignores `client/.env` and `studio/.env*` and tracks both `.env.example` files; copying `client/.env.example` to `.env` makes Vite inline the placeholder, which the client module and `studio/env.js` both reject as "not configured" - leaving the example unedited is safe.
- ⏳ **1.5 Owner setup + first run (you)** - the checklist is written in `studio/README.md` and its commands were checked against the installed CLI (`--help`; and login, project creation, CORS and dataset commands all reach the login check with no `studio/.env` present, so there is no chicken-and-egg ordering problem). It can't be run here: this sandbox can't reach `api.sanity.io`. Steps: log in, create the project with a public `production` dataset, put the project id into `studio/.env`, `client/.env` and Vercel's environment variables (then redeploy), register the CORS origins (decision 8, credentials off), `npm run dev`, then the two "is it wired up" checks (a `curl` count, and `fetchSanity('count(*)')` in the browser console giving `[true, 0]`). **Mark this ✅ once you have run it** - Category 2 does not depend on it (schemas are built and validated offline); Categories 3-5 do.
- ✅ **1.6 Category check** - the real app build passes with the main bundle byte-identical, lint 70 -> 70 rule for rule, the Studio builds from its lockfile, no `node_modules` / `dist` / `.env` inside the project, every changed file keeps its line endings (CRLF files stay CRLF, new files are LF), both lockfiles agree with their `package.json`, and the diff against the previous zip is limited to the files above. The browser suite for the client module is saved in `docs/browser-tests/` (`run_sanity_suite.sh`) so it can be rerun when the hooks are built on top of it or the SDK is upgraded.

## Category 2 — Schema Design
One Sanity document type per kind of content. Done up front so every later
category is just "fetch this schema's data," not "design + fetch."
**Status: complete. 13 document types + 3 reusable object types + 1 shared field-set helper, each built from
reading the actual current component code rather than the one-line descriptions below (which turned out
wrong or incomplete more often than not - see 2.1's bio paragraph count, 2.2's rename, 2.3's two Tailwind-JIT
catches, 2.7's "variant" resolution, 2.9's rename), and each validated offline with `npx sanity build` and
`npx sanity schema validate` before being marked done. One new dependency added along the way
(`@sanity/code-input`, 2.7). 2.8 stays a standing note for Category 5, not a task - nothing here is blocked
on it. Next up: Category 3.**

- ✅ **2.1 `heroProject`, `timelineProject`, `featuredProject`** (Home) — three documents, one per repeatable
  thing on the Home page, each read from its real source rather than assumed: `heroProject` mirrors
  `HeroParalax.jsx`'s `products` array (`title`, optional `link` - replaces today's `"#"` placeholder for
  photo-only cards, `thumbnail`, `displayOrder`); `timelineProject` mirrors `TimeLineData.jsx`'s `data` array,
  whose 4 current entries are *not* shaped alike (1-2 paragraphs, an image grid of 4, 2 or none, one entry is
  a checklist instead of images) - rather than copy that inconsistency in, every entry gets the same
  `description` (portable text, paragraphs and/or a bullet list) and `highlights` (array of a new
  `linkedImage` object, allowed to be empty) so the checklist-style entry and the image-only entries both fit
  without a special case; `featuredProject` merges two files that describe one card today -
  `Carousel.jsx`'s `data` array (`category`, `title`, `cardImage`) and the matching component in
  `ProjectDescription.jsx` (`description`, `detailImage` - optional, falls back to `cardImage`, only GemX
  today actually differs - `githubUrl`, `websiteUrl`, both optional for a future project with no public repo
  or no live site). The "GitHub:" / "WebSite:" labels next to those links, and every section's own heading
  (hero, timeline, carousel), are presentation and stay in the component - see architecture decision 12 for
  the general rule and which specific headings were considered and left out. All three document types get a
  `displayOrder` number field plus a matching Studio sort ordering, named to read cleanly in a GROQ
  `order()` clause rather than shadowing it. **Verified:** `npx sanity schema validate` — 0 errors, 0
  warnings; `npm ci && npx sanity build` — clean, offline; diffed against the previous zip — only
  `studio/schemaTypes/index.js` and the new `documents/heroProject.js`, `documents/timelineProject.js`,
  `documents/featuredProject.js`, `objects/linkedImage.js` changed; `client/` and `server/` untouched.
  **Not yet done:** no content entered anywhere; fetching/rendering is Category 3/4, not this task.
- ✅ **2.2 `serviceGroup` (renamed from `serviceItem`), `serviceShowcaseProject`** (Develop/Design Services) —
  `serviceItem` renamed to `serviceGroup` because the real shape is one level up from an individual service:
  Develop_Service.jsx and Design_Service.jsx each render exactly 2 groups (Develop/Support, Design/Other) via
  `<FeatureComponent heading= subheading= service={array} end= />`, and heading/subheading/the service list/
  even the trailing accent character all travel together as one editorial unit - a flat one-document-per-
  service design would have left the heading and subheading with nowhere natural to live. Fields: `page`
  (develop/design), `heading`, `subheading`, `accentChar` (the emerald character after the subheading - looks
  like the permanent heading accents left out elsewhere, but genuinely varies here: Develop/Support/Design
  all end in "." but Other ends in "!", and `FeatureComponent` takes it as a prop, not a hardcoded character,
  so it's real content, not styling), `services` (array of strings), `displayOrder`. `serviceShowcaseProject`
  is a single shared list, not one per page - Develop's `DevelopImages` and Design's `ProjectImages` turned
  out to be the exact same 12 images in the exact same order; `image` + `displayOrder`, no title or link
  since neither is used by the live ribbon. **Verified:** `npx sanity schema validate` — 0 errors, 0
  warnings; `npm ci && npx sanity build` — clean, offline; diffed against the previous zip — only
  `studio/schemaTypes/index.js` and the 2 new files under `documents/` changed; `client/` and `server/`
  untouched. **Not yet done:** no content entered anywhere; fetching/rendering is Category 3/4. **Found, not
  built — see 2.9:** both service pages have hero-level media (Develop: a rotating 8-image set; Design: an
  autoplay video) that doesn't fit `serviceGroup` or `serviceShowcaseProject` - same shape of gap as the Home
  hero's tagline from 2.1, so folded into one new proposed task below instead of two more scattered flags.
- ✅ **2.3 `projectHighlight`** (Mern/Pern, generalized — see Category 6) — the schema Category 6's single
  `ProjectHighlightPage` template will eventually read by slug, built by diffing `Mern_Highlights.jsx` against
  `Pern_Highlights.jsx` line for line: every field here is something that genuinely differs between the two
  current pages; everything identical between them (the "Design"/"Tech Stack" section headings and their
  shared subheadings, the Highlights section's heading and ":" accent) stays in the future template, per
  architecture decision 12. Fields, grouped in the Studio (`hero`/`design`/`media`/`techStack`/`highlights`
  tabs - 15 fields was enough to be worth it): `title`, `slug` (for Category 6's `/highlights/:slug` route),
  `displayOrder`, `category` ("Mern Project"/"Pern Project" today, free text so a future stack isn't locked
  out), `titleColor`, `tagline`, `missionStatement`, `logo`, `websiteUrl`, `githubUrl`, `video`, `leftGallery`
  + `rightGallery` (two independently-rotating image sets, matching `HighlightImages.jsx`'s actual `img2`/
  `img3` props), `techStack` (array of a new `techStackItem` object), `features`.
  Two things only surfaced by reading the markup and `TechStackData.js` directly, not by assuming the two
  pages matched 2.1/2.2's patterns: the hero's project name has a genuine per-project text color (GemX blue,
  QuickFundz green) - unlike every other heading-adjacent accent left out so far, this one is a real,
  deliberate per-project choice, so it became a field (`titleColor`); and that color, plus every
  `techStackItem.color`, are closed lists of *keys* rather than the raw Tailwind classes the current data
  stores (`"bg-blue-600"` etc.) - Tailwind only generates CSS for class names it can find as literal text in
  scanned source, which today's data satisfies only because it sits in a `.js` file Tailwind reads; the
  moment this content moves to Sanity, a className built from the raw string would silently stop rendering
  with no error. Also changed: `techStackItem.logo` is a Sanity image, not the current hotlinked URL
  (Wikimedia/SendGrid/Cloudinary's demo account, one of which - GemAPI - is a literal placeholder image, not
  a real logo); `video` stays a URL for now but must be a genuine absolute one, not the current relative
  `/ProjectVideos/...` path, which only resolves today because it's served from the site's own domain.
  **Verified:** `npx sanity schema validate` — 0 errors, 0 warnings (caught and fixed two real mistakes
  first: a stray `#` in a comment that would have been a syntax error, and an overly permissive URL
  validation that would have let a non-functional relative path through); `npm ci && npx sanity build` —
  clean, offline; diffed against the previous zip — only `studio/schemaTypes/index.js` and the 2 new files
  under `documents/` and `objects/` changed; `client/` and `server/` untouched. **Not yet done:** no content
  entered anywhere; the generic template, routing, and actual migration of GemX/QuickFundz are Category 6,
  not this task - this task only built what Category 6 will read.
- ✅ **2.4 `skillTickerItem`, `web3TickerItem`** (About) — the simplest pair so far: `About.jsx`'s `webImages`
  (12 images, the right-moving ticker) and `Web3Images` (10 images, the left-moving "Exploring" ticker) are
  both pure image arrays with no title or link, confirmed by reading `CustomImages.jsx` itself rather than
  assuming from the call sites - same shape as 2.2's `serviceShowcaseProject`. Each document is just `image`
  (replacing today's generic "custom-img-N" alt text with a required one) + `displayOrder`. The two types are
  structurally identical, so the field/ordering/preview definitions were factored into one shared
  `schemaTypes/shared/tickerImage.js` helper that both documents spread in, rather than duplicating them -
  kept as two document types, not merged into one like 2.2's showcase images were, since unlike that case
  these are two genuinely different, non-overlapping image sets, not the same content shown twice. The "Skill
  is Best Way to Know About ." heading and the "Let's Connect" button stay in the component (architecture
  decision 12 for the heading; the button is a fixed `/contact` navigation link, not editorial content), not
  schema fields. **Verified:** `npx sanity schema validate` — 0 errors, 0 warnings; `npm ci && npx sanity
  build` — clean, offline; diffed against the previous zip — only `studio/schemaTypes/index.js` and 3 new
  files (2 documents + the shared helper) changed; `client/` and `server/` untouched. **Not yet done:** no
  content entered anywhere; fetching/rendering is Category 3/4. **Found, not fixed (UI_ISSUES_REPORT.md
  #4):** the "Exploring" button beside the web3 ticker has no `href` at all, unlike "Let's Connect" right
  above it which correctly links to `/contact`.
- ✅ **2.5 `faqItem`** (Contact) — the simplest schema yet: `FAQData.js`'s `faq` array is a flat list of
  `{title, answer}` pairs with no surrounding heading to weigh in on at all - `FAQ.jsx` renders straight into
  a HeroUI `<Accordion>` with no title text anywhere in or around it, unlike every other section so far.
  Fields: `question` (renamed from the data file's `title`, which is what it actually holds), `answer`
  (plain text, not portable text - matches `featuredProject.description`'s reasoning: single-paragraph prose,
  no internal formatting or lists), `displayOrder`. **Verified:** `npx sanity schema validate` — 0 errors, 0
  warnings; `npm ci && npx sanity build` — clean, offline; diffed against the previous zip — only
  `studio/schemaTypes/index.js` and 1 new file changed; `client/` and `server/` untouched. **Not yet done:**
  no content entered anywhere; fetching/rendering is Category 3/4.
- ✅ **2.6 `siteSettings`** (singleton: bio, contact info, socials, resume link) — fields designed from the real
  current code, which turned out to differ from the one-line description above in every field: `aboutBio`
  (`array` of `block` — About.jsx has three separate paragraphs under "About me", not one, so this is a small
  portable-text field: Normal style only, no lists, decorators limited to `strong`/`em`/`underline` to match
  the current copy's underlined emphasis — no annotations since nothing is linked today); `contactHeading`
  (`string`, content only — Contact.jsx keeps its own "Contact" label and styled accent, the field is just
  the words); `contactImage` (`image`, hotspot on, a *required* `alt` sub-field — the live `<img>` has
  `alt=""` today, so this closes that gap rather than carrying it forward); `phone` / `email`
  (`.email()`-validated) / `address` (`text`, 2 rows — Footer_BeamsCollision.jsx's address is two lines via a
  `<br/>`, kept as literal line breaks rather than a structured object, since nothing ever parses it
  programmatically); `socialLinks` (`array` of a new reusable `socialLink` object, `platform` + `url` — the
  real source turned out to be `Float_Icon.jsx`'s `FloatingDockDemo`, not the footer, and it mixes social
  links with the resume link in one array, which the schema deliberately splits back apart); `resumeUrl`
  (`url`, stays a link rather than a Sanity file asset — matches today's Google Drive link and this plan's
  own field name; a native file upload is a reasonable Category 5 candidate if preferred later, noted in the
  schema file rather than decided here). Singleton enforced in `sanity.config.js`, not just assumed: a fixed
  `siteSettings` document id the structure pane opens directly, filtered out of the generic create-new list,
  duplicate/delete disabled for it — without this an editor could create a second document and every query
  assuming "the one settings doc" would silently read the wrong one. **Verified:** `npx sanity schema
  validate` — 0 errors, 0 warnings; `npm ci && npx sanity build` — clean (~9 s, offline); diffed against the
  previous zip — only `studio/sanity.config.js`, `studio/schemaTypes/index.js`, and the two new files under
  `documents/` and `objects/` changed, nothing in `client/` or `server/` touched. **Not yet done:** no content
  entered (no `siteSettings` document exists in any dataset yet — that's Category 5's seed script, or manual
  entry once 1.5 is done); the footer's own "About / Resume / FAQs / Contact" nav text has no real links at
  all, unrelated to this task, logged in the UI issues report instead.
- ✅ **2.7 `lab`, `labCategory`** (Labs page mini-projects) — new feature, nothing existing to migrate, built
  against the field list Category 7 itself already anticipated (title, description, GitHub link, live link,
  documentation) plus one addition. `labCategory` is a real document type, not a closed list or a free-text
  string on `lab`: categories are expected to keep growing as new kinds of mini-projects get added, so a
  closed list would mean a schema edit per new category, and free text risks "Authentication" / "Auth" /
  "authentication" silently becoming three rows instead of one - a reference means the category is picked
  from what already exists, not retyped. What Category 7's notes call a "variant" turned out to be the `lab`
  document itself, not a separate field - adding one just to restate "this is a variant" would have been
  redundant. `documentation` needed more than every other portable-text field built so far: real code blocks,
  not just prose, since the whole point of this page is showing other developers how to use something -
  install commands, config, usage examples. Added `@sanity/code-input` (first new Studio dependency since
  Category 1; version and peer-dependency compatibility with this project's `sanity@^6.17.0` / `react@^19.2.2`
  / `styled-components@^6.1.15` confirmed against the npm registry before installing, pinned with the same
  `^` convention already used by every other dependency in the file) and registered its `codeInput()` plugin
  in `sanity.config.js`, so `documentation` is portable text (Normal/H3/H4 styles, bullet/numbered lists,
  bold/italic/inline-code, a link annotation) plus real `code` blocks with a curated language list (JS/TS/
  JSX/TSX/JSON/Bash/HTML/CSS) rather than approximating code with a monospace text style. **Verified:** `npx
  sanity schema validate` — 0 errors, 0 warnings; `npm ci && npx sanity build` — clean, offline; diffed
  against the previous zip — `studio/schemaTypes/index.js`, 2 new document files, `studio/sanity.config.js`,
  and (new this task) `studio/package.json` + `studio/package-lock.json` for the new dependency; `client/`
  and `server/` untouched. **Not yet done:** no content entered anywhere; the actual page, its motion design,
  the route, and rendering `documentation` are Category 7, not this task - this task only built what Category
  7 will read.
- ⬜ **2.8** Revisit `image`/`file` fields once Category 5 (media migration) is under way — may need a `caption`/`alt` sub-field added where missing
- ✅ **2.9 `sectionIntro`** (renamed from the proposed `pageHero`) — consolidates the 4 hero-level gaps found
  in 2.1/2.2 into one schema: Home hero's tagline, Home timeline's intro paragraph, Develop hero's rotating
  image set, Design hero's video. Renamed because "page" undersold it once built - the timeline instance is
  a section within the Home page, not the page's own hero. The 4 instances need genuinely different fields
  (a hero has a tagline and no media; a service-page hero has media and no tagline), so every field is
  optional and a closed-list `sectionKey` (`home-hero` / `home-timeline` / `develop-hero` / `design-hero`)
  says which instance a document is - closed rather than open like `labCategory`, since this set is fixed by
  where it gets fetched in the code, not expected to grow. Resolved the open year-range question from the
  proposal: the timeline's "My Tech Journey (2022-2025)" heading keeps its text in the component like every
  other permanent heading (architecture decision 12), but the two numbers inside it come out as
  `journeyStartYear`/`journeyEndYear` fields, since unlike a purely stylistic heading this one embeds a date
  that will become factually wrong, not just look dated. `journeyEndYear` is optional specifically so an
  editor can leave it blank to mean "ongoing" ("2022-Present") rather than needing to keep entering a fixed
  year that would only go stale again. **Verified:** `npx sanity schema validate` — 0 errors, 0 warnings;
  `npm ci && npx sanity build` — clean, offline; diffed against the previous zip — only
  `studio/schemaTypes/index.js` and 1 new file changed; `client/` and `server/` untouched. **Not yet done:**
  no content entered anywhere; fetching/rendering is Category 3/4.

## Category 3 — Static Copy Migration
Single strings/paragraphs, one per spot. Mechanically identical work
wherever it appears: replace a hardcoded string with a field read off
`siteSettings` (or the page's own document).
**Status: complete. First time this project's `client/` was actually touched - every prior category stayed
inside `studio/`/`docs/`. Every task validated with `npm run build` and `npm run lint` in place of the
Studio's schema validator, and from 3.2 onward also verified by server-rendering the real fallback data and
checking the output (character-for-character where an exact match was the goal, with any deliberate
difference named rather than glossed over). Two real mistakes were caught by re-checking before continuing
rather than assuming a prior pass was complete - both fixed before being marked done, not after (3.2's "Hi,"
duplication bug; this category's own task 3.1 was itself a recovery from an earlier interruption). `server/`
confirmed untouched the entire category. Next up: Category 4.**

- ✅ **3.1 Foundation** — the DRY note's `useSiteSettings()` hook, plus the fallback-content half of
  architecture decision 13 that no earlier category needed yet. `client/src/components/Data/
  SiteSettingsFallback.js` mirrors `siteSettings`' exact shape, transcribed from the real current values in
  `About.jsx`, `Contact.jsx`, `Footer_BeamsCollision.jsx` and `Float_Icon.jsx` - including two spots kept
  exactly as-is rather than quietly corrected (a missing space, a reversed phone country code), logged in
  the UI issues report instead (#5, #6) so fixing them is a decision made on purpose, not a side effect of
  this migration. `aboutBio` is real Portable Text blocks, not a plain string, so it renders through the
  identical `<PortableText>` call as real Sanity content would - installed `@portabletext/react` for this,
  pinned to `^6.2.0` (the last release supporting this project's React 18; 7.0.0+ requires React 19, checked
  against the registry before installing, same method as `@sanity/code-input` in 2.7). `useSiteSettings()`
  itself: a module-level cache so the one `siteSettings` document is fetched once and shared by every
  consumer (About, Contact, the footer) rather than each re-fetching it, returning the fallback immediately
  and swapping to real content if and when the fetch resolves - no loading state, since the fallback already
  is what the site shows today. Also added `resolveImage()` to `sanityClient.js` (not siteSettings-specific
  - every image field from here on needs the same "Sanity image, or fall back to a local import" resolution,
  so it lives next to `urlFor()` rather than inside this one hook). **Verified:** `npm run lint` on the new/
  edited files - clean; `npm run build` - succeeds (exercising the real unconfigured-Sanity code path, since
  this sandbox has no live project id, matching the site's actual current deployed state); diffed against
  the previous zip - `client/package.json` + `package-lock.json` (new dependency), `client/src/utils/
  sanityClient.js` (edited), 2 new files; nothing in `server/` touched, and no component wired up to any of
  this yet - that's 3.2 onward.
- ✅ **3.2** About — bio paragraph (`siteSettings.aboutBio`) — the DRY note's first real test, and not quite a
  one-line change: `aboutBio`'s three blocks map to two different DOM locations with two different wrapper
  styles (the big intro div, and two separate `<h2>`s), not one flowing paragraph, so each block is rendered
  with its own `<PortableText value={[settings.aboutBio[n]]}>` call and a `components.block.normal` matching
  that block's original wrapper exactly, sharing one `bioMarks` object (just `underline`) across all three.
  "Hi," keeps its own `text-blue-800` span in the component, same as every other heading-adjacent accent
  (architecture decision 12) - it has no equivalent in the schema's marks (strong/em/underline, no color), so
  it was never meant to be content. **A real bug caught by re-verifying before continuing, not assumed
  fixed:** a prior pass had updated `SiteSettingsFallback.js`'s comment to say "Hi," was removed, but never
  actually touched the text itself - still would have rendered "Hi,Hi,I'm..." Caught and fixed before this
  task was marked done. **Verified beyond the usual build/lint:** server-rendered all three paragraphs with
  `ReactDOMServer.renderToStaticMarkup` straight from the real fallback data and compared the output
  character-for-character against the original markup - exact match, including the missing spaces, the
  stray spaces before two periods, and the underline span positions; this is the first content-rendering
  task in Category 3, and compiling cleanly doesn't prove the text comes out identical, so this task didn't
  stop at the usual checks. `npm run lint` - 1 pre-existing error remains (`Let's Connect` button's
  unescaped apostrophe, unrelated to this task, elsewhere in the file - confirmed by linting the original
  file for comparison); no new errors or warnings introduced, and this change removed one of the two
  pre-existing instances of that exact error as a side effect, rather than adding to it. `npm run build` -
  succeeds. Diffed against the previous zip - `About.jsx` and `SiteSettingsFallback.js` changed; nothing
  else in `client/` or anywhere in `server/` touched.
- ✅ **3.3** Contact — heading + hero image (`siteSettings.contactHeading` / `contactImage`) — closer to the
  promised one-line change than 3.2, but surfaced one more piece of the already-flagged heading
  simplification: re-reading the exact markup for this task found that "Let's Connect" wasn't just split
  from "and Create" by a `<br/>` (already known, flagged in 3.1) - it also sat in its own `<span>` with
  responsive left-padding (`px-2` through `4xl:px-60`) that "and Create" didn't have, a staggered-indent
  effect that a single content string can't reproduce without an arbitrary split point. Left out along with
  the `<br/>`, for the same reason: `contactHeading` renders as one continuous string, wrapping naturally.
  First real use of `resolveImage()` (built in 3.1): `contactImage` resolves through it with
  `images.Project1_i` as the fallback - the same image the page already uses - and the empty `alt=""` on the
  live site is gone, replaced by a real value either way (the schema's required `contactImage.alt` for real
  Sanity data, `siteSettingsFallback.contactImageAlt` for the fallback - read from the fallback module
  directly rather than through `settings`, since a real siteSettings document has no top-level
  `contactImageAlt` field for that to mean). **Verified:** `npm run lint` - clean. `npm run build` - succeeds.
  Server-rendered the heading and resolved the image from the real fallback data (esbuild + `--define` to
  shim Vite's `import.meta.env`, since this isn't running through Vite itself) - image src matches the
  original local import exactly, alt text correct, heading text correct including the curly apostrophe.
  Diffed against the previous zip - only `Contact.jsx` changed beyond 3.1/3.2's files; `server/` untouched.
- ✅ **3.4** Footer — phone / email / address (`siteSettings.phone` / `email` / `address`) — the simplest task
  so far, genuinely close to the DRY note's one-line change: `phone` and `email` are directly `{settings.phone}` /
  `{settings.email}`. `address` splits on its literal `"\n"` and maps each line with a `<br/>` between -
  generic for however many lines an editor actually enters, not hardcoded for exactly two the way the live
  markup is today. **Verified:** `npm run lint` - clean. `npm run build` - succeeds. Server-rendered the
  three fields from the real fallback data - phone and email matched the original exactly; the address
  matched with one documented, insignificant difference: today's JSX has a literal space on each side of its
  `<br />` ("PG <br /> Ramapuram"), which this render does not reproduce, since the fallback's `"\n"`-joined
  string was written without them. No visual effect either way - browsers collapse whitespace immediately
  adjacent to a line break - so this was left as is rather than added back for a difference nothing will
  ever show. Diffed against the previous zip - only `Footer_BeamsCollision.jsx` changed beyond 3.1-3.3's
  files; `server/` untouched.
- ✅ **3.5** Footer — social links (`siteSettings.socialLinks`) — a design tension worth recording, not just
  the mechanical wiring: hardcoding three lookups for linkedin/github/twitter specifically would have been
  the easy match for today's exact layout, but it would silently break the `socialLink` schema's own promise
  (2.6) that adding a platform already on its list is a content change, not a code change - a 4th link added
  in Studio would just never appear. Mapped `settings.socialLinks` generically instead, in whatever
  order/count it actually holds, with a `PLATFORM_META` lookup covering all 7 platforms the schema allows,
  not only the 3 live today - built and verified now (real icons confirmed render for all 7, not just
  assumed from import success) rather than left as a future gap. An unrecognized platform is dropped, not
  rendered broken, defensive given the schema's closed list should make it impossible but not assumed.
  **One deliberate, flagged position change:** Resume (still hardcoded - 3.6) moved from its current
  2nd-of-4 slot to after the social links, since that position only made sense relative to today's fixed
  3-link order; once the link count is genuinely variable there is no single index that stays correct once a
  4th or 5th social link exists. **Verified:** `npm run lint` - clean. `npm run build` - succeeds.
  Server-rendered the full platform-to-icon resolution from the real fallback data: all 3 entries resolved
  with correct titles, hrefs, and actual rendering SVG icons (not just confirmed to import without error);
  separately confirmed an unrecognized platform is dropped rather than crashing. Diffed against the previous
  zip - only `Float_Icon.jsx` changed beyond 3.1-3.4's files; `server/` untouched.
- ✅ **3.6** About/footer — resume link (`siteSettings.resumeUrl`) — genuinely the one-line change the DRY
  note promised, the only task in this category that was: `href: settings.resumeUrl` in place of the
  hardcoded Google Drive URL in `Float_Icon.jsx`'s "Resume" entry (3.5 already handled its position in the
  dock). "About/footer" in this task's own title turned out to describe where a resume link conceptually
  belongs, not two separate places to wire - confirmed by checking: the only functional resume link anywhere
  is this one dock entry; the footer's own "Resume" nav text is the already-flagged dead link
  (UI_ISSUES_REPORT.md #3), not a second real link to migrate. **Verified:** `npm run lint` - clean, same
  one pre-existing unrelated error as every other task this category. `npm run build` - succeeds. Confirmed
  `SiteSettingsFallback.js`'s `resumeUrl` value matches the original hardcoded URL character-for-character.
  Diffed against the previous zip - only `Float_Icon.jsx` changed beyond 3.1-3.5's files; `server/`
  untouched.

**DRY note:** all of these are one `siteSettings` document, fetched once via
`useSiteSettings()` (3.1) - every item above is now a one-line change in its
component, not a new fetch each time.

## Category 4 — Repeatable List Migration
Anywhere a component currently does `hardcodedArray.map(...)`. The fetch +
loading/empty-state shape is the same every time (see Category 8) — only the
schema and the rendered markup differ.

- ⬜ About — Skills ticker (`skillTickerItem`)
- ⬜ About — Web3 ticker (`web3TickerItem`)
- ⬜ Contact — FAQ list (`faqItem`)
- ⬜ Develop/Design Services — service name lists (`serviceItem`, filtered by category)
- ⬜ Develop/Design Services — project showcase ticker (`serviceShowcaseProject`, shared by both pages)
- ⬜ Home — hero parallax products (`heroProject`)
- ⬜ Home — timeline grid (`timelineProject`)
- ⬜ Home — featured project cards (`featuredProject`)
- ⬜ Mern/Pern — tech stack list, feature highlights list (part of `projectHighlight`, Category 6)

**DRY note:** one small `useSanityList(query)` hook, built once, covers every
line above — each becomes "call the hook with this query," not a bespoke
fetch implementation per component.

## Category 5 — Media Asset Migration
Separate from Category 4 because it's a different problem: not just *where
the data comes from*, but *where the file itself lives*. Confirmed by
measurement, not guessed: `client/src/assets/` is 35MB of this project's 72MB
total (excluding `node_modules`) — the six `Rishav*.jpg` personal photos
alone (used only in the Home hero parallax) are ~20MB, despite being
displayed at a small thumbnail size.

- ⬜ Upload each image/video referenced by a schema in Category 2 into Sanity's own asset storage (via Studio, as content is entered)
- ⬜ **Seed script** (`studio/scripts/seed.mjs`): a one-time script that reads the existing hardcoded arrays and local image files and creates the matching Sanity documents and asset uploads in one go, so the ~60 current images and every existing list don't have to be re-entered by hand. Written and syntax-checked here, but it has to be *run* on your machine (this sandbox can't reach `api.sanity.io`); it will have a `--dry-run` mode that only prints what it would create, so it's safe to look before anything is written
- ⬜ Swap local `import img from '../assets/...'` for `urlFor(doc.image)?.width(...).url()` everywhere a migrated field replaces one (`urlFor` returns `null` for a missing, empty or malformed image - decisions 6 and 7 - hence the `?.`)
- ⬜ Once every consumer of an asset is confirmed switched over, delete the now-unused file from `client/src/assets/` — not before, and one at a time, so nothing goes missing mid-swap
- ⬜ The 6 `Rishav*.jpg` files specifically: also worth asking whether a smaller source photo is available, since Sanity will serve whatever resolution you give it — this is the single biggest size win in the project

**DRY note:** this category doesn't get "solved once" the way 3/4 do — it's
inherently one asset at a time — but it rides along with Category 3/4's work
rather than being a separate pass: when a field's data gets migrated, its
image migrates with it, same step.

## Category 6 — Generalized Template Pages
Not a data swap — a structural one. `Mern_Highlights.jsx` and
`Pern_Highlights.jsx` are the same component by hand, twice, with different
values. Replacing both with one template driven by a `projectHighlight`
document (already schemed in Category 2) means a third highlighted project
in the future is a new Sanity document, not a new file.

- ⬜ Build one generic `ProjectHighlightPage` component reading a `projectHighlight` document by slug
- ⬜ Add a dynamic route (e.g. `/highlights/:slug`) resolving to it
- ⬜ Migrate GemX's content into a `projectHighlight` document, point the route at it, confirm it matches the current `/mern-highlights` page
- ⬜ Same for QuickFundz / `/pern-highlights`
- ⬜ Update nav links (`Floating_Nav.jsx` and mobile equivalents) to the new routes
- ⬜ Remove `Mern_Highlights.jsx` / `Pern_Highlights.jsx` once both are confirmed working from the template

## Category 7 — New Feature: Labs Page
Not a migration — new content and new UI. `lab` and `labCategory` are built
and verified (Category 2.7) - this line previously said the schema
"already existed" from an earlier session, which was never true; corrected
when 2.7 was actually done, rather than left to cause confusion later.
Remaining work is entirely new build, tracked separately from the
migration categories since none of it touches existing pages.

- ⬜ Design the page structure (rows grouped by category, each row a
  horizontal set of variant cards) with modern motion — its own design pass,
  reported back before wiring real data in
- ⬜ Build the page against real `lab` documents (`title`, `category`
  reference, `description`, `githubUrl`, `liveUrl`, `documentation`) and
  `labCategory` documents (`name`) for the row groupings
- ⬜ Render `documentation` as formatted usage instructions - portable text
  plus real code blocks (`@sanity/code-input`, already installed), not
  prose alone
- ⬜ Add the route and a nav entry

## Category 8 — Cross-Cutting: Loading, Empty & Error States
Once content comes from a network call instead of a bundled import, every
page in Categories 3/4/6/7 needs to handle: the request still in flight, the
request coming back empty (no documents published yet for that section), and
the request failing (offline, Sanity down). Solving this **once**, before
migrating the first real page, means every subsequent page reuses the same
handling instead of improvising it per page - directly serving the "don't
repeat the same problem six times" concern.

- ⬜ One shared loading treatment (skeleton or spinner, matching existing site
  motion language) used by every migrated section
- ⬜ One shared "nothing published yet" empty state, so an empty Sanity
  dataset never renders a broken-looking blank gap
- ⬜ One shared error fallback for a failed fetch
- ⬜ **Fallback to the existing hardcoded data during migration**: each fetch hook takes the current hardcoded array as a fallback, used only while Sanity returns nothing. A page can be switched over before its content is fully entered without the live site ever going blank, and the hardcoded copy is deleted only after that page is confirmed rendering from Sanity. Sanity not being configured (`isSanityConfigured === false`, decision 6) is handled by the same path: the hook skips the request and returns the fallback, and any `fetchSanity()` rejection (timeout, HTTP error, offline) lands in that same fallback

## Category 9 — UI/Motion Polish & QA
Final pass once real (variable-length, sometimes-empty) content is flowing
through, checking nothing that worked with fixed hardcoded data breaks with
dynamic data - animation timing that assumed a fixed array length,
tickers whose GSAP math depends on item count (Sessions 9-12 already fixed
the *mechanism* for this; migrated pages need confirming against it, not
re-fixing it), and general scroll/motion QA. Findings from this session's
initial pass are in `docs/UI_ISSUES_REPORT.md`, kept separate since some of
them aren't CMS-related at all.
- ⬜ Add `<link rel="preconnect">` hints for `https://cdn.sanity.io` and `https://<projectId>.apicdn.sanity.io` in `client/index.html`, so the first CMS request and first image skip connection setup (needs the real project id, so it waits for Category 1.5)
