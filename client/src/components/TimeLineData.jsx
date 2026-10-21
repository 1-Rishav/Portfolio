import { Timeline } from "./ui/timeline";
import { FollowerPointerCard } from "./ui/Follower_Pointer";
import { CardSpotlight } from "./ui/card_spotlight";
import { PortableText } from "@portabletext/react";
import images from '../assets/index'
import { useSanityList } from '../hooks/use_sanity_list'
import { useSanityDocument } from '../hooks/use_sanity_document'
import { resolveImage } from '../utils/sanityClient'

// 4.8. No $params needed for the entries themselves (every timelineProject document belongs here, same as
// 4.7's heroProject); the sectionIntro query filters to the one home-timeline instance, same pattern as 4.6.
const TIMELINE_QUERY = `*[_type == "timelineProject"] | order(displayOrder asc){title, description, highlights}`
const TIMELINE_INTRO_QUERY = `*[_type == "sectionIntro" && sectionKey == "home-timeline"][0]{journeyStartYear, journeyEndYear}`

// Renders `description` (the schema's portable text) back into the same markup the 4 entries already used.
// Two deliberate choices here, not oversights:
// - The "GitHub, Vercel & Render" entry's 3 checklist lines become one bullet-list block instead of a special
//   case, matching the schema's own reasoning (its comment: every entry gets the same two fields). The ✅ is
//   added by listItem.bullet, not stored as text in each bullet - it's a presentation choice (which bullet
//   marker this list uses), not editorial content, same content-vs-presentation split as every other styling
//   decision in this migration (architecture decision 12).
// - Every entry's last paragraph originally had its own margin - mb-8 before an image grid, mb-4 before the
//   checklist (which supplied the rest of that spacing itself via its own wrapper). A single block.normal
//   renderer can't tell which came after without extra bookkeeping for a ~4px visual difference nobody would
//   notice; used mb-8 uniformly rather than add that complexity for it.
const descriptionComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-8">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => <div className="mb-8">{children}</div>,
  },
  listItem: {
    bullet: ({ children }) => (
      <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg  md:text-xl">
        ✅ {children}
      </div>
    ),
  },
}

// Fallback description text, as real Portable Text blocks (same shape useSanityList would return from
// Sanity) - transcribed directly from the pre-4.8 JSX, trailing spaces before periods included, same
// byte-for-byte-fallback discipline as every fallback built so far in this category.
const timelineFallback = [
  {
    title: 'HTML,CSS & JavaScript',
    description: [
      {
        _type: 'block', _key: 't1-p1', style: 'normal',
        children: [{ _type: 'span', _key: 't1-p1-s1', marks: [], text: 'The foundation of my journey started with HTML, CSS, and JavaScript. I have worked on projects that focus on clean design, and performance optimization .' }],
      },
    ],
    highlights: [
      { image: null, link: 'https://fastest-100.netlify.app/' },
      { image: null, link: 'https://lucky-20.netlify.app/' },
      { image: null, link: 'https://brand-fusion.netlify.app/' },
      { image: null, link: 'https://veggiefeast.netlify.app/' },
    ],
  },
  {
    title: 'React.js',
    description: [
      {
        _type: 'block', _key: 't2-p1', style: 'normal',
        children: [{ _type: 'span', _key: 't2-p1-s1', marks: [], text: 'With React.js,' }],
      },
      {
        _type: 'block', _key: 't2-p2', style: 'normal',
        children: [{ _type: 'span', _key: 't2-p2-s1', marks: [], text: 'I have developed interactive, high-performance web applications with reusable components and efficient state management .' }],
      },
    ],
    highlights: [
      { image: null, link: 'https://xoxo-battle.netlify.app/' },
      { image: null, link: 'https://invest-meter.netlify.app/' },
      { image: null, link: 'https://task-nest-1.netlify.app/' },
      { image: null, link: 'https://geopix.netlify.app/' },
    ],
  },
  {
    title: 'Node.js , MongoDB & PostgreSQL',
    description: [
      {
        _type: 'block', _key: 't3-p1', style: 'normal',
        children: [{ _type: 'span', _key: 't3-p1-s1', marks: [], text: 'With Node.js,' }],
      },
      {
        _type: 'block', _key: 't3-p2', style: 'normal',
        children: [{ _type: 'span', _key: 't3-p2-s1', marks: [], text: 'I create efficient server-side applications, while MongoDB and PostgreSQL help me manage structured and unstructured data effectively .' }],
      },
    ],
    highlights: [
      { image: null, link: 'https://gem-x.vercel.app/' },
      { image: null, link: 'https://quick-fundz.vercel.app/' },
    ],
  },
  {
    title: 'GitHub, Vercel & Render',
    description: [
      {
        _type: 'block', _key: 't4-p1', style: 'normal',
        children: [{ _type: 'span', _key: 't4-p1-s1', marks: [], text: 'Ensuring smooth deployment and maintaining code integrity are crucial aspects of my workflow .' }],
      },
      {
        _type: 'block', _key: 't4-b1', style: 'normal', listItem: 'bullet', level: 1,
        children: [{ _type: 'span', _key: 't4-b1-s1', marks: [], text: 'Version control and collaborate efficiently' }],
      },
      {
        _type: 'block', _key: 't4-b2', style: 'normal', listItem: 'bullet', level: 1,
        children: [{ _type: 'span', _key: 't4-b2-s1', marks: [], text: 'Deploy scalable and high-performance applications with ease.' }],
      },
      {
        _type: 'block', _key: 't4-b3', style: 'normal', listItem: 'bullet', level: 1,
        children: [{ _type: 'span', _key: 't4-b3-s1', marks: [], text: 'My projects focus on seamless CI/CD, reliability, and optimized hosting .' }],
      },
    ],
    highlights: [],
  },
]

