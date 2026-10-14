import {defineField, defineType} from 'sanity'

// One technology badge in a projectHighlight's tech stack list (TechStackData.js's `mernTechStacks` /
// `pernTechStack` today).
//
// `color` is a closed list of keys, not the raw Tailwind class the current data stores (e.g. "bg-blue-600").
// That matters for a real reason, not a style preference: Tailwind's build only generates CSS for class
// names it can find as literal text in the source it scans. Today "bg-blue-600" etc. work because they sit
// in TechStackData.js as literal strings, which Tailwind's scanner reads even though the class is applied
// dynamically via `tech.color`. The moment this data moves to Sanity, that literal text stops existing
// anywhere in the source - a className built as `` `bg-${color}` `` from CMS data would silently render
// with no background at all, because Tailwind never generated the class. The fix carried into Category 3/4:
// keep a small literal lookup object in the frontend, e.g. `{ 'blue-600': 'bg-blue-600', ... }`, so the full
// class strings still exist as literal text for Tailwind to find, and this schema only ever stores the key.
export default defineType({
  name: 'techStackItem',
  title: 'Tech Stack Item',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'E.g. "React.js", "MongoDB".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      description:
        'Today these are hotlinked to third-party sites (Wikimedia, SendGrid, Cloudinary\u2019s demo account) with no control over them staying up, and GemAPI\u2019s is a literal placeholder image, not a real logo. Uploading here fixes both.',
      type: 'image',
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
      title: 'Docs link',
      description: 'Where the badge links to, e.g. the technology\u2019s documentation site. Optional.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'color',
      title: 'Badge color',
      description: 'See the file-level note on why this is a key, not a raw Tailwind class.',
      type: 'string',
      options: {
        list: [
          {title: 'Blue', value: 'blue-600'},
          {title: 'Light blue', value: 'blue-400'},
          {title: 'Pale blue', value: 'blue-300'},
          {title: 'Teal', value: 'teal-500'},
          {title: 'Purple', value: 'purple-500'},
          {title: 'Green', value: 'green-500'},
          {title: 'Dark green', value: 'green-600'},
          {title: 'Gray', value: 'gray-200'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'name', media: 'logo'},
  },
})
