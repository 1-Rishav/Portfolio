import {defineField, defineType} from 'sanity'

// A small project-thumbnail that optionally opens a live link - used today by timelineProject.highlights
// (TimeLineData.jsx's per-entry image grid). Kept general enough to reuse wherever a document needs "an
// image, maybe clickable" rather than the full shape of a featuredProject.
export default defineType({
  name: 'linkedImage',
  title: 'Image',
  type: 'object',
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
      name: 'link',
      title: 'Link',
      description: 'Where this opens when clicked. Leave empty for a plain, non-clickable image.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {media: 'image', title: 'link'},
    prepare({media, title}) {
      return {title: title || '(no link)', media}
    },
  },
})
