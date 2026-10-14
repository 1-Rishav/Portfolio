import {defineField, defineType} from 'sanity'

// One entry in siteSettings.socialLinks, rendered as one icon in the footer's floating dock
// (client/src/components/Float_Icon.jsx today - FloatingDockDemo's hardcoded `links` array is exactly what
// this object type replaces once Category 3/4 wires the fetch up).
//
// `platform` is a closed list rather than free text because the icon itself has to stay a frontend asset -
// Sanity has no "pick a React icon component" field type, so the Studio can only ever hand the frontend a
// key to map, never the icon. The frontend keeps one `platform -> icon` lookup (Category 3/4); adding a
// platform already in this list is then a content change, not a code change. The list covers the 3 links
// live today (LinkedIn, GitHub, Twitter/X) plus a few more common on developer/designer portfolios, so the
// next one doesn't immediately need a schema edit either.
export default defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        layout: 'dropdown',
        list: [
          {title: 'LinkedIn', value: 'linkedin'},
          {title: 'GitHub', value: 'github'},
          {title: 'Twitter / X', value: 'twitter'},
          {title: 'Instagram', value: 'instagram'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Dribbble', value: 'dribbble'},
          {title: 'Behance', value: 'behance'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {platform: 'platform', url: 'url'},
    prepare({platform, url}) {
      const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Social link'
      return {title: label, subtitle: url}
    },
  },
})
