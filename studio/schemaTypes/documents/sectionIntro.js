import {defineField, defineType} from 'sanity'

// Consolidates three separate findings from 2.1 and 2.2 into one schema instead of three ad-hoc ones: the
// Home hero's tagline paragraph, the Home timeline's intro paragraph (plus its heading's year range - see
// below), Develop's rotating hero image set, and Design's hero video. Named `sectionIntro` rather than the
// originally-proposed `pageHero`: the timeline instance is a section within the Home page, not the page's
// own hero, so "page" undersold what this actually covers once all four instances were worked through.
//
// The four instances need genuinely different fields - a home hero has a tagline and no media, a develop
// hero has images and no tagline - so every field here is optional and `sectionKey` says which instance a
// document is. A closed list, not free text: unlike `labCategory`, this set is fixed by where it's fetched
// in the code (a 5th consumer needs a code change to read it regardless), so nothing is gained by leaving
// it open, and a closed list rules out a typo quietly creating an unfetched, invisible document.
//
// `journeyStartYear`/`journeyEndYear` exist for exactly one reason: the timeline's own heading, "My Tech
// Journey (2022-2025)", is otherwise exactly the kind of permanent styled heading left out everywhere else
// (architecture decision 12) - but unlike those, it embeds a literal date range that will become factually
// wrong on a schedule nothing else here tracks, not just stylistically dated. Rather than make the whole
// heading editable (which would mean duplicating "My Tech Journey" as content for no reason) or leave a
// known future-wrong date as a permanent hardcoded string, only the two numbers come out as fields; "My
// Tech Journey (" and ")" stay in the component. `journeyEndYear` is left optional on purpose, not just
// because this type's fields all are: leaving it empty is how an editor says the journey is still ongoing,
// which the frontend can render as "2022-Present" instead of a fixed year that would just go stale again.
export default defineType({
  name: 'sectionIntro',
  title: 'Section Intro',
  type: 'document',
  fields: [
    defineField({
      name: 'sectionKey',
      title: 'Section',
      type: 'string',
      options: {
        list: [
          {title: 'Home - Hero', value: 'home-hero'},
          {title: 'Home - Timeline', value: 'home-timeline'},
          {title: 'Develop Service - Hero', value: 'develop-hero'},
          {title: 'Design Service - Hero', value: 'design-hero'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'Used by Home - Hero and Home - Timeline. Leave empty for the two Service hero entries.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'journeyStartYear',
      title: 'Journey start year',
      description: 'Used only by Home - Timeline, for the "My Tech Journey (start\u2013end)" heading.',
      type: 'number',
    }),
    defineField({
      name: 'journeyEndYear',
      title: 'Journey end year',
      description: 'Used only by Home - Timeline. Leave empty to show the journey as ongoing ("2022\u2013Present") instead of a fixed year that will just go stale again.',
      type: 'number',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      description: 'Used only by Develop Service - Hero, for its rotating image set. Leave empty otherwise.',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string', validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({
      name: 'video',
      title: 'Video URL',
      description: 'Used only by Design Service - Hero. A full absolute URL, same reasoning as projectHighlight.video (2.3) - today\u2019s relative /ProjectVideos/ path only resolves because it\u2019s served from the site\u2019s own domain.',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {title: 'sectionKey'},
    prepare({title}) {
      return {title: title || '(no section set)'}
    },
  },
})
