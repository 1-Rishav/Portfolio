# Portfolio — Build Tracker

This file tracks what's been analyzed, fixed, and implemented across sessions so work never has to be re-discovered from scratch.

## Stack
- **Client:** React 18 + Vite, Redux Toolkit + redux-persist, NextUI/shadcn, GSAP/Framer Motion/Three.js
- **Server:** Express + MongoDB (Mongoose), JWT (httpOnly cookie), Cloudinary uploads, deployed on Render
- **Deploy:** Vercel (client) + Render (server)

---

## Session log

### Session 1 — Full codebase analysis
Read every file in `client/` and `server/`, ran real `npm install` / `npm run build` / `npm run lint` / `npm start` on both sides. Produced a full flaws report covering security, bugs, performance, and code quality. The security items from that report are what Session 2 addresses.

### Session 2 — Auth & admin-protection feature (IN PROGRESS)

**Requirements (from user):**
1. Admin panel needs real protection — frontend guard *and* backend authorization (previously neither existed).
2. Public browsing and the Contact form stay open — no login required.
3. Assign Project requires login — unauthenticated visitors get an immediate login/signup modal, gating the form.
4. Admin login is unified — no dedicated `/admin/login` route to navigate to; logging in from anywhere auto-redirects an admin account straight to the admin page.
5. Must look correct across all 4 nav states: desktop top, desktop scrolled, mobile closed, mobile open.

**Backend — DONE, verified with a live smoke test**
- [x] `models/user.js` — JWT now signs `{ _id, role }` so middleware can check role without a DB hit
- [x] `middleware/auth.middleware.js` (new) — `verifyToken` (valid session required), `requireAdmin` (role check, runs after verifyToken)
- [x] `controller/userController.js` — register/login no longer return the raw token in the JSON body (cookie-only now); added `getCurrentUser` (`/auth/me`) and `logoutUser` (`/auth/logout`); removed the password-hash `console.log`
- [x] `routes/user.route.js` — added `GET /me` (protected), `POST /logout`
- [x] `routes/project.route.js` — `/new-project` requires login (any role); `/projects` + `/checkStatus` require admin
- [x] `routes/contact.route.js` — `/contactPage` stays public; `/connections` + `/checkConnection` require admin
- [x] `app.js` — moved `cookieParser()` before `routes` (was after — `req.cookies` was undefined for every route; required fix for the new middleware to work at all)
- [x] Verified live via a local smoke test hitting the real Express app: no-cookie -> 401, invalid cookie -> 401, valid-but-wrong-role -> 403, valid admin token -> passes auth layer, public routes unaffected. All passed as designed.

**Frontend — DONE, verified with a real `npm run build` + targeted lint**
- [x] `store/slices/authSlice.jsx` — no longer stores the raw JWT in Redux/localStorage (cookie + `/me` check now do that job); added `CheckAuth` thunk, `LogOut` now calls the backend before clearing local state
- [x] `utils/axios.js` — `withCredentials: true` globally (so admin GET calls actually send the cookie — Connections/AssignedProjects needed this)
- [x] `components/auth/AuthModal.jsx` (new) — reusable login/signup modal, tab-switchable; `allowClose=true` for the navbar (optional), `allowClose=false` for Assign Project (required)
- [x] `layout/adminLayout/index.jsx` — guard is now live (was commented out) — redirects home if not logged in or not admin
- [x] `routes/index.jsx` — removed standalone `/admin/login` / `/admin/signup` routes; `/admin` index now redirects straight to `/admin/menu` (guard handles protection)
- [x] `components/Floating_Nav.jsx` — Login/Logout added to both desktop and mobile nav; wired to the modal; `handleAuthSuccess` routes admin logins straight to `/admin/menu` regardless of where the modal was opened from
- [x] `components/Navigation/AssignProject.jsx` — form is blurred + non-interactive and a forced modal opens when not logged in; disappears automatically once Redux state flips to logged-in
- [x] `App.jsx` — dispatches `CheckAuth` once on mount to verify/correct persisted auth state
- [x] Removed now-orphaned `auth/Login.jsx`, `auth/Signup.jsx` (superseded by the modal; confirmed no remaining references first)
- [x] Verified: full production build succeeds (0 errors); targeted lint on all touched files shows 0 new issues beyond pre-existing prop-types/unused-import patterns already present elsewhere in the codebase
- [x] Shipped as zip

**How the pieces fit together:**
- Backend is the real security boundary (routes reject without a valid cookie/role, independent of anything the frontend does).
- Frontend guards are a UX layer on top: `AdminLayout` redirects unauthenticated/non-admin visitors away from `/admin/*`; `AssignProject` blocks interaction with the form (not a redirect — a forced modal) until logged in.
- One `AuthModal` component serves both contexts — dismissable when triggered from the navbar (login is optional there), forced when triggered from Assign Project (login is required to proceed).
- `CheckAuth` on app load + removing the raw JWT from Redux/localStorage together close the gap where persisted client state could claim an access level the server wouldn't actually honor.

**Explicitly out of scope for Session 2** (noted, not forgotten — from the Session 1 flaws report):
- Cookie `maxAge` typo (~986 years instead of ~30/360 days)
- Rate limiter mounted after routes (still a no-op)
- `req.file.originalname` accessed before the null check in `projectController.newProject` (confirmed still present via smoke test)
- 4 missing video files in `public/ProjectVideos/`
- Missing `nodemon` dependency (`npm start` fails)
- Image/bundle size optimization
- `/404` route doesn't exist (wildcard redirect target is itself unmatched)
- ESLint cleanup (279 pre-existing issues, mostly prop-types/unused-vars)

### Session 3 — Account menu UI + Google Sign-In (DONE, verified with a real build)

**Requirements (from user):**
1. Replace the plain-text "Login"/"Logout" nav links with an icon button (guest) / avatar+first-name pill with a dropdown (logged in) showing email + logout — matching a reference design, minus the two irrelevant menu items ("My appointments"/"My plans") from that reference.
2. Add Google OAuth as a sign-in method, wired into the same User model and every place the auth modal is used, without changing any existing functionality.

**New UI component**
- [x] `components/auth/AccountMenu.jsx` (new) — self-contained: reads `isLoggedIn`/`firstName`/`email` from Redux directly, so it drops into both desktop nav and the mobile hamburger panel without either needing role/isLoggedIn branching of its own.
  - Guest: circular icon button -> calls `onRequestLogin` (caller decides what that means in context - desktop just opens the modal, mobile closes the panel first)
  - Logged in: avatar (first-initial) + first name + chevron -> click opens a small dropdown with email (top) and Log out
  - Click-outside-to-close via a mousedown listener + ref
- [x] `components/Floating_Nav.jsx` - full rewrite to swap all 4 previous text Login/Logout spots (desktop admin, desktop guest, mobile admin, mobile guest) for `<AccountMenu/>`. The local `handleLogout`/`dispatch`/`isLoggedIn` in this file are gone - that logic now lives once, inside AccountMenu. `onAfterLogout` callbacks replicate the exact prior behavior (navigate home, close mobile panel) so nothing changed functionally, only where the logic lives.

