import {defineField, defineType} from 'sanity'

// One card in the Home page's "Projects That Define Me" carousel - today split across two files that this
// schema merges back into one document: Carousel.jsx's `data` array (category/title/card image) and the
// matching component in ProjectDescription.jsx (description paragraph, image, GitHub/website links) that
// each card expands to. The section's own "Projects That Define Me ." heading stays in the component (see
// architecture decision 12). The "GitHub:" / "WebSite:" labels next to the links are the same kind of
// permanent presentation and also stay in the component - only the URLs themselves are fields here.
export default defineType({
  name: 'featuredProject',
  title: 'Featured Project',
  type: 'document',
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      description: 'Shown as a small label above the title, e.g. "Fintech", "Artificial Intelligence".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cardImage',
      title: 'Card image',
      description: 'Shown on the collapsed card, before it is opened.',
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
      name: 'detailImage',
      title: 'Detail image',
      description:
        'Shown inside the opened card. Leave empty to reuse the card image - today 3 of the 4 projects do exactly that, and only GemX uses a distinct detail image.',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'The paragraph shown inside the opened card.',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      description: 'Optional - leave empty for a project with no public repo.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      description: 'Optional - leave empty for a project with no live site.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first.',
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
    select: {title: 'title', category: 'category', media: 'cardImage', order: 'displayOrder'},
    prepare({title, category, media, order}) {
      return {title, subtitle: `#${order} \u00b7 ${category}`, media}
    },
  },
})
