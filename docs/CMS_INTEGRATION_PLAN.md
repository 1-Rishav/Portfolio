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

*(Reset: none of these schemas exist in the project yet - Category 2 starts from scratch once Category 1 is complete.)*

- ⬜ `heroProject`, `timelineProject`, `featuredProject` (Home)
- ⬜ `serviceItem`, `serviceShowcaseProject` (Develop/Design Services)
- ⬜ `projectHighlight` (Mern/Pern, generalized — see Category 6)
- ⬜ `skillTickerItem`, `web3TickerItem` (About)
- ⬜ `faqItem` (Contact)
- ⬜ `siteSettings` (singleton: bio, contact info, socials, resume link)
- ⬜ `lab` (Labs page mini-projects)
- ⬜ Revisit `image`/`file` fields once Category 5 (media migration) is under way — may need a `caption`/`alt` sub-field added where missing

## Category 3 — Static Copy Migration
Single strings/paragraphs, one per spot. Mechanically identical work
wherever it appears: replace a hardcoded string with a field read off
`siteSettings` (or the page's own document).

- ⬜ About — bio paragraph (`siteSettings.aboutBio`)
- ⬜ Contact — heading + hero image (`siteSettings.contactHeading` / `contactImage`)
- ⬜ Footer — phone / email / address (`siteSettings.phone` / `email` / `address`)
- ⬜ Footer — social links (`siteSettings.socialLinks`)
- ⬜ About/footer — resume link (`siteSettings.resumeUrl`)

**DRY note:** all of these are one `siteSettings` document, fetched once. Build
a single `useSiteSettings()` hook and every item above is a one-line change
in its component, not a new fetch each time.

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
Not a migration — new content and new UI. Already scoped in an earlier
session: `lab` schema exists (Category 2). Remaining work is entirely new
build, tracked separately from the migration categories since none of it
touches existing pages.

- ⬜ Design the page structure (rows grouped by category, each row a
  horizontal set of variant cards) with modern motion — its own design pass,
  reported back before wiring real data in
- ⬜ Build the page against real `lab` documents (title, variant, description,
  GitHub link, live link, documentation)
- ⬜ Render `documentation` (Portable Text) as formatted usage instructions
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
