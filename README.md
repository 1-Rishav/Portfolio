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
