// The one place that reads the Studio's environment (studio/.env - see .env.example).
// Imported by both sanity.cli.js (Node, drives build/dev/deploy) and sanity.config.js (browser bundle), so the two
// can never disagree about which project/dataset they point at. Sanity only ships SANITY_STUDIO_-prefixed
// variables to the browser, so a token must never be given that prefix.

export const projectId = process.env.SANITY_STUDIO_PROJECT_ID
export const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Sanity project ids are lowercase letters, digits and dashes. Stricter than "is it set": an unedited placeholder
// copied from .env.example is caught here with a readable message instead of a cryptic SDK error later.
if (!projectId || !/^[a-z0-9-]+$/.test(projectId)) {
  throw new Error(
    `SANITY_STUDIO_PROJECT_ID is missing or not a real project id (got ${JSON.stringify(projectId)}). ` +
      'Copy studio/.env.example to studio/.env and fill it in - the id is on manage.sanity.io (see studio/README.md).',
  )
}
