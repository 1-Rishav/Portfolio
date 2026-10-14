import {defineField} from 'sanity'

// Shared shape for a plain decorative-image ticker document - today used identically by skillTickerItem and
// web3TickerItem (About.jsx's `webImages` and `Web3Images` arrays: pure images, no title or link, same as
// 2.2's serviceShowcaseProject). Lives under shared/, not objects/, because it is not itself a registered
// Sanity type - just a fields/orderings/preview factory the two document files spread into their own
// defineType call, so a future change to this shape (e.g. an optional caption) only has to happen once.
// Not reused for serviceShowcaseProject itself: that type already existed before this duplication appeared,
// and backfilling it into a shared helper now would touch a file with no real change behind it.
export function tickerImageSchema() {
  return {
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
            description: 'Replaces today\u2019s generic "custom-img-N" alt text.',
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
  }
}
