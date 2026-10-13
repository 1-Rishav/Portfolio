import {defineField, defineType} from 'sanity'

// One mini-project card on the Labs page (Category 7 - new feature, nothing existing to migrate, built
// against the field list Category 7 itself already anticipated: title, description, GitHub link, live link,
// documentation). Sits under a `labCategory` row as one of its "variant cards" - what Category 7's notes
// call a "variant" is this document, not a separate field; adding one more field just to restate "this is a
// variant" would be redundant with the document existing at all.
//
// `documentation` needs real code blocks, not just prose: the whole point of this page is showing other
// developers how to use something, which means install commands, config snippets, usage examples - content
// that breaks if flattened into a plain-text or even a no-code-support portable-text field. Uses the
// official @sanity/code-input plugin (registered in sanity.config.js) rather than approximating code with a
// monospace text style, which would lose syntax highlighting and language-aware editing in the Studio for
// no reason.
export default defineType({
  name: 'lab',
  title: 'Lab',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'E.g. "JWT Auth with Refresh Tokens".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'labCategory'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'A short summary shown on the card itself.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      description: 'The code is the point of this page, so this one is required (unlike the optional project links elsewhere).',
      type: 'url',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live demo URL',
      description: 'Optional - leave empty for a code-only entry with no hosted demo.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'documentation',
      title: 'Documentation',
      description: 'Usage instructions - headings, steps, and real code blocks.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading', value: 'h3'},
            {title: 'Subheading', value: 'h4'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Inline code', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
                  }),
                ],
              },
            ],
          },
        },
        {
          type: 'code',
          options: {
            languageAlternatives: [
              {title: 'JavaScript', value: 'javascript'},
              {title: 'TypeScript', value: 'typescript'},
              {title: 'JSX', value: 'jsx'},
              {title: 'TSX', value: 'tsx'},
              {title: 'JSON', value: 'json'},
              {title: 'Bash', value: 'bash'},
              {title: 'HTML', value: 'html'},
              {title: 'CSS', value: 'css'},
            ],
            withFilename: true,
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first, within this category.',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{field: 'displayOrder', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title', category: 'category.name', order: 'displayOrder'},
    prepare({title, category, order}) {
      return {title, subtitle: `#${order} \u00b7 ${category || 'no category'}`}
    },
  },
})
