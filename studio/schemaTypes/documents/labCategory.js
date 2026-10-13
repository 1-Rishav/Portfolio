import {defineField, defineType} from 'sanity'

// One row on the Labs page (Category 7, new feature - the Labs page is currently a placeholder, nothing to
// migrate). Category 7's own notes describe the page as "rows grouped by category, each row a horizontal
// set of variant cards" - this document is one row/category (e.g. "Authentication Approaches", "State
// Management"); `lab` documents (next) reference one of these each.
//
// A real document type, not a closed list of category names on `lab` itself: categories are expected to
// grow as new kinds of mini-projects get added (the whole point of this page, per how it was described -
// a showcase that keeps growing), and a closed list would mean a schema edit for every new one. A plain
// free-text string field on `lab` was also considered and rejected: nothing would stop "Authentication",
// "Auth", and "authentication" from being typed across different entries and silently splitting into three
// rows instead of grouping into one. A reference to a real document means the category is picked from a
// list that already exists, not retyped per entry.
export default defineType({
  name: 'labCategory',
  title: 'Lab Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The row heading, e.g. "Authentication Approaches".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      description: 'Lower numbers show first, top to bottom.',
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
    select: {title: 'name', order: 'displayOrder'},
    prepare({title, order}) {
      return {title, subtitle: `#${order}`}
    },
  },
})
