import {defineField, defineType} from 'sanity'

// One entry in the Home page's "My Tech Journey" timeline (TimeLineData.jsx's `data` array today - 4
// entries, one per skill/stack). The section's own "My Tech Journey (2022-2025)" heading and intro
// paragraph stay in the component (see architecture decision 12) - note the year range in that heading will
// need a manual edit periodically even though it isn't CMS content; flagging so it isn't forgotten.
//
// The 4 current entries are not shaped alike - 1 or 2 paragraphs, an image grid of 4, 2 or none, and the
// last entry is a checklist instead of images. Rather than copy that inconsistency into the schema, every
// entry gets the same two fields (`description`, `highlights`) and is allowed to leave either mostly empty:
// `description` supports paragraphs AND bullet lists so the checklist-style entry fits without a special
// case, and `highlights` is simply allowed to be an empty array for the entry that has no images.
export default defineType({
  name: 'timelineProject',
  title: 'Timeline Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'The skill or stack name, e.g. "React.js".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'One or more paragraphs, and/or a short bullet list (used by the "GitHub, Vercel & Render" entry today).',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [{title: 'Bullet', value: 'bullet'}],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [],
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'highlights',
      title: 'Highlight images',
      description: 'The small project-thumbnail grid under the description. Leave empty for an entry with no images (like "GitHub, Vercel & Render" today).',
      type: 'array',
      of: [{type: 'linkedImage'}],
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first (earliest in the journey).',
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
    select: {title: 'title', order: 'displayOrder', highlightCount: 'highlights.length'},
    prepare({title, order, highlightCount}) {
      return {title, subtitle: `#${order} \u00b7 ${highlightCount || 0} image${highlightCount === 1 ? '' : 's'}`}
    },
  },
})
