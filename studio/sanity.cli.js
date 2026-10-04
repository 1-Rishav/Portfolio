import {defineCliConfig} from 'sanity/cli'
import {projectId, dataset} from './env.js'

export default defineCliConfig({
  api: {projectId, dataset},
  deployment: {
    // Off on purpose: with auto-updates on, `sanity build` needs Sanity's API and the deployed Studio floats to
    // whatever version Sanity currently serves. Off = exactly the version pinned in package-lock.json, and the build
    // works offline. To follow Sanity's latest automatically instead, set this to true.
    autoUpdates: false,
  },
})
