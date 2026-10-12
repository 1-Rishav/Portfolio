import {defineField, defineType} from 'sanity'

// One card in the Home page's hero parallax grid (HeroParalax.jsx's `products` array today - 8 cards mixing
// real projects with personal photos). The hero's own "Hi, Its Rishav Raj" heading and intro paragraph are
// not part of this schema - styled, permanent heading text stays in the component, per the site-wide rule
// (see the Category 2 note in docs/CMS_INTEGRATION_PLAN.md and architecture decision 12).
export default defineType({
  name: 'heroProject',
  title: 'Hero Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Shown on hover. A real project name ("GemX"), or just a label for a personal photo card.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      description:
        'Where this card opens when clicked. Leave empty for a card that is just a photo, not a project (today\u2019s data uses "#" for these - an empty field replaces that placeholder).',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first. Named "displayOrder" rather than "order" so it reads cleanly in a GROQ `order()` clause.',
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
    select: {title: 'title', media: 'thumbnail', order: 'displayOrder'},
    prepare({title, media, order}) {
      return {title, subtitle: `#${order}`, media}
    },
  },
})
