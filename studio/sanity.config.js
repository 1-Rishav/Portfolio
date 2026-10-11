import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {projectId, dataset} from './env.js'
import {schemaTypes} from './schemaTypes'

// Document types that may only ever have one document. Sanity has no native "singleton" concept - this set
// drives two separate pieces of custom wiring below (the structure pane and the document actions), which
// together are what actually make "there is exactly one" true instead of just assumed. Add a type's name
// here and both behaviors apply to it automatically.
const SINGLETON_TYPES = new Set(['siteSettings'])
// Singletons are opened by a fixed document id (same as the type name) rather than queried for, so a
// reader can always do `*[_id == "siteSettings"][0]` and get the one true document directly.
const singletonId = (typeName) => typeName

export default defineConfig({
  name: 'default',
  title: 'Portfolio CMS',

  projectId,
  dataset,

  // structureTool = the content editor; visionTool = a GROQ playground for testing queries against the live
  // dataset; codeInput registers the `code` block type used by lab.documentation's real code snippets.
  plugins: [
    codeInput(),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            ...[...SINGLETON_TYPES].map((typeName) =>
              S.listItem()
                .title(S.documentTypeListItems().find((i) => i.getId() === typeName)?.getTitle() ?? typeName)
                .id(typeName)
                .child(S.document().schemaType(typeName).documentId(singletonId(typeName))),
            ),
            S.divider(),
            // Every other document type, exactly as the default list would show it - minus the singletons
            // above, so there is no second, generic "Site Settings" entry an editor could create from.
            ...S.documentTypeListItems().filter((item) => !SINGLETON_TYPES.has(item.getId())),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // A singleton can't be duplicated (that produces the second document this whole setup exists to
    // prevent) or deleted (the site always expects exactly one to exist).
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(({action}) => !['duplicate', 'delete'].includes(action))
        : input,
  },
})
