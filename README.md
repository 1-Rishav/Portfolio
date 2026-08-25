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
