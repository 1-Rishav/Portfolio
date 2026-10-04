# Portfolio Studio (Sanity)

The content-editing app for the portfolio. It is a **separate app** from `client/` and `server/`: Sanity Studio v6 needs
React 19 and Node >= 22.12, while the website runs on React 18, so it has its own `package.json` and dependencies.

Why a CMS and how it fits with the rest of the system: `docs/CMS_INTEGRATION_PLAN.md` (see *Architecture decisions*).

## Commands

| command | what it does |
|---|---|
| `npm install` | install the Studio (once) |
| `npm run dev` | run the Studio locally on http://localhost:3333 |
| `npm run build` | build the static Studio into `dist/` (works offline) |
| `npm run deploy` | host it for free on `<name>.sanity.studio` |

## First-time setup (about 10 minutes, once)

Needs **Node 22.12 or newer** (`node -v`) and a free account at sanity.io (Google or GitHub sign-in works). Run the
commands from this `studio/` folder.

1. **Install and log in**

       npm install
       npx sanity login

2. **Create the project** with a *public* dataset. Public means the website can read published content without a token,
   which is the design (decision 8 in the plan):

       npx sanity projects create "Portfolio" --dataset production --dataset-visibility public

   It prints the new **project id** (a short lowercase id such as `abc12xyz`). Prefer clicking? manage.sanity.io >
   Create project > dataset `production`, visibility Public - same result, and the id is on the project page.

3. **Tell the three places about the id** (the same id everywhere; it is not a secret):

   | where | what |
   |---|---|
   | `studio/.env` | copy `.env.example`, set `SANITY_STUDIO_PROJECT_ID` |
   | `client/.env` | copy `client/.env.example` (or add to your existing `.env`), set `VITE_SANITY_PROJECT_ID` |
   | Vercel (the live site) | Project Settings > Environment Variables: `VITE_SANITY_PROJECT_ID` (and `VITE_SANITY_DATASET` if it is not `production`), then **redeploy** - Vite bakes these in when the site is built |

4. **Allow the website to read from Sanity (CORS)**, credentials off - public reads don't need them:

       npx sanity cors add http://localhost:5173 --no-credentials
       npx sanity cors add https://www.rajrishav.co.in --no-credentials
       npx sanity cors add https://rishav-labs.vercel.app --no-credentials

   Add `https://rajrishav.co.in` too if the bare domain serves the site, and `https://*.vercel.app` only if Vercel
   preview deployments should show CMS content.

5. **Open the Studio**: `npm run dev`, then http://localhost:3333 and sign in. An empty Studio is correct - the content
   types arrive in Category 2 of the plan.

## Check that it is wired up

- **The dataset is public and reachable** - from any terminal, expect `{"result":0,...}`:

      curl "https://<projectId>.apicdn.sanity.io/v2026-05-04/data/query/production?query=count(*)"

  `Insufficient permissions` / 401 means the dataset is private: `npx sanity datasets visibility set production public`.
- **The website can read it** - from `client/` run `npm run dev`, open http://localhost:5173 and paste into the browser
  console:

      const m = await import('/src/utils/sanityClient.js'); [m.isSanityConfigured, await m.fetchSanity('count(*)')]

  Expect `[true, 0]`. If the page reloads once while Vite prepares the SDK, paste it again. A CORS error means step 4 is
  missing the origin you are on.
- `npx sanity doctor` runs Sanity's own diagnostics.

## Optional: host the Studio

`npm run deploy` publishes the Studio at `https://<name>.sanity.studio`, so you can edit from any device. Sanity allows
that address automatically (no CORS entry needed).

## Troubleshooting

| you see | meaning / fix |
|---|---|
| `Missing SANITY_STUDIO_PROJECT_ID` / `not a real project id` | `studio/.env` is missing or still has the placeholder - copy `.env.example` and fill it in |
| engines / Node version error on `npm install` | use Node 22.12+ (`nvm install 22`). The Vercel build's Node version setting should be 22.x too - the website's new SDK dependency declares it (older Node only prints a warning) |
| `[sanity] Not configured` in the website's console | `client/.env` is missing or invalid - the site keeps showing its built-in content; fix it and restart the dev server |
| CORS error in the browser console | register that origin (step 4) |
| `count(*)` is `0` but the site shows its built-in content | expected: the content moves into Sanity over Categories 2-8 of the plan |

## Content types

`schemaTypes/index.js` is empty until Category 2 of the plan adds the document types.