// Index-aligned with timelineFallback above - the local image fallback for each entry's highlights (its
// `highlights[i].image` is null in the fallback itself, same null-placeholder pattern as every image field
// wired so far: 4.2/4.5/4.6/4.7 all keep the real local image reference one step removed, in a parallel
// array, rather than inside the object useSanityList's fallback itself carries).
const timelineHighlightLocalImages = [
  [images.Project5, images.Project6, images.Project3, images.Project4],
  [images.Project7, images.Project8, images.Project9, images.Project10],
  [images.Project2, images.Project1],
  [],
]

export function TimelineDemo() {
  const docs = useSanityList(TIMELINE_QUERY, timelineFallback)
  const intro = useSanityDocument(TIMELINE_INTRO_QUERY, { journeyStartYear: 2022, journeyEndYear: 2025 })

  const data = docs.map((doc, entryIndex) => {
    const localImages = timelineHighlightLocalImages[entryIndex] ?? []
    const highlights = (doc.highlights ?? []).map((h, hIndex) => ({
      ...resolveImage(h.image, localImages[hIndex], 'startup template'),
      link: h.link,
    }))

    return {
      title: doc.title,
      content: (
        <div>
          <PortableText value={doc.description} components={descriptionComponents} />
          {highlights.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((h, i) => {
                const card = (
                  <FollowerPointerCard>
                    <CardSpotlight>
                      <img
                        src={h.src}
                        alt={h.alt}
                        width={500}
                        height={500}
                        className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                      />
                    </CardSpotlight>
                  </FollowerPointerCard>
                )
                // h.link empty is the schema's own "plain, non-clickable image" case (linkedImage.link) -
                // today's fallback data always has a link, so this branch isn't exercised yet, but a real
                // editor leaving a highlight's link blank shouldn't produce a dead/no-op anchor.
                return h.link ? (
                  <a key={i} href={h.link} target="_blank" rel="noopener noreferrer">{card}</a>
                ) : (
                  <div key={i}>{card}</div>
                )
              })}
            </div>
          )}
        </div>
      ),
    }
  })

  return (<>
    <Timeline data={data} journeyStartYear={intro.journeyStartYear} journeyEndYear={intro.journeyEndYear} />
  </>);
}
