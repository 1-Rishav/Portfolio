import {defineField, defineType} from 'sanity'

// One question in the Contact page's FAQ accordion (FAQData.js's `faq` array today - 6 entries). No
// surrounding heading to consider this time: FAQ.jsx renders straight into a HeroUI <Accordion> with no
// title text in or around it, unlike every other section handled so far.
export default defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      description: 'The accordion row\u2019s title - named "question" here rather than the data file\u2019s current "title", which is what it actually is.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
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
    select: {title: 'question', order: 'displayOrder'},
    prepare({title, order}) {
      return {title, subtitle: `#${order}`}
    },
  },
})
