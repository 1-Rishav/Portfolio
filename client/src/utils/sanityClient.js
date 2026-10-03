import { createImageUrlBuilder } from '@sanity/image-url'

// Browser-side access to Sanity: public, read-only, no token (see "Architecture decisions" in
// docs/CMS_INTEGRATION_PLAN.md).
//
// Configured through client/.env (see .env.example). Same idea as VITE_GOOGLE_CLIENT_ID: until a real project id is
// set, nothing in here throws and nothing is requested. isSanityConfigured is simply false and callers keep showing
// the built-in content - so the live site is unaffected until the CMS is switched on, and survives it being down.

// Pinned on purpose: without an apiVersion the SDK silently falls back to the deprecated "v1". This date is the one
// Sanity Studio 6.17 itself uses, so GROQ tried in Studio's Vision tool behaves the same here.
const DEFAULT_API_VERSION = '2026-05-04'

const projectId = (import.meta.env.VITE_SANITY_PROJECT_ID || '').trim()
const dataset = (import.meta.env.VITE_SANITY_DATASET || 'production').trim()
const apiVersion = (import.meta.env.VITE_SANITY_API_VERSION || DEFAULT_API_VERSION).trim()

// The SDK's own naming rules, checked first so a typo or an unedited .env.example placeholder means "not configured"
// instead of an exception thrown while the app is still loading (the SDK throws on a bad project id).
const PROJECT_ID_RULE = /^[a-z0-9-]+$/
const DATASET_RULE = /^[a-z0-9][a-z0-9_-]{0,63}$/

export const isSanityConfigured = PROJECT_ID_RULE.test(projectId) && DATASET_RULE.test(dataset)

// Quiet when the variables are simply absent in a production build (the state before setup); loud when they are there
// but wrong (a deploy typo), and always in development.
if (!isSanityConfigured && (projectId || import.meta.env.DEV)) {
  console.warn(
    '[sanity] Not configured - VITE_SANITY_PROJECT_ID / VITE_SANITY_DATASET missing or invalid. Using built-in content. See client/.env.example.',
  )
}

// The SDK is about 40 KB gzipped (measured), so it is loaded on first use instead of shipping in the main bundle - the
// first paint never waits for it. The promise is cached. A failed load (offline, a deploy replaced the chunk, a bad
// apiVersion) is not cached on our side, but the browser keeps failing for that chunk until the page is reloaded - so
// callers fall back to the built-in content, which is exactly the contract above.
let clientPromise = null

function loadClient() {
  if (!clientPromise) {
    const pending = import('@sanity/client').then(({ createClient }) =>
      createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: true, // edge-cached API CDN: fast, and fresh enough for published content
        perspective: 'published', // never drafts - they can't reach the browser
        timeout: 10000, // a hung request becomes an error (so: fallback content) instead of a spinner forever
      }),
    )
    clientPromise = pending
    pending.catch(() => {
      if (clientPromise === pending) clientPromise = null
    })
  }
  return clientPromise
}

/**
 * Runs a GROQ query against the published content and resolves with its result. Never throws synchronously: it
 * rejects when Sanity is not configured, unreachable, times out, answers with an error, or is aborted. Callers treat
 * any rejection as "no CMS content" and keep the built-in content.
 *
 * @param {string} query GROQ query
 * @param {Record<string, unknown>} [params] values for the query's $parameters
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function fetchSanity(query, params = {}, options = {}) {
  if (!isSanityConfigured) throw new Error('Sanity is not configured')
  const client = await loadClient()
  return client.fetch(query, params, options.signal ? { signal: options.signal } : undefined)
}

const imageBuilder = isSanityConfigured ? createImageUrlBuilder({ projectId, dataset }) : null

/**
 * Image URL builder for a Sanity image field: `urlFor(doc.image)?.width(400).url()`.
 *
 * Returns null - so the optional chaining above yields undefined - for anything the builder can't resolve: a missing
 * or empty image (CMS image fields are often optional, and an image with only its `alt` filled in has no asset), a
 * malformed reference, or Sanity not being configured. The builder itself throws on all of those, which inside a
 * render would take the whole page down. Serves WebP/AVIF where the browser supports it (`auto('format')`) unless a
 * format is set explicitly.
 */
export function urlFor(source) {
  if (!imageBuilder) return null
  try {
    const builder = imageBuilder.image(source).auto('format')
    builder.url() // resolve the source now, so a bad one fails here (and becomes null) instead of later inside a render
    return builder
  } catch {
    return null
  }
}