**Google Sign-In (ID-token flow - same pattern as Brand Salon)**
- [x] Backend: `models/user.js` - added `googleId` (unique, sparse), `password` is now conditionally required (`required: !this.googleId`) so Google-created accounts don't need one
- [x] Backend: `controller/userController.js` - new `googleAuth` (verifies the ID token via `google-auth-library`'s `OAuth2Client.verifyIdToken`, audience-checked against `GOOGLE_CLIENT_ID`; finds-or-creates the user by email, links `googleId` if the email already existed); `registerUser`/`loginUser` now also return `firstName`/`email` (needed for the account menu); `loginUser` now gives a clear message if someone tries a password login on a Google-only account instead of crashing/confusing them
- [x] Backend: `routes/user.route.js` - added `POST /auth/google`
- [x] Backend: `server/.env` - added a `GOOGLE_CLIENT_ID=` placeholder with setup comments (real value has to come from the user's own Google Cloud project - see below)
- [x] Frontend: `store/slices/authSlice.jsx` - state now also carries `firstName`/`email` (safe to persist, not credentials); new `GoogleAuth` thunk uses the exact same `{success, role}` contract as `LoginUser`/`RegisterUser`, so it plugs into every existing `onSuccess` callback (Assign Project gate, admin auto-redirect) with zero changes to those call sites
- [x] Frontend: `components/auth/AuthModal.jsx` - added a "Continue with Google" button (mode-aware text: sign in vs sign up) above a divider, shown in both tabs since Google auth is mode-agnostic; button width is measured from its actual container via a ref (the library's `width` prop is pixels, not `%`, so this keeps it responsive instead of overflowing on narrow phones)
- [x] Frontend: `App.jsx` - wraps `<Router/>` in `GoogleOAuthProvider` **only when `VITE_GOOGLE_CLIENT_ID` is actually set** - until then the provider isn't mounted and the Google button doesn't render, so the app behaves identically to before this feature existed
- [x] Frontend: `client/.env.example` (new) - documents `VITE_GOOGLE_CLIENT_ID`
- [x] Verified: full production build succeeds (0 errors); targeted lint on every touched file shows 0 new issues beyond the same pre-existing prop-types/unused-import patterns already present elsewhere

**What the user still needs to do to actually activate Google Sign-In** (can't be done from here - requires their own Google account):
1. Google Cloud Console -> create/select a project -> APIs & Services -> Credentials -> Create Credentials -> OAuth client ID -> Application type: **Web application**
2. Authorized JavaScript origins: add `http://localhost:5173` (local dev) and the deployed Vercel URL(s)
3. Copy the Client ID (not the secret - this flow never needs it) into `server/.env`'s `GOOGLE_CLIENT_ID` **and** `client/.env`'s `VITE_GOOGLE_CLIENT_ID` (copy `client/.env.example` -> `client/.env` first)
4. Restart both dev servers

**Explicitly out of scope for Session 3** (same pre-existing list above, still untouched - plus):
- Did not touch the `/admin/login`-era removed pages or any Session 2 auth-protection logic beyond what's described above
- Did not add PropTypes anywhere (pre-existing codebase-wide convention, not touched)

### Session 4 — crash bug, rate limiter ordering, line-ending investigation (DONE, verified with a real build + runtime smoke test)

**Context: this session started from a user-provided `Portfolio_3.zip`**, not a continuation of the Session 1-3 sandbox directly (though it turned out to contain that exact Session 3 output, with `.git` removed and some assets removed to reduce upload size). Confirmed this by direct inspection before changing anything - see below.

**Diagnosed: "137 files changed" when comparing against GitHub after copying `.git` in locally**
- Proved zip compression is NOT the cause: created a file with real CRLF bytes, zipped it, unzipped it, verified byte-for-byte identical (DEFLATE is lossless - this is a hard guarantee, not a guess).
- Found the real mechanism by checking actual file bytes (via `file`/`od`, not naive `grep` - an early check using shell ANSI-C quoting silently gave false negatives and was redone properly): every file edited via a targeted/surgical edit in Sessions 2-3 (`app.js`, `userController.js`, routes, etc.) still had the *original* CRLF for untouched lines but LF for the specific lines that were changed/inserted - a mixed file. Every file written as a full rewrite (`Floating_Nav.jsx`, new files like `AccountMenu.jsx`) was pure LF. Files never touched at all (e.g. `About.jsx`, `TechStackData.js`) were *also* pure LF in the uploaded zip, which can't be explained by anything in this sandbox - that part most likely happened via a local editor/tool on the user's end (e.g. an editor that normalizes to LF on save) between when a zip was delivered and when `Portfolio_3.zip` was prepared.
- **Fix applied:**
  - [x] Normalized every text file in the project to consistent LF (11 files still had CRLF remnants; converted with `sed`, verified byte-level afterward that zero remain)
  - [x] Added `.gitattributes` at the repo root (`* text=auto eol=lf`, plus explicit `binary` declarations for images/fonts/video/pdf) so this can't recur regardless of what OS or editor touches a file next
  - **Heads up for the user:** the *first* time this `.gitattributes` is committed to the real GitHub repo (which still has CRLF in its history), git will want to renormalize everything to match it - expect one more "many files changed" commit. That one is the actual permanent fix; after it, this class of noise should stop for good.

**Fixed: the three requested bugs**
- [x] **JWT in localStorage** - checked first rather than assumed: already fixed in Session 2 (no `token` field anywhere in `authSlice` state or in any JSON response body - only the httpOnly cookie carries it). Nothing new to do here.
- [x] **Crash bug in project submission** - `projectController.js`: moved the `if (!req.file)` check to run first, before anything touches `req.file`, and removed the dead `fileOriginal` variable that was never used. Verified at runtime: submitting with no file now returns a clean `400 {"message":"File is required"}` instead of throwing an uncaught TypeError that left the request hanging forever.
- [x] **Rate limiter mounted after `app.use(routes)`** - `cookieParser` was already fixed in Session 2 (required for auth to work at all). The rate limiter itself was still after routes; moved it to run right after `cookieParser`, before `routes`. Verified at runtime (not just by reading the code): hit `/auth/me` and confirmed the response now carries `x-ratelimit-remaining: 999` - proof the limiter middleware is actually executing before the route handles the request, which was never possible in the old order.

**Also restored (not requested, but required for the project to build at all):**
- [x] `client/src/assets/` (the whole folder - local images used via `import`, ~35MB) was missing from the uploaded zip. Unlike the 4 videos (referenced as plain public-folder string paths, so they fail silently at runtime without breaking the build), these are real JS `import` statements, so Vite can't build at all without them - confirmed via a real failed build (`Could not resolve "../assets/index"`) before doing anything about it. Restored from the still-intact Session 1 sandbox extraction, then rebuilt to confirm the fix (`✓ built`). The 4 missing videos were confirmed already absent as far back as the Session 1 upload too, so those remain on the known/tracked list below, unchanged - restoring the images doesn't touch that separate item.

**Explicitly still out of scope** (unchanged from before, still not touched):
- 4 missing video files in `public/ProjectVideos/`
- Missing `nodemon` dependency (`npm start` fails)
- Image/bundle size optimization (same warning as always - unoptimized personal photos, only one route code-split)
- `/404` route doesn't exist (wildcard redirect target is itself unmatched)
- ESLint cleanup (pre-existing prop-types/unused-import patterns)

### Session 5 — 7 tracked flaws, all fixed and individually verified

Worked through the user's list of 7 items in order of increasing risk: contained backend fixes first, then frontend, then the two real dependency-version upgrades last, each verified before moving to the next.

**1. Duplicate `cn()` utility** - `utils/cn.js` vs `lib/utils.js`
- [x] Found all 10 consumers of the old `utils/cn.js` (all in `components/ui/*` plus `Floating_Nav.jsx`/`Background_Boxes.jsx`), redirected them to the canonical `@/lib/utils` (the shadcn-CLI convention this project's own `components.json` already specifies), then deleted `utils/cn.js`. Confirmed `App.css`'s side-effect import (the one odd thing `utils/cn.js` was also doing) is already loaded independently via `App.jsx`, so nothing was lost. Verified: zero remaining references anywhere, full build passes.

**2. Hardcoded production API URL in `axios.js`**
- [x] Replaced the hardcoded-URL-with-commented-alternative pattern with `import.meta.env.VITE_API_BASE_URL`, defaulting to the production URL so the live deployment needs zero config changes. Documented `VITE_API_BASE_URL` in `client/.env.example` alongside the existing `VITE_GOOGLE_CLIENT_ID`. This is what the repeated "update BASE_URL" commits in the project history were manually working around each time.

**3. Wrong HTTP status codes** - across `userController.js`, `projectController.js`, `contactController.js`
- [x] Corrected every catch-all handler that was returning 401/404 for genuine server-side errors to 500. Fixed `registerUser`'s "already exists" case from 401 -> 409 (Conflict is the correct code for that, not Unauthorized). Went further where it mattered: added explicit `error.name === 'ValidationError'` checks so a genuine bad-input case (e.g. an invalid `status` value now that `runValidators` is on - see #4) correctly returns 400, not 500 - a request's fault vs. the server's fault are now actually distinguished, not just uniformly reassigned. Left the already-correct ones alone (login's 401 for bad credentials, 404 for "not found", `getCurrentUser`'s existing 500).

**4. `findByIdAndUpdate` skipping `runValidators`**
- [x] Before touching this, traced the actual call sites (`Meteor_AssignedProject.jsx`, `Meteor_Box.jsx`) to confirm the frontend only ever sends the literal string `"observed"` - which matches the enum exactly, so turning on validation cannot break the existing admin toggle feature. Added `runValidators: true` to both `findByIdAndUpdate` calls (project and contact). Paired with the ValidationError handling from #3 so an actually-invalid value now gets a clean 400 instead of silently succeeding.

**5. Multer: no size/MIME limits, no temp-file cleanup**
- [x] Added a 10MB file-size limit and a `fileFilter` restricting uploads to `application/pdf` (matching the Cloudinary call downstream, which already hardcodes `format: 'pdf'` - this closes the gap between what's accepted and what's assumed). Since there's no global Express error handler in this app, wrapped `upload.single('file')` in a small `uploadSingle` middleware so multer's own errors come back as clean JSON instead of Express's default HTML error page. Added `fs.unlink` in a `finally` block in `newProject` so the local temp file multer writes is always cleaned up, success or failure. Verified all of this at runtime: a non-PDF upload and an 11MB upload both now return clean JSON 400s instead of crashing or hanging.

**6. 3 moderate npm vulnerabilities** (prismjs / react-syntax-highlighter)
- [x] Checked usage first: `react-syntax-highlighter` is used in exactly one place (`code_block.jsx`), via `Prism` and `atomDark` imports and a small set of long-stable props. Confirmed via the library's own GitHub release notes that the v16 "breaking change" warning refers specifically to an internal `refractor` dependency bump, not the public component API. Upgraded to `^16.1.1`, then verified directly (not just via changelog-reading) that the exact imports `code_block.jsx` uses still resolve to the right types, and that the full production build still succeeds. `npm audit`: 0 vulnerabilities.

**7. NextUI packages deprecated in favor of HeroUI**
- [x] The riskiest item this session, handled with real care. Confirmed no `NextUIProvider` is used anywhere (so no provider-migration step needed) and that only `Input`, `Textarea`, and `Accordion`/`AccordionItem` are actually consumed, across 4 files.
- **Important finding along the way:** HeroUI has since released a v3, which is a ground-up rewrite - drops Framer Motion entirely, requires React 19+ and Tailwind v4, removes the provider, changes the component API to a compound pattern. This project runs React 18, Tailwind v3, and framer-motion across 12 files, so v3 was never the right target - installing "latest" (as a bare `npm i @heroui/react` would have done) would have silently pulled v3 and broken the whole animation layer. Migrated to HeroUI **v2** instead - the actual safe, API-compatible rename NextUI became, confirmed via HeroUI's own docs and a real npm registry search: "The functionality and API of all components remain the same - only the package names and imports have changed."
- Even within v2, found a second landmine: the newest v2.x patch releases of `@heroui/theme` (2.4.18+) already require Tailwind v4 as a peer dependency, which `npm install` correctly refused to resolve (ERESOLVE). Rather than force past that warning, binary-searched the actual npm registry to find `@heroui/theme@2.4.17` as the last Tailwind-v3-compatible release, then found the exact matching versions of the other 4 packages that were built against that same theme version (`@heroui/react@2.7.11`, `@heroui/system@2.4.18`, `@heroui/input@2.4.20`, `@heroui/accordion@2.2.19`) - not just "some version that installs," but a verified-coherent set, pinned exactly (no `^`) so a future `npm update` can't silently drift back onto the v4-requiring line.
- Updated the 4 consumer files' imports, plus `tailwind.config.js`'s plugin import and `nextui()` -> `heroui()` call. Verified: clean install (no ERESOLVE), full production build succeeds, generated CSS bundle grew appropriately (~311KB -> ~331KB, consistent with the theme plugin actually running), `npm audit` still 0 vulnerabilities, and a full lint diff confirmed zero new issues introduced (every remaining lint warning traces to a line this session never touched).

**Found along the way, not on the original list - disclosed and handled separately, not silently bundled in:**
- `npm audit` had only ever been run on the **client** (Session 1) - never the server. Running it now surfaced 18 vulnerabilities, including 3 critical (`form-data`, `mongoose`, `tar`).
  - [x] Applied `npm audit fix` (no `--force`) - resolved 15 of 18 via non-breaking bumps. Verified: full syntax check clean, bcrypt hash/compare still correct.
  - [x] The remaining 3 all trace to one chain: `tar` (vulnerable) <- `@mapbox/node-pre-gyp` <- `bcrypt`. Researched before acting: bcrypt v6's actual change is removing `node-pre-gyp` entirely in favor of `prebuildify` (a different native-binary packaging approach) - this is *why* upgrading eliminates the vulnerable chain rather than patching around it. The hash format and `hash()`/`compare()` API are unchanged. Verified thoroughly given how central this is to the whole auth system built over the last 4 sessions: confirmed v6 correctly hashes and compares passwords, confirmed it can still read a hash in the older format (backward compatibility for any existing accounts), and ran the actual `registerUser` controller through the real Express app to confirm `bcrypt.hash()` executes correctly inside the real code path, not just in isolation. `npm audit` on the server: 0 vulnerabilities (down from 18).

**Explicitly still out of scope** (unchanged - not touched this session either):
- 4 missing video files in `public/ProjectVideos/`
- Missing `nodemon` dependency (`npm start` fails)
- Image/bundle size optimization
- `/404` route doesn't exist (wildcard redirect target is itself unmatched)
- ESLint cleanup (pre-existing prop-types/unused-import patterns - confirmed again this session that nothing new was added to this pile)

### Session 6 — 6 tracked items: 3 already fixed (verified, not redone), 3 genuinely new

Before touching anything, checked the actual current state of all 6 against the sandbox - several of these read as duplicates of earlier sessions' work, and I didn't want to either waste effort redoing something already done or, worse, assume something was fixed when it wasn't.

**Already fixed in earlier sessions - verified again here, no changes made:**
- **Item 2** (`/project/checkStatus`, `/contact/checkConnection` unauthenticated) - this was the centerpiece of Session 2's admin-protection work. Confirmed both routes still carry `verifyToken,requireAdmin`.
- **Item 6** (`runValidators` missing) - this was literally the previous session (Session 5). Confirmed `runValidators: true` is present on both `findByIdAndUpdate` calls.
- **Item 4, backend half** (`req.file.originalname` read before the null check) - fixed in Session 4. Confirmed the check still runs first, outside and before the try block.

**Genuinely new work this session:**

**1. No SEO/meta tags**
- [x] `index.html`: proper `<title>`, meta description, `theme-color`, canonical link (pointing at the custom domain, `www.rajrishav.co.in`, since the CORS config lists both that and the `.vercel.app` deployment URL - canonical tells search engines which one is authoritative), full Open Graph set (title/description/type/url/image/site_name), and Twitter Card tags.
- [x] Added `robots.txt` (allow all, points to the sitemap) and a `sitemap.xml` covering the genuinely public content routes - deliberately left out `/admin/*` (private) and the mobile-only concatenated `/highlights`/`/services` views (they duplicate content already covered by the desktop-oriented pages, so including both risks looking like duplicate content to a crawler).
- Note: this covers the static, site-wide tags the flaw actually named. Per-route dynamic meta tags (a different `<title>`/description per page) would need something like `react-helmet-async` - a separate, larger addition not implied by what was asked, so left alone.
- Used the actual custom domain and X handle for these tags rather than leaving them generic - worth a quick check that both are still current before this goes live.

**3. Cookie `maxAge` (~986 years)**
- [x] Was `360000 * 24 * 60 * 60 * 1000` in three places (register, login, and Google auth - the Google one didn't exist yet when this bug was first flagged). Replaced all three with one shared `COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000` constant, matching the JWT's own `expiresIn: "1y"` so neither the cookie nor the token outlives the other. Verified against the actual HTTP response, not just the constant in isolation: the real `Set-Cookie` header now shows `Max-Age=31536000` and an `Expires` date exactly one year out.

**4. `ProjectForm.jsx`, frontend half - submit button ignores file selection**
- [x] The validity check lived inline inside `handleChange`, so it only ever recomputed on a keystroke and had no way to react to file selection at all (a separate prop). Extracted it into a `useEffect` watching `[enteredValue, file]`, and added the missing `isFileValid` check. This also gave the file's already-imported-but-unused `useEffect` an actual job - confirmed via lint that it's no longer flagged unused, and no `exhaustive-deps` warning fired, meaning the dependency array is complete.

**5. Axios interceptor swallows network errors as `undefined`**
- [x] `Promise.reject(error.response && error.response.data)` produced `undefined` on any request with no response at all (e.g. a network failure) - the exact scenario this app's own Render-cold-start keep-alive hack in `index.js` exists to reduce. Any catch block doing `toast.error(error.message)` without optional chaining (both `ContactForm.jsx` and `ProjectForm.jsx` do this) would then throw a second, uncaught error trying to read `.message` off `undefined`. Fixed at the source instead of patching every consumer: the interceptor now always rejects with an object that has a `.message`, falling back to a clear "Network error" message when there's no server response to read from. This one change covers every current and future consumer of the shared axios instance.

**Verification this session:** full client build (meta tags and `robots.txt`/`sitemap.xml` confirmed present in `dist/`), lint diff on every touched file (net *improvement* - one less pre-existing issue, zero new ones), backend syntax check, and a real HTTP request/response round-trip confirming the actual `Set-Cookie` header rather than just trusting the constant.

**Explicitly still out of scope** (unchanged - not touched this session):
- 4 missing video files in `public/ProjectVideos/`
- Missing `nodemon` dependency (`npm start` fails)
- Image/bundle size optimization
- `/404` route doesn't exist (wildcard redirect target is itself unmatched)
- ESLint cleanup (pre-existing prop-types/unused-import patterns)
- Per-route dynamic meta tags (would need `react-helmet-async` or similar - a separate addition, not part of the static-tags gap that was actually flagged)

### Session 7 — ESLint cleanup, mechanical pass: 281 → 190 problems

**Correction before starting:** the out-of-scope list above (carried since Session 4) says the `/404` route doesn't exist. Checked the actual code before touching anything, per the same rule Session 6 used - it's already fixed. `routes/index.jsx` has both a real `{path:'404', element:<NotFoundPage/>}` route and a wildcard `*` redirecting to it, and `NotFoundPage.jsx` is a working page (its own comment references the old bug). Someone fixed this outside of a tracked session, or a prior session's fix never got logged here. Either way, the doc was stale - removing it from the list below rather than re-doing finished work.

**The 281 problems break down into 8 rule types**, not one undifferentiated pile:

| Rule | Count | This session |
|---|---|---|
| `react/prop-types` | 173 | Left - see below |
| `no-unused-vars` | 78 | Fixed |
| `react-hooks/exhaustive-deps` | 12 | Left - see below |
| `no-undef` | 6 | Fixed |
| `react/no-unescaped-entities` | 5 | Fixed |
| `react/no-unknown-property` | 4 | Left - see below |
| `react-refresh/only-export-components` | 2 | Left - see below |
| `react/display-name` | 1 | Fixed |

Fixed the 90 mechanical/zero-behavior-change issues (91 errors actually cleared - removing one dead prop happened to also drop a now-moot prop-types flag on it). Left the other ~190 alone deliberately: `prop-types` needs an actual shape written per component (173 of them - a separate pass, not a mechanical sweep), `exhaustive-deps` needs per-hook judgement about whether adding the missing dependency is safe or would cause a re-render loop, `no-unknown-property` is very likely a false-positive on React-Three-Fiber's custom JSX props (`args`/`object`/`attach`) rather than a real bug and needs confirming before touching, and `only-export-components` would mean moving code between files. None of those are "fix and verify," they're "decide something first."

**What got fixed:**
- **`no-unused-vars` (78 → 0):** 53 of these were the same pattern - `import React from 'react'` left over from before this project's JSX runtime stopped requiring it. The rest were genuinely dead imports/variables, checked individually rather than swept with a regex:
  - `File_upload.jsx`: `files` looked used (`setFiles(files)`), but that reads a same-named parameter on `handleFileUpload(files)` that shadows the outer state - the state's own value is never actually read. Changed to `const [, setFiles] = useState([])` rather than deleting the state, since `setFiles` is genuinely used.
  - `float_dock.jsx`: `open`/`setOpen` state removed - its only consumer was a `<button>` already commented out in the JSX (the mobile dock's collapse toggle is currently disabled). Flagging this rather than assuming: if that toggle should come back, it needs the button un-commented and this state restored, not left as dead code.
  - `TimeLineData.jsx`: `topRef` prop removed from `TimelineDemo`'s signature - confirmed its one caller (`Main.jsx`) never passes it, so this was never wired up in the first place.
  - `apple_card_carousel.jsx`: `currentIndex` removed from one `useContext` destructure inside `Card` - the same context value is genuinely used elsewhere in the file (the carousel itself), just not inside `Card`.
  - `footer_beams_collision.jsx`: removed the unused `ref` param from `CollisionMechanism`'s `forwardRef` - it was never read in the function body, so forwarding wasn't actually happening either way; removing it changes nothing at runtime.
  - `navLayout/index.jsx`: removed a dead `nextUrl = document.referrer` line - its own trailing comment ("doesn't always work reliably, so:") shows this was already abandoned in favor of the `path`-based check right below it.
  - `tailwind.config.js`: removed two dead `require()`s (`defaultTheme`, `colors`) - confirmed neither is referenced anywhere in the theme config.
- **`no-undef` (6 → 0):** not a code bug - `tailwind.config.js` and `vite.config.js` legitimately use `require`/`__dirname` (they're loaded under Node by Vite/Tailwind's own config loaders), but `eslint.config.js` only ever declared browser globals for every `.js` file including these. Added one override block scoped to `*.config.js` giving those files Node globals, instead of touching the `require`/`__dirname` calls themselves, which would have broken them.
- **`react/no-unescaped-entities` (5 → 0):** stray apostrophes in JSX text (`About.jsx` x2, `hero_paralax.jsx`, `NotFoundPage.jsx` x2) - escaped to `&apos;`.
- **`react/display-name` (1 → 0):** `routes/index.jsx`'s `Loadable` HOC returned an anonymous arrow function. Restructured to return a named `LoadableComponent` function instead - same behavior, but React DevTools and this lint rule both see a real name now.

**Verification:** full lint re-run (`281 → 190 problems`, exactly the 4 left-alone rule types, nothing new introduced), full production build (`✓ built in 40.34s`, same pre-existing bundle-size warning as before, nothing else changed), and every one of the 8 "needs a human decision" cases above was traced to its actual usage (grep + reading the surrounding function) before deciding, not assumed from the lint message alone.

**Explicitly still out of scope:**
- 4 missing video files in `public/ProjectVideos/`
- Missing `nodemon` dependency (`npm start` fails)
- Image/bundle size optimization (`Main` chunk still 1.7MB / ~499KB gzipped, unchanged this session)
- ESLint: `react-hooks/exhaustive-deps` (12), `react/no-unknown-property` (4), `react-refresh/only-export-components` (2) unchanged. `react/prop-types` **in progress, paused mid-way** at 125 of 172 done (see note at the start of Session 8) - not "still 172," and not finished either.
- Per-route dynamic meta tags (`react-helmet-async` or similar)
- The commented-out mobile floating-dock collapse button in `float_dock.jsx` (noted above, not restored)

### Session 8 — Mobile footer height fix (prop-types paused mid-file to handle a live bug report)

**Pausing note, for continuity:** Session 7's `react/prop-types` pass was interrupted here, not abandoned. Done and verified (10 files, 122 issues): `card_reveal_effect.jsx`, `apple_card_carousel.jsx`, `float_dock.jsx`, `ui/footer_beams_collision.jsx`, `hero_paralax.jsx`, `Floating_Nav.jsx`, `Meteor_AssignedProject.jsx`, `Meteor_Box.jsx`, `HighlightDesign.jsx`, `AuthModal.jsx`. Partially done: `Follower_Pointer.jsx` - `FollowerPointerCard` has its `propTypes`, `FollowPointer` (3 issues: likely `x`/`y` motion values + `title`) doesn't yet. Not started: `FeatureComponent.jsx`(5), `code_block.jsx`(5), `card_spotlight.jsx`(4), `HighlightImages.jsx`(3), `ProjectForm.jsx`(3), `AccountMenu.jsx`(3), `separator.jsx`(3), `text-hover-effect.jsx`(3), `Code_Block.jsx`(2), `File_upload.jsx`(2), `InvertedCard.jsx`(2), `box_effect.jsx`(2), `ui/file_upload.jsx`(2), `timeline.jsx`(2), `CustomImages.jsx`(1), `LoadingBar.jsx`(1), `background_boxes.jsx`(1) - 47 issues total remaining, all in `react/prop-types`. `prop-types@15.8.1` was already an indirect dependency (pulled in transitively); it's now a direct one in `package.json` since the codebase actually imports it now.

**The bug (reported with screenshots):** on mobile, the "Gone too far, send me back up" pill in the site footer doesn't sit flush with the bottom of the black footer section - there's a visible gap of empty black background below it. On md+ screens it's flush, as intended.

**Root cause:** in `Footer_BeamsCollision.jsx`, the pill is `absolute bottom-0 right-0`, positioned relative to its nearest `position: relative` ancestor - the mobile content wrapper (`<div className="relative w-full flex flex-col gap-8 ...">`). That wrapper has no explicit height, so it's only as tall as its own content. The actual black section around it (`BackgroundBeamsWithCollision`) is a fixed `h-[91vh]` on mobile (deliberately tall, so the falling-beam animation has room to play) - so the wrapper's real content height and the section's 91vh are two different numbers, and `bottom-0` was anchoring to the shorter one. The desktop grid version doesn't have this problem because its wrapper already sets `h-full` (`<div className="w-full h-full hidden md:flex ...">`), stretching it to match the section exactly.

**Fix:** added `h-full` to the mobile wrapper too, mirroring the desktop wrapper exactly - one class, no layout restructuring. Confirmed via `grep` that `BackgroundBeamsWithCollision`/`BackgroundBeamsWithCollisionDemo` are used identically on every page that renders this footer (`Main.jsx` and 9 other pages), so this fix applies everywhere the footer appears, consistently.

**Verification:** full production build (`✓ built in 48.25s`, no new warnings). Note: this environment has no headless browser available (network is restricted to package registries, not browser-binary CDNs), so this was verified by tracing the exact CSS box-model mechanics against the already-working desktop pattern, not by rendering a screenshot - worth a quick visual confirmation on your end once deployed.

**Not changed, and worth flagging:** the outer section's `h-[91vh]` is a fixed viewport-relative height, not content-driven. It wasn't touched because there's no evidence it's currently a problem (nothing overflows in the reported screenshots) and it wasn't the reported bug - but on an unusually short/landscape mobile viewport, fixed content plus a fixed 91vh could in theory mismatch again in the other direction. Flagging it rather than pre-emptively changing something that isn't confirmed broken.

### Session 9 — New baseline zip, the git-diff mystery, navbar hover bug, GSAP ticker stutter, LoadingBar/LoadingHome merge

**Why this session starts differently:** the zip provided this session (`Portfolio.zip`, with real images, minus videos/`.git`) does not contain any of Sessions 7-8's work - verified by diffing every file against the Session 8 output byte-for-byte. It also has independent changes on the server side that Session 8's copy doesn't (`app.js`'s CORS now properly uses `process.env.FRONTEND_URL` instead of a hardcoded array with it commented out; `userController.js` no longer has the unused `next` param or a bound-but-unused `catch (error)`). Those are real, more current changes, not something to overwrite - so this session's baseline is this zip, and Sessions 7-8's ~63 client-side file changes were re-applied on top of it via `diff`/`patch` (not copied wholesale), so nothing server-side got reverted. All 63 applied cleanly except `package.json`, which needed its one line (the `prop-types` dependency) re-added directly - that one's explained below.

**The git-diff mystery, solved:** comparing every file between this zip and the Session 8 zip byte-for-byte found the actual cause - it's line endings, but not from anything done to the file's content. Two files with 100%-identical text (confirmed via diff after normalizing `\r\n`→`\n`) still showed as fully different, because one copy used CRLF and the other LF for literally every line. Checked broadly: every `.jsx`/`.js` source file here is LF; only `package.json` and `package-lock.json` (client and server) are CRLF. That split is consistent in both zips - so the mismatch you saw wasn't random corruption, it was this session's starting zip and the previous one having been exported with different line-ending handling for the same files, before any editing happened. Going forward, edits in this project preserve whatever line-ending style a file already uses (checked per-file, not assumed) - source files stay LF, `package.json`/`package-lock.json` stay CRLF - so `git status` should now only show files that actually changed.

**Bug 1 - navbar dropdown not closing on hover (fixed):** in `Floating_Nav.jsx`, only `Highlights` and `Services` are wrapped in `MenuItem`, which is what wires `onMouseEnter={() => setActive(item)}` - the mechanism that tells the menu which dropdown to show. `About`, `Contact`, and `Labs` are plain `<button>`s with no connection to that state at all. So hovering Highlights→Services works (both update `active`), but Services→About does nothing to `active`, leaving Services' dropdown rendered. Fixed by adding `onMouseEnter={() => setActive(null)}` to About/Contact/Labs (and the two admin-only nav buttons, for the same latent reason, though it wasn't user-visible there since admins don't see Highlights/Services at all).

**Bug 2 - GSAP ticker stutter in About and both Service pages (fixed):** all three (`About.jsx` x2 carousels, `Design_Service.jsx`, `Develop_Service.jsx`) used the same pattern - a GSAP timeline moves the strip by exactly one image's width, and when that tween completes, an `onComplete` callback synchronously clones a DOM node, inserts it, removes the original, and repositions via `gsap.set()`, before the timeline (`repeat: -1`) restarts. That synchronous DOM/layout work at every single loop boundary is the "stuck for a moment, then moves" pattern - it's not a timing number to tune, it's DOM work blocking the animation at a fixed, repeating point.

Fixed by switching to the standard seamless-loop technique: render the strip's content twice back-to-back (`CustomImages.jsx` now maps `[...images, ...images]`, one change that fixes all four ticker instances since they all share this component), then animate with a single continuous tween to `xPercent: -50` (or `fromTo(-50, 0)` for the two that move the opposite direction) with `repeat: -1` and no `onComplete` at all. Since the content is duplicated, the visual at the halfway point is pixel-identical to the start, so the repeat loops with zero DOM work - nothing to stutter on. Each tween's `duration` is set to `(item count) × 5` to preserve the original per-image pace (5s/image) rather than changing how fast anything looks. Directions were preserved exactly as they were (nobody asked to change which way each one scrolls, only to stop the stutter).

This introduced 4 new `react-hooks/exhaustive-deps` warnings (the image-list constants were defined inside the component body, so a mount-only effect reading `.length` off them got flagged) - fixed properly rather than suppressed, by moving those constants to module scope in all three files, where they belong anyway since they're static data that doesn't depend on props or state. Net result: 0 new lint issues from this fix.

**LoadingBar / LoadingHome duplication (merged):** confirmed both rendered identical markup, differing only in how visibility was controlled - `LoadingBar` took an explicit `loading` prop, `LoadingHome` had none and was used purely as a `<Suspense fallback>`. Merged by giving `LoadingBar` a default `loading = true`: passed a prop, it behaves exactly as before (`navLayout/index.jsx`'s usage is unchanged); passed no props (as a Suspense fallback), it now behaves exactly like the old `LoadingHome` did. `routes/index.jsx` now imports `LoadingBar` instead, `LoadingHome.jsx` is deleted, and nothing else referenced it.

**Verification:** full production build succeeds (`✓ built in 25.59s`), lint at `66 problems (51 errors, 15 warnings)` - a net improvement (one fewer prop-types issue than the pre-session baseline, and confirmed zero regressions from any of the three fixes above).

**Explicitly still out of scope:** the 4 missing project videos, `nodemon`, bundle size, the remaining ESLint categories (`react/prop-types` at 125+ of 172 done - exact resume point below, `react-hooks/exhaustive-deps` 12, `react/no-unknown-property` 4, `react-refresh/only-export-components` 2), per-route meta tags, the commented-out mobile dock toggle, and the `h-[91vh]` fixed-height note from Session 8.

**Prop-types resume point (unchanged from Session 8, still accurate):** done (10 files, 122 issues): `card_reveal_effect.jsx`, `apple_card_carousel.jsx`, `float_dock.jsx`, `ui/footer_beams_collision.jsx`, `hero_paralax.jsx`, `Floating_Nav.jsx`, `Meteor_AssignedProject.jsx`, `Meteor_Box.jsx`, `HighlightDesign.jsx`, `AuthModal.jsx`. Partial: `Follower_Pointer.jsx` (`FollowerPointerCard` done, `FollowPointer` isn't). Not started (17 files, ~47 issues): `FeatureComponent.jsx`, `code_block.jsx`, `card_spotlight.jsx`, `HighlightImages.jsx`, `ProjectForm.jsx`, `AccountMenu.jsx`, `separator.jsx`, `text-hover-effect.jsx`, `Code_Block.jsx`, `File_upload.jsx`, `InvertedCard.jsx`, `box_effect.jsx`, `ui/file_upload.jsx`, `timeline.jsx`, `CustomImages.jsx` (now also needs the `images` prop it always had), `background_boxes.jsx` - plus `LoadingBar.jsx`'s new `loading` prop.

**Found but not touched (flagging only, per how this project's sessions handle out-of-scope discoveries):** `CustomImages` is also called in `Design_Service.jsx` and `Develop_Service.jsx` with `img1`...`img8` props (a leftover from before it took an `images` array) - that call renders nothing, since the component only reads `images`. Not fixed since it wasn't reported and isn't related to what was asked this session.

### Session 10 — The Session 9 ticker fix wasn't actually finished: real root cause was image weight, not animation code

**What was reported:** after Session 9's fix, the Skills/Web3 tickers (About.jsx) scroll smoothly, but the project-screenshot ticker (same `ProjectImages`/`DevelopImages` list, shared by `Design_Service.jsx` and `Develop_Service.jsx`) goes completely empty for 2-3 seconds once per loop, confirmed by screenshots.

**Why the animation logic wasn't actually the problem this time:** Session 9's fix (duplicate content + one continuous `xPercent` tween, no per-loop DOM work) is the correct technique and it's still in place - that part wasn't wrong. The gap was never a GSAP timing issue; it was three of this ticker's twelve images being enormously heavier than the rest, checked directly against the files on disk rather than assumed:

| Image | Before | Format | Used elsewhere at full size? |
|---|---|---|---|
| `Project1_i.png` | 1205 KB (1900x857) | PNG, unnecessary alpha channel | Yes - `Contact.jsx`, `Floating_Nav.jsx` |
| `Project2.png` | 1450 KB (1908x860) | PNG, unnecessary alpha channel | Yes - `HeroParalax.jsx`, `TimeLineData.jsx`, `Carousel.jsx` |
| `GemX_logo.png` | 1916 KB (2570x2570) | PNG, unnecessary alpha channel | Yes - `Mern_Highlights.jsx` |

Every other image in this ticker is a properly-compressed JPEG in the 50-125 KB range - these three were raw/uncompressed PNG exports, 15-40x heavier than their neighbors, for a slot that renders at 240px wide. That weight is exactly consistent with the reported symptom: a stall precisely where the loop reaches whichever of these three hasn't finished decoding yet, not a stall at a fixed, predictable interval.

**Fix - new assets, not edited-in-place ones:** all three are used elsewhere in the app at a size where the original resolution is actually warranted (a parallax hero image, a highlight card, a contact-page image) - resizing those originals down would have fixed this ticker by degrading three other sections that weren't reported as broken. Instead, created ticker-specific copies sized for how this ticker actually displays them (640px wide, JPEG quality 82, alpha channel dropped since none of the three need transparency here): `Project1_i_ticker.jpg` (20 KB), `Project2_ticker.jpg` (30 KB), `GemX_logo_ticker.jpg` (71 KB) - all in `src/assets/Images/`, alongside the originals. `assets/index.js` now exports these three as additional named entries; `ProjectImages`/`DevelopImages` reference the `_ticker` versions, everything else keeps using the originals unchanged. Checked every other image referenced by all four tickers against this same size bar - nothing else came close (largest remaining is 124 KB).

**Also added, as a safeguard rather than a fix for a separately-confirmed bug:** a small shared helper, `src/utils/waitForImages.js`, that each ticker's effect now awaits before starting its GSAP tween - so a loop only ever starts once every image (both copies) has actually finished loading. This doesn't change anything when images are already small and fast (as they are now), but it means a future oversized image, or just a slow connection, produces a brief delay before the ticker starts rather than a stall in the middle of it.

**Verification:** production build passes, lint unchanged at 66 problems (0 new issues from either change). Same honest limitation as Session 8's footer fix applies - this sandbox has no headless browser, so this is confirmed by tracing the actual file weights and the DOM-load timing involved, not by watching the ticker render. The direct fix (three much smaller files replacing three oversized ones) is the part that should matter regardless; the `waitForImages` change is defense-in-depth on top of that.

### Session 11 — Session 10 was wrong: real root cause was a CSS sizing bug, not image weight

**Correctly rejected:** the symptom persisted after Session 10's image compression, which on its own proves image weight was never the actual cause - fixed, right call. Went back into the layout/animation code itself instead of the assets.

**What's actually in `CustomImages.jsx`** (shared by all four tickers): each image sits in a wrapper `<div className='h-full w-full ...'>` - `w-full` (`width: 100%`) with no `flex-shrink-0`, inside `carousel`, a flex row with no explicit width of its own (sized by its content). A percentage width resolving against a flex container whose *own* size is itself determined by its content is genuinely ambiguous in the CSS spec, not a matter of opinion - and ambiguous resolution is exactly the kind of thing that behaves inconsistently depending on exactly when/how a browser resolves it, which fits "usually fine, occasionally half-empty" far better than a fixed, wrong-but-consistent number would.

This sandbox still has no headless browser (confirmed again this session - `apt-get install chromium` pulls a snap-only stub package with no real binary behind it on this Ubuntu version, and Playwright's/Puppeteer's browser downloads are on hosts this network blocks by design). Rather than reason about the CSS spec in the abstract a second time, built the exact same node tree (root row → `carousel` → 24 `width:100%`/no-shrink children → fixed-240px `<img>`) in `yoga-layout`, the real flexbox engine React Native ships - not a guess about browser behavior, an actual layout computation:

- **As it was** (`w-full`, default shrink): each of the 24 slots computed to **1200px** wide instead of 240px - `carousel`'s total came out to 29,444px instead of the correct 6,404px.
- **Fixed** (`w-60` fixed width, `flex-shrink-0`): every slot computes to exactly 240px, gaps exactly 28px, `carousel` total exactly 6,404px - matches hand arithmetic (24×240 + 23×28) exactly.

Yoga isn't Chrome, so the specific "1200px" figure may not be the exact number a real browser lands on - but it concretely demonstrates that the old CSS has more than one legitimate resolution, and the new CSS has exactly one. That's the actual bug: not a timing issue, an under-specified layout that any given browser is free to resolve inconsistently.

**Two changes, addressing both ends of the same ambiguity:**
1. `CustomImages.jsx`: wrapper div changed from `w-full` (percentage, shrinkable) to `w-60 flex-shrink-0` (fixed width matching the image, non-shrinkable) - the box model is now fully determined by fixed numbers, nothing left for a browser to interpret.
2. All four ticker effects (`About.jsx` x2, `Design_Service.jsx`, `Develop_Service.jsx`): replaced `xPercent: -50` / `fromTo({xPercent:-50},{xPercent:0})` with a directly-measured pixel value - `const halfWidth = carousel.scrollWidth / 2`, then animate `x: -halfWidth` (or `fromTo({x:-halfWidth},{x:0})`). `scrollWidth` is a plain DOM read of whatever the browser actually, finally rendered - it can't be ambiguous the way asking GSAP to interpret "-50%" against a content-sized element can. Measurement now happens after `waitForImages()` resolves *and* two nested `requestAnimationFrame` callbacks, so it reads post-layout, not mid-layout.

**Reverted, per instruction:** Session 10's three compressed ticker-only images (`Project1_i_ticker.jpg`, `Project2_ticker.jpg`, `GemX_logo_ticker.jpg`) are removed, along with their imports/exports in `assets/index.js`. `ProjectImages`/`DevelopImages` point back at the original full-resolution `Project1_i`/`Project2`/`GemX_Logo`. Safe to revert without reopening the bug, since the fix above doesn't depend on image size at all - confirmed with a fresh build+lint after reverting, identical result to before.

**Verification:** production build passes, lint unchanged at 66 problems, zero new issues. The Yoga computation is real, reproducible evidence of the CSS ambiguity, which is a meaningfully stronger form of verification than Sessions 8/10's "traced the mechanics carefully" - it's the same category of confirmation a real browser test would give, just via a different (available) layout engine rather than an unavailable one.

### Session 12 — Session 11's fix still overshot; a real screen recording pinned down why

**Session 11 wasn't actually right either.** Its `xPercent`→`scrollWidth/2` fix addressed a real, Yoga-confirmed CSS ambiguity, but "half of the doubled content's scrollWidth" is still an *inferred* number - it assumes the two copies measured out to exactly symmetric halves, which is an assumption, not a measurement. This session came with an actual screen recording, which made it possible to check that assumption directly instead of reasoning about it a third time.

**What the recording showed, frame by frame:** real content scrolls correctly and steadily for the first stretch, reaches the last image, and then - rather than the next (identical, duplicated) image continuing immediately - a black gap opens where content should be, and keeps *growing* for 8+ seconds before the clip ends. That growth pattern rules out a loop-boundary timing blip (Session 8/10's category of bug): the animation's own motion never stutters, it just keeps travelling *past* where the real content actually ends, because its target distance (`scrollWidth / 2`) was larger than where the second copy actually starts.

**Root cause:** inferring "one copy's width" from the *total* doubled width and dividing by two is fragile in a way measuring it directly isn't - if anything makes the two rendered copies not perfectly symmetric (and there's no guarantee they are, even with identical source data, given how many layout properties are in play), the halfway point stops lining up with the real seam, and GSAP faithfully animates to the wrong number.

**Fix - stopped inferring the distance, started measuring it:** `CustomImages.jsx` now marks the first element of the second copy with a ref (`copyStartRef`) instead of leaving both copies anonymous. Each ticker's effect reads that element's real `getBoundingClientRect().left` and subtracts the carousel's own left edge - the result is the exact on-screen distance from where copy 1 starts to where copy 2 starts, measured, not derived from a total. Caught one mistake before shipping it: an earlier draft of this fix marked the *last* element of copy 1 instead of the *first* element of copy 2, which is off by exactly one `gap-7` (28px) - measuring right-edge-to-left-edge would need that gap added back in by hand, which is itself an assumption. Verified both the mistake and the fix numerically in `yoga-layout` before settling on left-edge-to-left-edge specifically because it needs zero knowledge of gap size to be exact: 3216px either way you compute it (12 x 240 + 12 x 28), confirmed to the pixel.

**Verification:** full build passes, lint at 67 (+1, expected - `CustomImages` now takes a second prop, `copyStartRef`, added to the same already-tracked, already-paused prop-types list rather than fixed here). The distance computation itself is now checked against a real layout engine to the exact pixel, which is a stronger form of verification than Session 11 had, precisely because Session 11's number was never actually checked against anything - it was assumed correct because it seemed like it should be.

### Session 13 — New baseline (Portfolio_2.zip), Develop ticker resize bug, FeatureComponent key + anchor bug, first session verified in a real browser

**Starting point:** `Portfolio_2.zip` is the new baseline. It carries the user's own changes (auto-scrolling image tickers in Develop, Design and About; the Video section removed because the videos made the zip too large; `docs/` added with the CMS plan and a UI issues report). The whole project was re-read first and a clean install, build and lint were run in a scratch copy: build passes, lint 70 (Session 12 counted 67). The Session 11-12 notes above describe an older ticker (`copyStartRef` and `waitForImages.js` are gone from the code); the current state is described in this entry.

**CMS status - needs a user answer before CMS work starts:** `docs/CMS_INTEGRATION_PLAN.md` marks Categories 1-2 as done, but none of that code is in this zip (no `studio/`, no `client/src/utils/sanityClient.js`, no `server/src/config/sanity.js`, no Sanity keys in `server/.env`; "sanity" appears only in the plan itself). Either the user has those files locally and should add them to the next zip, or Categories 1-2 have to be redone first.

**A real browser works now (corrects Sessions 8-12, which said there is none):** the Chromium binary ships inside the `@sparticuz/chromium` npm package, so the allowed registry is enough. The scripts and the notes that cost time to find out (servers die between tool calls, GSAP clock injection, animated rows, the `pkill -f` pitfall) are saved in `docs/browser-tests/` - read its README before testing anything visual.

**Bug 1 - Develop ticker measured its loop length once (fixed):** `Develop_Service.jsx` read copy 1's width a single time on mount and baked it into the tween. The images change width at breakpoints (180 / 200 / 280 / 300px at <640 / 640 / 1024 / 1280), so after a resize, browser zoom or tablet rotation the loop length was stale. Measured in Chrome before the fix, the strip jumped sideways at every loop wrap by exactly the stale distance: 240px (lg to xl), 960px (iPad portrait to landscape), 1048px (xl to phone), 1440px (phone to xl, almost five images). With no resize it was seamless, so the Session 12 measuring approach itself was sound. Separately, the gap at the seam was 20px (`pr-5`) against 28px between images (`gap-7`); About and Design already used `pr-7`.

**Fix:** the effect now measures copy 1's width in a `buildLoop()` function and runs it on mount and from a `ResizeObserver` on that element. When the width changed it kills the tween, builds a new one (`fromTo` 0 to -width, same 50 px/s) and restores the old progress fraction, so the strip keeps its place in the loop instead of jumping. `gsap.context` and the redundant `wrap` modifier are gone (a 0 to -width tween that repeats never leaves that range); cleanup disconnects the observer and kills the tween. Both copies changed `pr-5` to `pr-7`.

**Bug 2 - FeatureComponent, key warning + page reload on click (fixed):** (a) `key` sat on the inner `<div>` while the outermost element of each `.map` callback was a fragment, so React warned "Each child in a list should have a unique key" on the Develop and Design pages. The fragment was pointless; it is removed and `key` is on the row `div`. (b) Every row was `<a href="">`. An empty href navigates to the current URL, so clicking a row reloaded the whole page (confirmed: page state wiped; 10 such anchors on the Develop page). These rows have no destination, so the anchor was removed instead of being neutralised with `preventDefault` or `href="#"` (which would leave a focusable link that does nothing). Visible side effect: the pointer cursor over a row is now the normal text cursor; the hover grow and separator animation is unchanged (pure CSS on the row).

**Verification (all in real Chrome 153, before vs after):**
- Ticker, every frame of a full loop sampled: steady lg control seamless before and after; lg to xl 240px jump to none; iPad rotation 960px to none; phone to xl 1440px to none; xl to phone 1048px to none; 5 rapid resizes 240px to none. Seam gap 20px to 28px at every width. Loop position kept across a resize (e.g. 0.1353 to 0.1353; before the fix it shifted to 0.1273). No blank strip at either edge, speed exactly 50 px/s throughout, no console errors.
- React dev mode with StrictMode: exactly one tween on the strip after the double mount and after each resize; the global GSAP tween count goes 1 to 0 when leaving the page and back to 1 on return (no leak).
- FeatureComponent: key warning 1 to 0 on Develop and Design; 0 empty-href anchors left; clicking a row no longer navigates or wipes page state. Against the baseline build, row geometry (row box, inline content box, text) is identical for all 6 lists on 4 pages and settled screenshots show 0 differing pixels.
- Production build passes; lint unchanged at 70, rule by rule; `diff -r` against the zip shows only `Develop_Service.jsx`, `FeatureComponent.jsx`, this README and the new `docs/browser-tests/`. Both source files keep LF endings and no trailing newline, exactly as in the zip.
- Not browser-tested this session: the About and Design tickers (read only; About keeps its position across a resize, Design restarts its loop from the start on every resize).

**Found, not touched (need a go-ahead):**
1. `Mern_Highlights.jsx` and `Pern_Highlights.jsx` tech-stack lists have the same fragment-around-keyed-div pattern (one key warning each; those rows are real links, so only the key applies). CMS Category 6 replaces both files with the generic template, so fixing them first may be wasted effort.
2. React warns on every page: "forwardRef render functions accept exactly two parameters" - some UI component declares `forwardRef` with a one-argument render function; the source has not been tracked down yet.
3. `Rishav2.jpg` and `Rishav4.jpg` (about 7.4MB together) are not referenced anywhere; they can be skipped in the CMS media migration.
4. The build prints CSS syntax warnings that appear to come from the HeroUI Tailwind plugin. They do not fail the build; not known whether they predate Portfolio_2.
5. `server/.env` holds real secrets and is inside the zip (gitignored, so git is safe); consider leaving it out of zips you share.
6. About, Design and Develop each have their own ticker implementation. A single shared hook is an option once the CMS work is done.

**Prop-types resume point:** unchanged from Session 8/9.

**Next:** the user answers the `studio/` question above, then CMS Category 1, one category at a time, reporting before the next.

### Session 14 — CMS Category 1 (Infrastructure & Wiring): Studio scaffold, browser client, env contract

**Plan status reset:** `docs/CMS_INTEGRATION_PLAN.md` had marked Categories 1-2 as done for code that was never in the project (no `studio/`, no `sanityClient.js`, no schemas). Both were restarted from scratch and Category 2's statuses are back to not started. The plan now opens with *Architecture decisions* (11, settled from reading the client, the server and the SDK) that every later category follows - read them before touching CMS code.

**Decisions that changed the plan, and why:**
- **No Sanity client on the Express server (task 1.3 removed).** The server's `project` API is the "assign a project" intake (a visitor's request and PDF, stored in MongoDB/Cloudinary): personal data that stays there, not portfolio content. Nothing on the server reads or writes editorial content, and an Editor-access token on an internet-facing server would be the most damaging credential in the system for no benefit. The seed script (Category 5) gets its write token from `studio/.env` on the owner's machine.
- **Content is read browser to Sanity's CDN directly**, never through the Render free-tier server (cold starts; it already self-pings every 14 minutes to stay awake).
- **The official SDK is loaded lazily behind `fetchSanity()`.** Measured: `@sanity/client` is 40 KB gzipped, about +8 % on the 494 KB main chunk. The lazy design costs 4.4 KB on the critical path and downloads the SDK on first use. Consumers only ever see `fetchSanity` and `urlFor`, never the SDK.
- **`autoUpdates: false`** in the Studio's CLI config: with it on, `sanity build` needs Sanity's API (fails offline) and the deployed Studio floats to whatever version Sanity serves; off means exactly what `package-lock.json` pins.

**Built:**
- `studio/` - Sanity Studio v6 as its own app (React 19, Node >= 22.12; the website is React 18) with a lockfile, an `env.js` shared by `sanity.cli.js` and `sanity.config.js` that stops with a readable message when the project id is missing or still the placeholder, an empty `schemaTypes/` ready for Category 2, a `.gitignore` for `.env*`, and a README with the owner's setup checklist.
- `client/src/utils/sanityClient.js` - exports `isSanityConfigured`, `fetchSanity(query, params, { signal })` and `urlFor(image)`. Never throws at import and requests nothing until used; published perspective, CDN, 10 s timeout, API version pinned to `2026-05-04` (the one Studio 6.17 itself uses, so GROQ tried in Vision behaves the same). `urlFor` returns `null` (not an exception) for a missing, empty or malformed image. `client/package.json` and the lockfile gained two dependencies (+11 packages, purely additive, CRLF kept).
- `client/.env.example` - the `VITE_SANITY_*` block (notes that Vite inlines them at build time, so Vercel needs them before the deploy that should use the CMS).
- `docs/browser-tests/run_sanity_suite.sh` + `sanity_client_test.mjs` - the real-Chrome suite for the client module (see that folder's README).
- Nothing imports `sanityClient.js` yet, so the live site is unchanged: the app build's main bundle is byte-identical to Session 13's (`Main-D18RDlKE.js`).

**Verification:**
- Studio: `npm ci` from the lockfile; `sanity build` with a valid-format id (about 10 s, offline); a missing id and the unedited `.env.example` placeholder are both refused with a readable message while `--version` and `login` still work; git ignores `.env*` and tracks `.env.example`; the built Studio boots in real Chrome and calls `https://<projectId>.api.sanity.io/v2026-05-04/...` with the id from `.env` (this sandbox's network blocks that call itself, so login and real content are the owner's check).
- Client module, real Chrome, production builds, 40+ checks: unconfigured (id absent / placeholder / bad dataset) never throws, makes no request and warns correctly; configured, it sends exactly `GET abc12345.apicdn.sanity.io/v2026-05-04/data/query/production?...&perspective=published` with no auth header or cookies; the SDK is downloaded once, on first use; HTTP 404/500, a network failure (rejects after about 3 s), abort and the 10 s timeout all end as clean rejections and leave the client healthy; `urlFor` returns exact CDN urls and `null` for every unusable input; a failed SDK download rejects cleanly (Chrome then keeps failing that chunk until the page reloads, which is why callers fall back to built-in content).
- Two things the suite caught: `urlFor` threw on a malformed asset reference (now resolved up front and returned as `null`), and the first test runner silently tested the wrong build because of a stale file server (the runners now give each scenario its own port and check what is being served).
- Whole app: production build passes, lint 70 to 70 rule for rule. `diff -r` against the Session 13 zip shows only the files above; CRLF files kept CRLF, new files are LF; no `node_modules`, `dist` or `.env` inside the project; both lockfiles agree with their `package.json`.

**Owner step still open - task 1.5:** `studio/README.md` has the checklist (log in, create the project with a public `production` dataset, put the project id into `studio/.env`, `client/.env` and Vercel's environment variables then redeploy, register the CORS origins with credentials off, `npm run dev`, then the two "is it wired up" checks). It cannot be run in this sandbox. Category 2 does not depend on it; Categories 3-5 do.

**Still open from Session 13:** the Mern/Pern key warning, the `forwardRef` warning, the unused `Rishav2` / `Rishav4` images, the HeroUI CSS warnings, `server/.env` inside shared zips.

**Next:** Category 2 - schema design, one document type at a time, validated offline with `sanity build` and the schema validator.

### Session 15 — CMS Category 2, task 2.6: `siteSettings` schema

**First schema design task.** Before writing any fields, read the five pieces of current code Category 3 says `siteSettings` will replace, rather than trusting the plan's one-line descriptions: `About.jsx`, `Contact.jsx`, `Footer_BeamsCollision.jsx`, `Float_Icon.jsx`. Two things the plan's descriptions got wrong: the About "bio paragraph" is actually three separate paragraphs, not one; and the social links plus the resume link both live in `Float_Icon.jsx`'s `FloatingDockDemo` array, not the footer - the footer itself only has phone/email/address and a dead nav list (new finding, logged below).

**Built:**
- `studio/schemaTypes/documents/siteSettings.js` - the singleton document: `aboutBio` (portable text - Normal style only, `strong`/`em`/`underline` decorators, no lists or annotations, matching what the current copy actually uses), `contactHeading` (string, content only), `contactImage` (image, hotspot on, a *required* `alt` sub-field - the live `<img>` has `alt=""` today), `phone` (string), `email` (string, `.email()` validated), `address` (text, 2 rows, line breaks kept literally rather than a structured object), `socialLinks` (array of `socialLink`), `resumeUrl` (url - stays a link rather than a Sanity file asset; reasoning is in the schema file).
- `studio/schemaTypes/objects/socialLink.js` - new reusable object, `platform` (closed list: the 3 live today - LinkedIn, GitHub, Twitter/X - plus Instagram/YouTube/Dribbble/Behance) + `url`. The icon itself stays a frontend asset (Sanity has no "pick a React component" field type); the frontend keeps one `platform -> icon` lookup when this is wired up in Category 3/4.
- `studio/sanity.config.js` - the singleton pattern: a `SINGLETON_TYPES` set, a structure-pane entry that opens the fixed `siteSettings` document id directly instead of listing one, filtered out of the generic create-new list, duplicate/delete disabled for it.
- `studio/schemaTypes/index.js`, plus `documents/` and `objects/` subfolders established now as the convention the other 9 schema types will follow.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, about 9 s, offline. `diff -r` against the uploaded zip - only the 4 files above changed; `client/` and `server/` untouched.

**Not done in this task (by design, not oversight):** no content entered anywhere - no `siteSettings` document exists in any dataset yet (that's Category 5's seed script, or manual entry once 1.5 is done); fetching and rendering this data on the actual pages is Category 3's job, not this one.

**New UI issue found, logged not fixed (UI_ISSUES_REPORT.md #3):** the footer's "About / Resume / FAQs / Contact" nav list - both columns - is plain `<li>` text with no `href` anywhere; styled as clickable but functionally dead.

**Still open from Sessions 13-14:** the Mern/Pern key warning, the `forwardRef` warning, the unused `Rishav2` / `Rishav4` images, the HeroUI CSS warnings, `server/.env` inside shared zips, the shared-ticker-hook idea, task 1.5.

**Next:** the user picks - continue Category 2 with another schema (2.1-2.5 or 2.7), or pause here. One schema at a time, per instruction.

**Mid-session correction, before 2.1:** the user set an explicit content-vs-presentation rule - styled headings (h1/h2, eyebrow labels, decorative accents) are permanent and stay in code; only content that can plausibly change later (descriptions, links, images) becomes a schema field - and proposed a "common file" default-content pattern. Both written up as architecture decisions 12 and 13 rather than acted on immediately: 12 formalizes a rule already followed in 2.6 and now applied to 2.1 below; 13 belongs to Categories 3/4 (fetching/rendering), not schema design, so it is documented now and built when that category starts.

### Session 15 (continued) — CMS Category 2, task 2.1: `heroProject`, `timelineProject`, `featuredProject`

**Three schemas, one per Home page section**, each read from its real source: `HeroParalax.jsx`'s `products` array, `TimeLineData.jsx`'s `data` array, and `Carousel.jsx` + `ProjectDescription.jsx` together (the carousel's collapsed-card data and its expanded-card description live in two separate files today; the schema merges them into one document). Per architecture decision 12, each section's own heading stayed in its component rather than becoming a field: the hero's "Hi, Its Rishav Raj" + intro paragraph, the timeline's "My Tech Journey (2022-2025)" + intro paragraph, the carousel's "Projects That Define Me .".

**The timeline's 4 current entries are not shaped alike** - 1 or 2 paragraphs, an image grid of 4, 2 or none, and the last entry (“GitHub, Vercel & Render”) is a checklist instead of images. Rather than copy that inconsistency into the schema, `timelineProject.description` is portable text that supports paragraphs and a bullet list, and `highlights` (the image grid) is simply allowed to be an empty array - so every current entry fits the same two fields with no special case, and a future entry is not locked into any one shape.

**Built:**
- `studio/schemaTypes/documents/heroProject.js` - `title`, `link` (optional - replaces today's `"#"` placeholder for photo-only cards), `thumbnail`, `displayOrder`.
- `studio/schemaTypes/documents/timelineProject.js` - `title`, `description` (portable text: paragraphs + bullet list, no other formatting), `highlights` (array of `linkedImage`, may be empty), `displayOrder`.
- `studio/schemaTypes/documents/featuredProject.js` - `category`, `title`, `cardImage`, `detailImage` (optional, falls back to `cardImage` - only GemX uses a genuinely different one today), `description`, `githubUrl` / `websiteUrl` (both optional, for a future project with no public repo or no live site), `displayOrder`.
- `studio/schemaTypes/objects/linkedImage.js` - new reusable object (`image` + optional `link`), used by `timelineProject.highlights` today.
- All three document types: a `displayOrder` number field (named to read cleanly in a GROQ `order()` clause, not shadow it) plus a matching Studio sort ordering, so the document list can be viewed in display order instead of last-edited order.
- `studio/schemaTypes/index.js` updated to register all three documents and `linkedImage`.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, offline. `diff -r` against the uploaded zip - only `studio/schemaTypes/index.js` and the 4 new files above changed; `client/` and `server/` untouched.

**Not done in this task:** no content entered anywhere; fetching and rendering this data on the Home page is Category 3/4, not this one.

**Next:** the user picks - continue Category 2 (2.2-2.5 or 2.7), or pause here.

### Session 15 (continued) — CMS Category 2, task 2.2: `serviceGroup` (renamed from `serviceItem`), `serviceShowcaseProject`

**Renamed `serviceItem` to `serviceGroup`, with reasoning, not silently.** `Develop_Service.jsx` and `Design_Service.jsx` each render exactly 2 service groups (Develop/Support; Design/Other) via one `<FeatureComponent heading= subheading= service={array} end= />` call per group. Heading, subheading, the service-name list, and even the trailing accent character travel together as one editorial unit - a flat "one document per individual service" design (closer to the plan's literal `serviceItem` name) would have left the heading/subheading with nowhere natural to live, and would mean querying and re-assembling 4 separate category labels to render what is already one coherent block in the component.

**The subheading's trailing accent char is real content, not styling** - it looked exactly like the permanent heading accents left out in 2.1, but `FeatureComponent` takes it as an `end` prop rather than a hardcoded character, and it genuinely varies: Develop/Support/Design end in "." but Design's "Other" group ends in "!". Caught by reading `FeatureComponent.jsx` directly rather than assuming from the two call sites alone.

**`serviceShowcaseProject` is one shared list, not two.** Develop's `DevelopImages` and Design's `ProjectImages` (the scrolling ribbon at the bottom of each page) turned out to be the exact same 12 images in the exact same order - genuinely one set of content shown on both pages, not two sets that happen to match. Modeled as a single list so it is edited once and shows in both places.

**Built:**
- `studio/schemaTypes/documents/serviceGroup.js` - `page` (develop/design), `heading`, `subheading`, `accentChar` (defaults to "." via `initialValue`), `services` (array of strings), `displayOrder`.
- `studio/schemaTypes/documents/serviceShowcaseProject.js` - `image`, `displayOrder`. No title or link - neither is used by the live ribbon.
- `studio/schemaTypes/index.js` updated to register both.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, offline. `diff -r` against the uploaded zip - only `studio/schemaTypes/index.js` and the 2 new files above changed; `client/` and `server/` untouched.

**Found, not built - proposed as new task 2.9 instead of scattered flags:** both service pages have hero-level media that fits neither schema here - Develop's rotating 8-image set, Design's autoplay video. Combined with 2.1's Home-hero-tagline flag into one proposed `pageHero` schema (one per page, just the hero-level intro content), since three separate one-off judgment calls are a pattern, not three unrelated edge cases. Not built - new scope outside what 2.1 and 2.2 were asked to cover.

**Not done in this task:** no content entered anywhere; fetching and rendering this on the Develop/Design pages is Category 3/4, not this one.

**Next:** the user picks - continue Category 2 (2.3-2.5, 2.7, or the new 2.9), or pause here.

### Session 15 (continued) — CMS Category 2, task 2.3: `projectHighlight`

**The schema Category 6 will eventually drive a single generic template from**, built by diffing `Mern_Highlights.jsx` against `Pern_Highlights.jsx` line for line rather than assuming either page's structure. Everything identical between the two pages (the "Design"/"Tech Stack" headings and their shared subheadings, the Highlights section's heading and ":" accent) stays out of the schema, per architecture decision 12 - only what genuinely differs became a field.

**Two things only surfaced by reading the markup and `TechStackData.js` directly:**
- The hero's project name has a real per-project text color (GemX blue, QuickFundz green) - unlike every other heading-adjacent accent left out so far, this one is a deliberate per-project choice, so it became a field (`titleColor`) rather than being left as permanent chrome.
- That color, and every tech-stack badge's `color`, are closed lists of *keys* in the schema, not the raw Tailwind classes the current data stores (`"bg-blue-600"` etc.). Tailwind only generates CSS for class names it finds as literal text during its build scan - today's data works only because it sits in a `.js` file Tailwind reads. The moment this content moves to Sanity, a className built from the raw string at render time would silently stop working, with no error anywhere. The frontend keeps a small literal `{key: 'bg-blue-600', ...}` lookup when this is wired up (Category 3/4), the same pattern already used for `socialLink.platform`.

**Also changed, not just migrated as-is:** `techStackItem.logo` is a Sanity image now, not the current hotlinked URL - today's logos point at Wikimedia, SendGrid, and Cloudinary's demo account, none of them under this project's control, and GemAPI's is a literal placeholder image rather than a real logo. `video` stays a URL field for now (matching 2.3's own note on file-size risk), but must hold a genuine absolute URL - the current relative `/ProjectVideos/...` path only resolves because it happens to be served from the site's own domain; migrating it means prefixing the full domain or wherever the video ends up hosted.

**Built:**
- `studio/schemaTypes/documents/projectHighlight.js` - 15 fields across 5 Studio tabs (hero/design/media/techStack/highlights, grouped given the field count): `title`, `slug` (for Category 6's `/highlights/:slug` route), `displayOrder`, `category`, `titleColor`, `tagline`, `missionStatement`, `logo`, `websiteUrl`, `githubUrl`, `video`, `leftGallery` + `rightGallery` (two independently-rotating image sets, matching `HighlightImages.jsx`'s actual `img2`/`img3` props exactly), `techStack`, `features`.
- `studio/schemaTypes/objects/techStackItem.js` - new reusable object: `name`, `logo` (image), `link` (optional), `color` (closed list, see above).
- `studio/schemaTypes/index.js` updated to register both.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings (caught and fixed two real mistakes first: a stray `#` in a comment block that would have been a syntax error, and an overly permissive URL validation that would have let a non-functional relative path through as valid). `npm ci && npx sanity build` - clean, offline. Re-verified a second time after a gap in this same session, from the plan doc and the files on disk rather than from memory of having done it, before writing this entry - still 0 errors, still builds clean. `diff -r` against the uploaded zip - only `studio/schemaTypes/index.js` and the 2 new files above changed; `client/` and `server/` untouched.

**Not done in this task:** no content entered anywhere; the generic template, the `/highlights/:slug` route, and migrating GemX/QuickFundz's actual content are Category 6, not this task - this task only built what Category 6 will read.

**Next:** the user picks - continue Category 2 (2.4, 2.5, 2.7, or the new 2.9), or pause here.

### Session 15 (continued) — CMS Category 2, task 2.4: `skillTickerItem`, `web3TickerItem`

**The simplest pair so far.** `About.jsx`'s `webImages` (12 images, the right-moving ticker under "Skill is Best Way to Know About.") and `Web3Images` (10 images, the left-moving "Exploring" ticker) are both pure image arrays - no title, no link - confirmed by reading `CustomImages.jsx` itself rather than assuming from the two call sites. Same shape as 2.2's `serviceShowcaseProject`.

**Factored the duplication instead of copying it twice.** The two document types are structurally identical (`image` + `displayOrder`, nothing else), so the field/ordering/preview definitions moved into one shared `schemaTypes/shared/tickerImage.js` helper that both `skillTickerItem.js` and `web3TickerItem.js` spread into their own `defineType`. A future change to this shape (e.g. an optional caption) now only has to happen once. Kept as two separate document types rather than merged into one, unlike 2.2's showcase images - these are two genuinely different, non-overlapping image sets, not the same content shown twice, so merging them would have been the wrong call here even though the schema shape is identical.

**Built:**
- `studio/schemaTypes/shared/tickerImage.js` - new, the shared `tickerImageSchema()` factory (not a registered Sanity type itself, so it lives outside `documents/`/`objects/`).
- `studio/schemaTypes/documents/skillTickerItem.js`, `documents/web3TickerItem.js` - each just a `defineType` wrapper spreading the shared shape in.
- `studio/schemaTypes/index.js` updated to register both.

**Left alone, per architecture decision 12 and the nav-link rule:** the "Skill is Best Way to Know About." heading, and the "Let's Connect" button beside the skill ticker (a fixed `/contact` link, not editorial content).

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, offline. `diff -r` against the uploaded zip - only `studio/schemaTypes/index.js` and the 3 new files above changed; `client/` and `server/` untouched.

**New UI issue found, logged not fixed (UI_ISSUES_REPORT.md #4):** the "Exploring" button beside the web3 ticker has no `href` at all - unlike "Let's Connect" right above it, which correctly links to `/contact`.

**Not done in this task:** no content entered anywhere; fetching and rendering this on the About page is Category 3/4, not this one.

**Next:** the user picks - continue Category 2 (2.5, 2.7, or the new 2.9), or pause here.

### Session 15 (continued) — CMS Category 2, task 2.5: `faqItem`

**The simplest schema yet.** `FAQData.js`'s `faq` array is a flat list of `{title, answer}` pairs, and `FAQ.jsx` renders it straight into a HeroUI `<Accordion>` with no surrounding heading text anywhere - the first section this pass where there was no permanent-heading call to make at all.

**Built:** `studio/schemaTypes/documents/faqItem.js` - `question` (renamed from the data file's `title`, which is what it actually is), `answer` (plain text, matching `featuredProject.description`'s reasoning - single-paragraph prose, no lists or inline formatting to justify portable text), `displayOrder`. `studio/schemaTypes/index.js` updated to register it.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, offline. `diff -r` against the uploaded zip - only `studio/schemaTypes/index.js` and the 1 new file changed; `client/` and `server/` untouched.

**Not done in this task:** no content entered anywhere; fetching and rendering this on the Contact page is Category 3/4.

**Category 2 status:** 2.1-2.6 all done. Only 2.7 (`lab`) and the proposed 2.9 (`pageHero`) are real remaining work - 2.8 is a standing note for Category 5, not a task to execute now.

**Next:** the user picks - 2.7, the proposed 2.9, or pause/close out the category here.

### Session 15 (continued) — CMS Category 2, task 2.7: `lab`, `labCategory`

**New feature, not a migration** - the Labs page is currently a placeholder, so this task built against the field list Category 7 itself already anticipated (title, description, GitHub link, live link, documentation) rather than reverse-engineering existing markup.

**Mid-task gap, caught before continuing rather than assumed past:** this task was started, then resumed after a gap. Checked the actual files rather than trusting memory of having done the work: `package.json` had the new dependency correctly pinned, `node_modules` genuinely had it installed, but no `labCategory`/`lab` schema files existed yet and 2.7 was still unmarked everywhere - so only the dependency install had actually landed. Continued from exactly that point rather than re-doing it or skipping ahead.

**`labCategory` is a real document type, not a closed list or free text on `lab`.** Categories are expected to keep growing as new kinds of mini-projects get added - a closed list would mean a schema edit per new category (working against the entire point of a CMS), and a free-text string risks "Authentication" / "Auth" / "authentication" silently becoming three separate rows instead of one. A reference means the category is picked from what already exists in Studio, not retyped per entry.

**Category 7's "variant" turned out to be the `lab` document itself**, not a separate field - each `lab` document already is one variant within its category by virtue of existing, so a field that just restated that would have been redundant.

**`documentation` needed real code blocks, not just prose** - more than every portable-text field built so far. The whole point of this page is showing other developers how to use something: install commands, config, usage examples. Added `@sanity/code-input` (the first new Studio dependency since Category 1) rather than approximate code with a monospace text style, which would lose syntax highlighting and language-aware editing for no reason. Checked peer-dependency compatibility against the npm registry first - `sanity ^5 || ^6.0.0-0`, `react ^19.2`, `styled-components ^6.1` - all satisfied by this project's installed versions - before installing, then fixed the install to use the same `^` version-range convention already used by every other dependency in the file (npm's default pinned it exactly, which would have been the one dependency in the file that couldn't float patch updates like the rest).

**Built:**
- `studio/schemaTypes/documents/labCategory.js` - `name`, `displayOrder`.
- `studio/schemaTypes/documents/lab.js` - `title`, `category` (reference to `labCategory`), `description`, `githubUrl` (required - the code is the point of this page), `liveUrl` (optional), `documentation` (portable text: Normal/H3/H4 styles, bullet/numbered lists, bold/italic/inline-code, a link annotation, plus real `code` blocks with a curated language list - JS/TS/JSX/TSX/JSON/Bash/HTML/CSS), `displayOrder`.
- `studio/sanity.config.js` - registered the `codeInput()` plugin.
- `studio/package.json`, `studio/package-lock.json` - added `@sanity/code-input@^7.3.10`.
- `studio/schemaTypes/index.js` updated to register both new documents.

**Also fixed:** Category 7's own intro previously claimed `lab`'s schema "already existed" from an earlier session - never true, and left uncorrected it would have caused real confusion once Category 7 actually starts. Corrected now that the schema genuinely exists, and Category 7's field-list note updated to match the real field names.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, offline. `diff -r` against the uploaded zip - `studio/schemaTypes/index.js`, the 2 new document files, `studio/sanity.config.js`, and (new this task) `studio/package.json` + `studio/package-lock.json`; `client/` and `server/` untouched.

**Not done in this task:** no content entered anywhere; the actual Labs page, its motion design, the route, and rendering `documentation` are Category 7, not this task.

**Category 2 status: 2.1-2.7 all done.** Only the proposed 2.9 (`pageHero`) is real remaining work - 2.8 stays a standing note for Category 5.

**Next:** the user decides on 2.9, or closes out Category 2 here.

### Session 15 (continued) — CMS Category 2, task 2.9: `sectionIntro` (renamed from the proposed `pageHero`) — Category 2 complete

**Consolidates the 4 hero-level gaps found along the way** rather than leaving them as scattered flags: Home hero's tagline (2.1), Home timeline's intro paragraph and heading (2.1), Develop hero's rotating image set (2.2), Design hero's video (2.2).

**Renamed `pageHero` to `sectionIntro`** - the proposal's own name undersold it once actually built: the timeline instance is a section within the Home page, not the page's own hero. The 4 instances need genuinely different fields (a hero has a tagline and no media; a service-page hero has media and no tagline), so every field is optional and a closed-list `sectionKey` says which instance a document is - closed, unlike `labCategory`, because this set is fixed by where it gets fetched in the code, not expected to grow the way lab categories are.

**Resolved the open year-range question from the proposal.** The timeline's "My Tech Journey (2022-2025)" heading keeps its text in the component, same as every other permanent heading - but the two numbers inside it come out as `journeyStartYear`/`journeyEndYear` fields, since unlike a purely stylistic heading this one embeds a date that will become factually wrong, not just look dated. `journeyEndYear` is optional specifically so an editor can leave it blank to mean "ongoing" rather than needing to keep re-entering a fixed year that would only go stale again.

**Built:** `studio/schemaTypes/documents/sectionIntro.js` - `sectionKey` (closed list), `tagline`, `journeyStartYear`, `journeyEndYear`, `images`, `video`. `studio/schemaTypes/index.js` updated to register it.

**Verification:** `npx sanity schema validate` - 0 errors, 0 warnings. `npm ci && npx sanity build` - clean, offline. `diff -r` against the uploaded zip - only `studio/schemaTypes/index.js` and the 1 new file changed; `client/` and `server/` untouched.

**Not done in this task:** no content entered anywhere; fetching and rendering this is Category 3/4.

---

## Category 2 complete

13 document types, 3 reusable object types, 1 shared field-set helper, built one task at a time across 9 sub-steps (2.1-2.7, 2.9; 2.8 stays a standing note for Category 5, not a task). One new Studio dependency added along the way (`@sanity/code-input`, 2.7). Every task validated offline (`npx sanity schema validate` + `npx sanity build`, 0 errors/0 warnings each time) before being marked done; `client/` and `server/` were never touched - every change this category landed inside `studio/` and `docs/`.

The plan's one-line descriptions turned out wrong or incomplete often enough that reading the real code first, every task, rather than trusting the bullet points, was the right call each time: 2.1's "bio paragraph" was three paragraphs; 2.2's `serviceItem` was actually a group; 2.3 caught two real Tailwind-JIT bugs before they could ship; 2.6's resume/social links weren't where the plan said; 2.7's "variant" turned out to be the document itself, not a field; 2.9 surfaced a genuinely new gap (the stale year-range heading) that no earlier category anticipated.

No content exists in any dataset yet - that's Category 5's seed script, or manual entry once task 1.5 (the owner's actual Sanity project setup) is done. Fetching and rendering any of this on the live site is Category 3/4, not started.

**Next: Category 3 — Static Copy Migration**, whenever the user is ready.

### Session 15 (continued) — CMS Category 3, task 3.1: foundation (`useSiteSettings()`, fallback content)

**First time `client/` is actually touched** - every category so far stayed inside `studio/`/`docs/`. Numbered Category 3's tasks (3.1-3.6, matching the Category 2 convention) and added 3.1 for the DRY note's hook plus the fallback-content side of architecture decision 13, which no earlier category needed yet.

**Mid-task gap again, checked before continuing rather than assumed:** this task was interrupted twice and resumed both times by re-checking the actual files first. First gap: `@portabletext/react` was genuinely installed but no hook or fallback files existed yet. A false alarm worth recording: a quick shell check of `client/package.json`'s line endings gave a wrong "0 CRLF" reading because of a `&&`/`;` mixing bug in the command itself (grep's zero-matches exit code silently skipped the next check) - re-verified byte-by-byte with Python instead of trusting the first, faster check, which is what caught the mistake. The real answer: `client/package.json` is genuinely CRLF throughout (67 lines originally, 68 after `npm install` added one line, 0 stray LF either time) - `npm install` preserved the convention correctly; there was never an actual problem, just an unreliable check. Second gap: resumed again after that, with the dependency and the verified line-ending state intact, nothing further written yet - continued from exactly there.

**Transcribed the real current values, not approximations**, into `client/src/components/Data/SiteSettingsFallback.js`: read `About.jsx`, `Contact.jsx`, `Footer_BeamsCollision.jsx`, and `Float_Icon.jsx` directly rather than relying on memory of the 2.6 read. Two small issues surfaced by doing this character-for-character: a reversed phone country code ("91+" instead of "+91") and a couple of missing/stray spaces in the bio text. Carried both into the fallback exactly as they are today rather than silently fixed - a data-source migration isn't the moment to also change what's displayed - and logged as UI_ISSUES_REPORT.md #5 and #6 instead.

**`aboutBio` is real Portable Text, not a plain string or array of strings** - built as actual block/span objects with `underline` marks on "creativity", "quality ", and "flexible", matching exactly what the schema expects and what `<PortableText>` renders, so the same component call works identically whether the data came from Sanity or from here. Needed `@portabletext/react` for this; the latest release (8.0.1) requires React 19, this project is on React 18.3, so checked the version history against the npm registry first and pinned `^6.2.0` - the last line supporting React 18 (`^18.2 || ^19`) - same compatibility-check method used for `@sanity/code-input` in 2.7.

**`useSiteSettings()`** - a module-level cache so the one `siteSettings` document is fetched once and shared across every future consumer (About, Contact, the footer) instead of each independently re-fetching the same document; returns the fallback immediately and swaps to real content if a fetch resolves with an actual document - no loading state, since the fallback already is what the site shows today. A fetch that resolves with nothing (configured, but no `siteSettings` document published yet) isn't retried again this session, the same as a real failure - deliberate, not an oversight: retrying on every mount could mean hammering a genuinely unreachable endpoint repeatedly. A page reload tries again.

**Also added `resolveImage()` to `sanityClient.js`**, not folded into the hook: every image field from here on (not just `contactImage`) will need the same "Sanity image, or fall back to a local import" resolution, so it lives next to `urlFor()` where every future consumer can reach it.

**Built:**
- `client/src/components/Data/SiteSettingsFallback.js` - new.
- `client/src/hooks/use_site_settings.jsx` - new.
- `client/src/utils/sanityClient.js` - added `resolveImage()`.
- `client/package.json`, `client/package-lock.json` - added `@portabletext/react@^6.2.0`.

**Verification:** `npm run lint` on the new/edited files - clean. `npm run build` - succeeds, exercising the real unconfigured-Sanity fallback path (no project id set in this sandbox, same as the site's actual current deployed state). `diff -r` against the uploaded zip - exactly the 4 items above changed in `client/`; `server/` untouched; no component wired up to any of this yet.

**Not done in this task:** nothing renders from this yet - no component reads `useSiteSettings()` or `siteSettingsFallback` directly. That starts at 3.2.

**Next:** 3.2 (About bio paragraph) is the natural next step - the DRY note's promised "one-line change" gets its first real test.

### Session 15 (continued) — CMS Category 3, task 3.2: About bio paragraph

**Not quite the "one-line change" the DRY note promised** - `aboutBio`'s three blocks map to two different DOM locations with two different wrapper styles (the big intro div; two separate `<h2>`s further down), not one flowing paragraph. Rendered each block with its own `<PortableText value={[settings.aboutBio[n]]}>` call and a `components.block.normal` matching that specific block's original wrapper, sharing one `bioMarks` component (just `underline`, the only custom mark the schema defines) across all three.

**"Hi," stays hardcoded**, with its own `text-blue-800` span, same treatment as every other heading-adjacent accent (architecture decision 12) - the schema's marks are strong/em/underline, no color, so there was never a way for this to be content in the first place.

**Caught a real bug by re-checking before continuing, not assuming the prior pass was complete:** this task was interrupted and resumed once. Checking the actual files first (per the standing instruction to verify rather than trust memory) found that an earlier pass had updated `SiteSettingsFallback.js`'s *comment* to say "Hi," had been removed from the bio text, but never actually touched the text itself - it still read "Hi,I'm an expert...". Paired with About.jsx's now-separate hardcoded "Hi," span, this would have rendered as "Hi,Hi,I'm an expert..." on the live page. Fixed before marking this done, not after.

**Verified further than the usual lint/build this time**, since this is the first task in Category 3 that actually renders content: wrote a one-off script that imports the real `siteSettingsFallback` data and server-renders all three paragraphs with `ReactDOMServer.renderToStaticMarkup`, the exact same component structure used in `About.jsx`, then compared the output character-for-character against the original markup. Exact match - the missing spaces, the stray spaces before two of the periods, and the underline positions all came through identically. Compiling cleanly doesn't prove the text renders identically, so this task didn't stop at the usual checks. Script was temporary, deleted after use - not part of the deliverable.

**Lint:** 1 pre-existing error remains (`Let's Connect` button's unescaped apostrophe, elsewhere in the file, unrelated to this task - confirmed by linting the original file for comparison). No new errors or warnings from this change; it incidentally removed one of two pre-existing instances of that same error as a side effect of replacing the bio text, rather than adding to the count.

**Built:** `client/src/components/Navigation/About.jsx` - wired to `useSiteSettings()` and `<PortableText>`. `client/src/components/Data/SiteSettingsFallback.js` - the "Hi," fix.

**Verification:** `npm run lint` - no new issues. `npm run build` - succeeds. Server-rendered comparison - exact match to the original markup. `diff -r` against the uploaded zip - only `About.jsx` and `SiteSettingsFallback.js` changed beyond 3.1's files; `server/` untouched.

**Not done in this task:** Contact, the footer, and the resume link are still hardcoded - 3.3 onward.

**Next:** 3.3 (Contact heading + hero image).

### Session 15 (continued) — CMS Category 3, task 3.3: Contact heading + hero image

**Closer to the promised one-line change than 3.2**, but surfaced one more piece of the heading simplification already flagged in 3.1: re-reading the exact markup for this task found "Let's Connect" wasn't just split from "and Create" by a `<br/>` (already known) - it also sat in its own `<span>` with responsive left-padding (`px-2` through `4xl:px-60`) that "and Create" didn't have, a staggered-indent effect a single content string can't reproduce without an arbitrary split point. Left out along with the `<br/>`, for the same reason - `contactHeading` renders as one continuous string, wrapping naturally.

**First real use of `resolveImage()`** (built in 3.1, unused until now): `contactImage` resolves through it with `images.Project1_i` as the fallback - the same image the page already shows. The live site's empty `alt=""` is gone either way: a real value now comes from the schema's required `contactImage.alt` when there's real Sanity data, or `siteSettingsFallback.contactImageAlt` for the fallback - read from the fallback module directly rather than through `settings`, since a real siteSettings document has no top-level `contactImageAlt` field for that to mean.

**Gap mid-task, this time in the verification tooling itself, not the application code:** interrupted once while writing a server-render verification script (same approach as 3.2). Checking the actual files first found `Contact.jsx`'s real edit was intact and correct - the interruption happened mid-verification-script, not mid-component-edit. The script itself had been failing with `Cannot read properties of undefined (reading 'VITE_SANITY_PROJECT_ID')` - Vite replaces `import.meta.env.*` at build time, which esbuild's bundler alone doesn't do, so running the real `sanityClient.js` under plain Node needed `--define` flags shimming those exact reads. Fixed and reran rather than abandoning the check: image src matched the original local import exactly, alt text correct, heading text correct including the curly apostrophe.

**Built:** `client/src/components/Navigation/Contact.jsx` - wired to `useSiteSettings()` and `resolveImage()`.

**Verification:** `npm run lint` - clean. `npm run build` - succeeds. Server-rendered comparison (with the `import.meta.env` shim) - image and heading both correct. `diff -r` against the uploaded zip - only `Contact.jsx` changed beyond 3.1/3.2's files; `server/` untouched.

**Not done in this task:** the footer's phone/email/address, social links, and the resume link are all still hardcoded.

**Next:** 3.4 (Footer phone/email/address).

### Session 15 (continued) — CMS Category 3, task 3.4: Footer phone/email/address

**The simplest task in Category 3 so far, genuinely close to the DRY note's one-line change.** `phone` and `email` are directly `{settings.phone}` / `{settings.email}`. `address` splits on its literal `"\n"` and maps each line with a `<br/>` between - generic for however many lines an editor enters, not hardcoded for exactly two the way the live markup is today.

**Verified:** `npm run lint` - clean. `npm run build` - succeeds. Server-rendered all three fields from the real fallback data: phone and email matched the original exactly; the address matched with one documented, insignificant difference - today's JSX has a literal space on each side of its `<br />` ("PG <br /> Ramapuram"), which this render doesn't reproduce, since the fallback's `"\n"`-joined string was written without them. No visual effect either way, since browsers collapse whitespace immediately adjacent to a line break - left as is rather than added back for a difference nothing will ever show, but called out rather than silently claimed as an exact match.

**Built:** `client/src/components/Footer_BeamsCollision.jsx` - wired to `useSiteSettings()`.

**Verification:** `npm run lint` - clean. `npm run build` - succeeds. Server-rendered comparison - exact match on phone/email, one noted insignificant whitespace difference on address. `diff -r` against the uploaded zip - only `Footer_BeamsCollision.jsx` changed beyond 3.1-3.3's files; `server/` untouched.

**Not done in this task:** social links and the resume link are still hardcoded, both in `Float_Icon.jsx`.

**Next:** 3.5 (Footer social links).

### Session 15 (continued) — CMS Category 3, task 3.5: Footer social links

**A design tension worth working through, not just mechanical wiring.** Hardcoding three lookups for linkedin/github/twitter specifically would have matched today's exact layout, but would silently break the `socialLink` schema's own promise (2.6) that adding a platform already on its list is a content change, not a code change - a 4th link added in Studio would just never show up with that approach. Mapped `settings.socialLinks` generically instead, in whatever order or count it actually holds, with a `PLATFORM_META` lookup covering all 7 platforms the schema allows - built and verified now, not left as a gap to discover later. An unrecognized platform is dropped rather than rendered broken, defensive even though the schema's closed list should make it impossible.

**One deliberate, flagged position change:** Resume (still hardcoded - that's 3.6) moved from its current 2nd-of-4 position to after the social links. That position only meant something relative to today's fixed 3-link order; once the count is genuinely variable there's no single index that stays correct once a 4th or 5th social link exists, so there wasn't a way to keep both "exact position" and "genuinely CMS-driven."

**Built:** `client/src/components/Float_Icon.jsx` - `settings.socialLinks` mapped through a `PLATFORM_META` table (title + icon per platform, all 7 schema options, not just the 3 live today).

**Verification:** `npm run lint` - clean. `npm run build` - succeeds. Server-rendered the full platform-to-icon resolution from the real fallback data - all 3 entries resolved with correct titles, hrefs, and actual rendering SVG icons (checked the icons really render, not just that the imports succeed); separately confirmed an unrecognized platform drops safely instead of crashing. `diff -r` against the uploaded zip - only `Float_Icon.jsx` changed beyond 3.1-3.4's files; `server/` untouched.

**Not done in this task:** the resume link is still hardcoded - 3.6, the last task in Category 3.

**Next:** 3.6 (resume link) - the last task before Category 3 is complete.

### Session 15 (continued) — CMS Category 3, task 3.6: resume link — Category 3 complete

**Genuinely the one-line change the DRY note promised** - the only task in this category that actually was one: `href: settings.resumeUrl` in place of the hardcoded Google Drive URL in `Float_Icon.jsx`'s "Resume" entry (3.5 already handled its position in the dock). "About/footer" in this task's own title turned out to describe where a resume link conceptually belongs, not two separate places to wire - checked rather than assumed: the only functional resume link anywhere in the codebase is this one dock entry; the footer's own "Resume" nav text is the already-flagged dead link (#3), not a second real link.

**Built:** `client/src/components/Float_Icon.jsx` - the Resume entry's `href`.

**Verification:** `npm run lint` - clean, same one pre-existing unrelated error as every task this category. `npm run build` - succeeds. Confirmed the fallback's `resumeUrl` matches the original hardcoded URL character-for-character.

**Not done in this task:** nothing - this was the last piece.

---

## Category 3 complete

6 tasks (3.1-3.6): the DRY note's foundation (`useSiteSettings()`, the fallback content module, `resolveImage()`), then the About bio, the Contact heading and image, the footer's contact details, the footer's social links, and the resume link - every hardcoded value `docs/CMS_INTEGRATION_PLAN.md`'s Category 3 originally listed, now read from `siteSettings` with the exact current content as the fallback. First category to touch `client/` at all; `server/` stayed untouched the whole way through, confirmed at the end, not just assumed from not having gone near it.

Only one of the six tasks (3.6) was actually the "one-line change" the DRY note promised going in. The other five each surfaced something real: 3.2 needed three separate `<PortableText>` calls because the bio's blocks map to two different DOM locations, not one flowing paragraph, and caught a real "Hi,Hi,I'm..." duplication bug by re-checking before marking done rather than trusting an earlier pass; 3.3 found the heading's responsive padding span, not just its line break, didn't survive becoming a single content string; 3.5 ran into a genuine design tension (hardcode three platform lookups to match today's layout exactly, or map generically and honor the schema's own promise that a new platform is a content change) and chose the schema's promise over exact-position fidelity, saying so plainly rather than picking the easier, quieter option.

From 3.2 onward, every task was verified beyond lint and build: server-rendering the real fallback data through the same component structure and checking the actual output, not just that it compiled. Two real mistakes surfaced this way rather than shipping - the "Hi," duplication (3.2) and an `import.meta.env` tooling gap in the verification script itself (3.3), fixed rather than worked around. Where a difference from today's exact output was found and judged insignificant (address whitespace next to a `<br/>`, 3.4), it was named rather than folded into a claimed exact match.

No content exists in any dataset yet - that's still task 1.5 (the owner's own Sanity project setup) plus either manual entry or Category 5's seed script. The site's actual behavior right now, fallback included, is unchanged from before this category - everything renders through the same fallback content that already matched what was live, which is the entire point of architecture decision 13.

**Next: Category 4 — Repeatable List Migration**, whenever the user is ready.
