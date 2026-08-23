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

**Explicitly out of scope for this session** (noted, not forgotten — from the Session 1 flaws report):
- Cookie `maxAge` typo (~986 years instead of ~30/360 days)
- Rate limiter mounted after routes (still a no-op)
- `req.file.originalname` accessed before the null check in `projectController.newProject` (confirmed still present via smoke test)
- 4 missing video files in `public/ProjectVideos/`
- Missing `nodemon` dependency (`npm start` fails)
- Image/bundle size optimization
- `/404` route doesn't exist (wildcard redirect target is itself unmatched)
- ESLint cleanup (279 pre-existing issues, mostly prop-types/unused-vars)
