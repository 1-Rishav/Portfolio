import { useEffect, useState } from "react";
import { fetchSanity } from "../utils/sanityClient";
import { siteSettingsFallback } from "../components/Data/SiteSettingsFallback";

// siteSettings is one document read by several unrelated components (About, Contact, the footer) - the DRY
// note in docs/CMS_INTEGRATION_PLAN.md's Category 3 calls for exactly one fetch shared between all of them,
// not each component fetching its own copy of the same data. A plain module-level cache does that without
// needing a context provider wrapped around the app: the first mounted consumer starts the fetch, every
// later one (this render or a future page visit) just reads the cached result.
let cachedSettings = null;
let fetchPromise = null;

const QUERY = `*[_id == "siteSettings"][0]`;

/**
 * Always returns a complete, render-ready siteSettings-shaped object - the real document once it is fetched
 * and exists, the fallback content otherwise (not configured, no network, request failed, or a dataset with
 * no siteSettings document published yet). Never a loading state: the fallback is exactly what today's site
 * already shows, so there is nothing to wait for before rendering something.
 */
export const useSiteSettings = () => {
  const [settings, setSettings] = useState(cachedSettings || siteSettingsFallback);

  useEffect(() => {
    if (cachedSettings) return; // an earlier mount already resolved this - nothing to do

    if (!fetchPromise) {
      fetchPromise = fetchSanity(QUERY)
        .then((doc) => {
          if (doc) cachedSettings = doc; // only a real document counts as resolved
          return doc;
        })
        .catch(() => null);
      // Not retried again this session even if doc comes back null (configured, but no siteSettings
      // document published yet) - same one-attempt-per-load behavior as a real failure, on purpose: a
      // mount-triggered retry could mean hammering a genuinely misconfigured or unreachable endpoint every
      // time a component using this hook mounts. A page reload re-evaluates this module and tries again.
    }

    let active = true;
    fetchPromise.then((doc) => {
      if (active && doc) setSettings(doc);
    });

    return () => {
      active = false;
    };
  }, []);

  return settings;
};
