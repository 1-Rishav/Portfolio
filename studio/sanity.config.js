import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {projectId, dataset} from './env.js'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Portfolio CMS',

  projectId,
  dataset,

  // structureTool = the content editor; visionTool = a GROQ playground for testing queries against the live dataset.
  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
