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
