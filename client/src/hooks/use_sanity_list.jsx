import { useEffect, useState } from "react";
import { fetchSanity } from "../utils/sanityClient";

// Category 4's DRY foundation (docs/CMS_INTEGRATION_PLAN.md) - one hook for every `hardcodedArray.map(...)`
// section the plan lists, generalizing useSiteSettings' module-level-cache pattern (3.1) from one singleton
// document to N distinct list queries. Each distinct query string gets its own cache entry and its own
// in-flight promise, so two components reading the exact same list (e.g. Develop_Service.jsx and
// Design_Service.jsx both rendering serviceShowcaseProject, 4.5) share one network request instead of firing
// two - the same sharing useSiteSettings already does for siteSettings.
//
// No $parameter support, on purpose: every Category 4 query's filter (page == "develop", sectionKey ==
// "design-hero", etc.) is a fixed string known at the call site, not a runtime value - so the simpler contract
// is "give me the whole query text already filtered," with the query string itself doubling as the cache key.
// Keeps this hook's own dependency list honest (just `query`, a primitive, compared by value like any string -
// no JSON.stringify-an-object-for-useEffect workaround to reach for) and avoids a class of bug a params-keyed
// cache would otherwise risk: a caller forgetting a param belongs in the cache key and silently sharing another
// call's cached result.
const cache = new Map(); // query -> { data: array | null, promise: Promise }

/**
 * Always returns a complete, render-ready array - the real documents once fetched and non-empty, the fallback
 * array otherwise (not configured, no network, request failed, or a dataset with zero documents published yet
 * for this query). Never a loading state, for the same reason as useSiteSettings: the fallback is exactly what
 * today's site already shows, so there is nothing to wait for before rendering something.
 *
 * A successful fetch that resolves to an empty array is treated the same as "nothing yet," not as "the real
 * answer is zero items": during migration, a half-populated dataset should keep showing the known-good
 * fallback for a not-yet-populated list, not go blank. (Category 8's shared loading/empty/error states are for
 * once a list's fallback is deleted in Category 5 and there is no longer a safety net to fall back to.)
 *
 * @param {string} query GROQ query, already filtered/ordered (e.g. `*[_type == "faqItem"] | order(displayOrder asc)`) - expected to resolve to an array
 * @param {unknown[]} fallback the current hardcoded array, used until (and unless) the query resolves non-empty
 */
export function useSanityList(query, fallback) {
  const cached = cache.get(query);
  const [list, setList] = useState(cached?.data || fallback);

  useEffect(() => {
    const existing = cache.get(query);
    if (existing?.data) return; // an earlier mount already resolved this exact query

    if (!existing?.promise) {
      const promise = fetchSanity(query)
        .then((result) => (Array.isArray(result) && result.length > 0 ? result : null))
        .catch(() => null);
      cache.set(query, { data: null, promise });
      promise.then((resolved) => {
        if (resolved) cache.set(query, { data: resolved, promise });
      });
      // Not retried again this session even on a null/empty result - same one-attempt-per-load reasoning as
      // useSiteSettings: a mount-triggered retry could mean hammering a genuinely misconfigured or unreachable
      // endpoint every time a component using this query mounts. A page reload re-evaluates this module.
    }

    let active = true;
    cache.get(query).promise.then((resolved) => {
      if (active && resolved) setList(resolved);
    });

    return () => {
      active = false;
    };
  }, [query]);

  return list;
}
