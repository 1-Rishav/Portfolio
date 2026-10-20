import { useEffect, useState } from 'react'
import { fetchSanity } from '../utils/sanityClient'

// 4.6. useSiteSettings (3.1) generalized the same way useSanityList (4.1) generalized it again for lists:
// this is that same module-level-cache pattern, reusable for any single document matched by a filter.
// sectionIntro's 4 instances (one row per sectionKey) are the first case since siteSettings itself that
// needs "one document, not a list" - wrapping a single document in useSanityList's array (every caller
// reading result[0]) or copying useSiteSettings' singleton logic once per sectionKey were the alternatives,
// both worse than making the pattern itself reusable a second time.
//
// useSiteSettings itself is left exactly as it was built in 3.1, not rewritten on top of this: it already
// works, it's already verified, and swapping its internals for this hook would be a pure DRY exercise, not
// something 4.6 actually needs - touching finished, verified work for a non-functional reason is exactly
// what this project's own working rules say not to do.
const cache = new Map() // query -> { data: object | null, promise: Promise }

/**
 * Always returns a complete, render-ready object - the real document once fetched, the fallback object
 * otherwise (not configured, no network, request failed, or no document published yet matching the query).
 * Mirrors useSanityList's contract exactly, one level up: a query expected to resolve to a single object
 * (typically ending `[0]{...}` in GROQ) instead of an array.
 *
 * @param {string} query GROQ query expected to resolve to a single object or null
 * @param {object} fallback the current hardcoded values, shaped like a real resolved document
 */
export function useSanityDocument(query, fallback) {
  const cached = cache.get(query)
  const [doc, setDoc] = useState(cached?.data || fallback)

  useEffect(() => {
    const existing = cache.get(query)
    if (existing?.data) return // an earlier mount already resolved this exact query

    if (!existing?.promise) {
      const promise = fetchSanity(query)
        .then((result) => result || null)
        .catch(() => null)
      cache.set(query, { data: null, promise })
      promise.then((resolved) => {
        if (resolved) cache.set(query, { data: resolved, promise })
      })
      // Not retried again this session even on a null result - same reasoning as useSiteSettings/useSanityList.
    }

    let active = true
    cache.get(query).promise.then((resolved) => {
      if (active && resolved) setDoc(resolved)
    })

    return () => {
      active = false
    }
  }, [query])

  return doc
}
