import {defineField, defineType} from 'sanity'

// One labeled group of services on the Develop or Design service page - what the plan calls `serviceItem`,
// renamed here to `serviceGroup` because the real shape turned out to be one level up from an individual
// service. Develop_Service.jsx and Design_Service.jsx each render exactly 2 of these via the same
// <FeatureComponent heading=... subheading=... service={array} end=... /> call: Develop/Support on one page,
// Design/Other on the other - heading, subheading, the list of service names, and even the trailing accent
// character all travel together as one editorial unit, not as a floating list plus a disconnected heading.
// A flat "one document per service name" design (closer to `serviceItem`'s literal name) was considered and
// rejected: the 4 groups are fixed in number and the heading/subheading content would have had nowhere
// natural to live without a second document type just to hold them next to the list they describe.
//
// The subheading's trailing accent char turned out to be real content, not styling, despite looking exactly
// like the heading accents left out elsewhere (architecture decision 12): Develop/Support/Design all end in
// "." but Other ends in "!" - FeatureComponent takes it as an `end` prop, not a hardcoded character, so it
// genuinely varies per group and belongs in the schema.
export default defineType({
  name: 'serviceGroup',
  title: 'Service Group',
  type: 'document',
  fields: [
    defineField({
      name: 'page',
      title: 'Page',
      description: 'Which service page this group appears on.',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          {title: 'Develop Service page', value: 'develop'},
          {title: 'Design Service page', value: 'design'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      description: 'E.g. "Develop", "Support", "Design", "Other".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'accentChar',
      title: 'Accent character',
      description: 'The styled character shown right after the subheading - "." on most groups, "!" on Design\u2019s "Other" group today.',
      type: 'string',
      initialValue: '.',
      validation: (Rule) => Rule.required().max(3),
    }),
    defineField({
      name: 'services',
      title: 'Services',
      description: 'The individual service names listed under this group, in display order.',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first, within this page.',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
  ],
  orderings: [
    {
      title: 'Page, then display order',
      name: 'pageDisplayOrderAsc',
      by: [
        {field: 'page', direction: 'asc'},
        {field: 'displayOrder', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'heading', page: 'page', order: 'displayOrder', count: 'services.length'},
    prepare({title, page, order, count}) {
      return {title, subtitle: `${page} \u00b7 #${order} \u00b7 ${count || 0} services`}
    },
  },
})
