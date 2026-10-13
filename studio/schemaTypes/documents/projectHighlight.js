import {defineField, defineType} from 'sanity'

// One highlighted project page - what Category 6 will drive a single generic ProjectHighlightPage template
// from, by slug, replacing Mern_Highlights.jsx and Pern_Highlights.jsx, which Category 6 itself already
// describes as "the same component by hand, twice, with different values." This schema is that
// generalization: every field here is something that differs between the two current pages; everything
// identical between them (the "Design"/"Tech Stack" section headings, their shared subheadings, the
// Highlights section's "Highlights" heading and ":" accent) stays in the future template component, per
// architecture decision 12.
//
// Two things only surfaced by reading the hero markup and TechStackData.js directly:
// - The hero's project name is rendered in a per-project text color (GemX blue, QuickFundz green) - a
//   genuine per-project choice, not shared chrome, so it became a field (`titleColor`) rather than being
//   left out like the other hero headings.
// - That color, and every techStackItem's badge `color`, are closed lists of keys rather than raw Tailwind
//   classes - see the note in objects/techStackItem.js for why a raw class string would silently stop
//   rendering once this data lives in Sanity instead of in a scanned source file.
export default defineType({
  name: 'projectHighlight',
  title: 'Project Highlight',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero'},
    {name: 'design', title: 'Design'},
    {name: 'media', title: 'Media'},
    {name: 'techStack', title: 'Tech Stack'},
    {name: 'highlights', title: 'Highlights'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'E.g. "GemX", "QuickFundz".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'Used in the page URL once Category 6 adds the /highlights/:slug route.',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first, wherever highlights are listed together.',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'category',
      title: 'Category label',
      description: 'Shown above the title, e.g. "Mern Project". Free text - not limited to Mern/Pern.',
      type: 'string',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleColor',
      title: 'Title color',
      description: 'The title\u2019s accent color in the hero sentence.',
      type: 'string',
      group: 'hero',
      options: {
        list: [
          {title: 'Blue', value: 'blue-800'},
          {title: 'Green', value: 'green-800'},
          {title: 'Purple', value: 'purple-800'},
          {title: 'Orange', value: 'orange-800'},
          {title: 'Red', value: 'red-800'},
          {title: 'Pink', value: 'pink-800'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'The rest of the hero sentence after the colored title, e.g. "is a web application designed to\u2026".',
      type: 'text',
      rows: 3,
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'missionStatement',
      title: 'Mission statement',
      description: 'The second hero paragraph, e.g. "This project\u2019s mission is to\u2026".',
      type: 'text',
      rows: 3,
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      group: 'design',
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
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      group: 'design',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      group: 'design',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'video',
      title: 'Video URL',
      description:
        'A full URL to the project video. Today\u2019s value is a local /ProjectVideos/ path (excluded from zips for size) served from the site\u2019s own domain - migrating it means either the site\u2019s own full domain in front of that path, or wherever the video ends up hosted. Stays a URL rather than a Sanity file upload for now - revisit with the rest of Category 2.8 once Category 5 is under way and actual file sizes against Sanity\u2019s asset limits are known.',
      type: 'url',
      group: 'media',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'leftGallery',
      title: 'Left gallery',
      description: 'Rotates independently from the right gallery.',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required()}),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'rightGallery',
      title: 'Right gallery',
      description: 'Rotates independently from the left gallery.',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required()}),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'techStack',
      title: 'Tech stack',
      type: 'array',
      group: 'techStack',
      of: [{type: 'techStackItem'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'features',
      title: 'Highlighted features',
      description: 'The feature list in the Highlights section, e.g. "AI Chat", "Voice Call".',
      type: 'array',
      group: 'highlights',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
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
    select: {title: 'title', category: 'category', media: 'logo', order: 'displayOrder'},
    prepare({title, category, media, order}) {
      return {title, subtitle: `#${order} \u00b7 ${category}`, media}
    },
  },
})
