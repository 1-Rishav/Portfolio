import {defineField, defineType} from 'sanity'

// One image in the scrolling ribbon at the bottom of the service pages. Modeled as a single shared list,
// not one per page, because Develop_Service.jsx's `DevelopImages` and Design_Service.jsx's `ProjectImages`
// turned out to be the exact same 12 images in the exact same order - genuinely one set of content shown
// twice, not two sets that happen to look alike. No title or link: the live ribbon doesn't use either today
// (pure decoration, nothing is clickable), so neither was added - see architecture decision 12.
export default defineType({
  name: 'serviceShowcaseProject',
  title: 'Service Showcase Image',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
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
    select: {media: 'image', order: 'displayOrder'},
    prepare({media, order}) {
      return {title: `#${order}`, media}
    },
  },
})
