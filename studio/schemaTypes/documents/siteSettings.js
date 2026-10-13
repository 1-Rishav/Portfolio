import {defineField, defineType} from 'sanity'

// The site's one settings document - About's bio, Contact's heading/hero image, the footer's contact
// details, social links and the resume link (Category 3's static-copy list, plus socialLinks from
// Category 4). Current hardcoded values this replaces, read directly from the components rather than
// assumed: About.jsx (bio), Contact.jsx (heading + image), Footer_BeamsCollision.jsx (phone/email/address),
// Float_Icon.jsx's FloatingDockDemo (social links + resume).
//
// Sanity has no native "singleton" document type - this schema only describes the shape. "There is exactly
// one" is enforced in sanity.config.js: a fixed document id ("siteSettings") the structure pane opens
// directly instead of listing, filtered out of the generic create-new list, with duplicate/delete disabled
// for it. Without that wiring an editor could create a second document and every query assuming "the one
// settings doc" would silently read the wrong one.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'aboutBio',
      title: 'About bio',
      description:
        'The paragraphs under "About me" on the About page (currently the intro line plus two more). Each paragraph is one block - add, remove or reorder blocks freely, no code change needed either way.',
      type: 'array',
      of: [
        {
          type: 'block',
          // Current copy is plain paragraphs with a couple of underlined words (e.g. "creativity",
          // "quality") - no headings and no lists anywhere in it, so both are left out rather than
          // defaulting to Sanity's full block kitchen sink. Easy to widen later if that changes.
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Underline', value: 'underline'},
            ],
            annotations: [],
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'contactHeading',
      title: 'Contact heading',
      description:
        'The main heading on the Contact page (currently "Let\u2019s Connect and Create"). Content only - the page supplies its own "Contact" label above it and the styled accent after it.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contactImage',
      title: 'Contact image',
      description: 'The photo beside the Contact page heading (currently a reused project screenshot).',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describes the image for screen readers and SEO. Currently empty on the live site - required here so that gap can\u2019t carry forward.',
          validation: (Rule) => Rule.required(),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      description: 'Shown in the footer. Enter it on two lines the way it should be displayed - line breaks are kept as typed.',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      description: 'Shown as icons in the footer\u2019s floating dock, in this order.',
      type: 'array',
      of: [{type: 'socialLink'}],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'resumeUrl',
      title: 'Resume URL',
      description:
        'Wherever the resume is hosted (Google Drive, etc., same as today) - a link, not a file uploaded here. See the plan doc for why this stays a URL instead of a Sanity file asset.',
      type: 'url',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
