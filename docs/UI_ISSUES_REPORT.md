# UI Issues Report

Found during this session's project-wide audit. Nothing here has been
touched - these are for discussion first, per how this project handles
findings (list, then explicit go-ahead, then fix).

---

## New findings, this session

### 1. Scrollbars are hidden site-wide, not just styled
`client/src/App.css`:
```css
::-webkit-scrollbar {
  display: none;
}
```
This removes the scrollbar (not just re-skins it) on every scrollable
element in WebKit browsers (Chrome, Safari, Edge, and their mobile
versions) - the whole page included. Scrolling itself usually still works
without a visible scrollbar, but on a fixed-height inner panel with its own
`overflow-y-auto`, a viewer has no visual cue that panel scrolls at all,
which can look and feel exactly like "this doesn't scroll" even when it
technically does. Worth deciding deliberately (keep as an intentional style
choice, or restore a thin scrollbar) rather than leaving as a leftover.

### 2. Body scroll can get permanently stuck after leaving a page mid-interaction
`client/src/components/ui/apple_card_carousel.jsx` (`Card` component,
backs the Home page's featured-project cards): opening a card sets
`document.body.style.overflow = "hidden"`, correctly reset to `"auto"` on
Escape, outside click, or the close button. But if the component
**unmounts while a card is still open** - e.g. the viewer clicks a nav
link while a card is expanded, navigating away without closing it first -
the effect's cleanup only removes the keydown listener; it never resets
`document.body.style.overflow`. The new page then loads with the body
scroll still locked, with nothing left on the page able to unlock it short
of a manual reload. This is a genuine bug, not a style question - the fix
is a one-line addition to the effect's cleanup function, resetting overflow
on unmount as well as on close.

### 3. Footer's "About / Resume / FAQs / Contact" nav list has no real links
`client/src/components/Footer_BeamsCollision.jsx` (the two footer nav
columns: `About`, `Resume`, `FAQs`, `Contact` and `MERN Project`, `PERN
Project`, `Web Design`, `Web Development`): every item is a plain `<li>`
with no `href`, `onClick`, or router `Link` - styled as clickable
(`cursor-pointer`) but functionally dead. Noticed while reading this file
for the `siteSettings` schema (Category 2.6); the real resume and social
links turned out to live in `Float_Icon.jsx`'s floating dock instead, not
in this nav list.

### 4. About page's "Exploring" button has no `href` at all
`client/src/components/Navigation/About.jsx` (the amber "Exploring"
button next to the web3 image ticker, around line 362): unlike the
"Let's Connect" button right above it (which links to `/contact`), this
`<a>` tag has no `href` attribute whatsoever - not even a placeholder
`"#"`. Styled and sized identically to a working link, but clicking it
does nothing. Noticed while reading this file for the `skillTickerItem`/
`web3TickerItem` schemas (Category 2.4).

### 5. Footer phone number is formatted "91+ ..." instead of "+91 ..."
`client/src/components/Footer_BeamsCollision.jsx`: the phone number reads
`91+ 8271228935` - the country code and the `+` are swapped from the
standard `+91 8271228935` format. Beyond looking wrong, a visitor who
copies this exact text into a dialer may not get a valid number. Noticed
while transcribing the exact current value into `SiteSettingsFallback.js`
for Category 3.1 - carried over unchanged into the fallback (a data-source
migration isn't the moment to silently correct it), so it's still showing
today's exact text either way, logged here instead.

### 6. About bio has a few missing/stray spaces
`client/src/components/Navigation/About.jsx`: the bio text reads
"Hi,I'm an expert..." and "...professional services.I create..." with no
space after the comma and the period, and two sentences end "quality ."
and "impact ." with a stray space before the period. Minor, but noticed
while transcribing the exact current text into `SiteSettingsFallback.js`
for Category 3.1 and carried over unchanged for the same reason as #5.

---

## Carried forward from earlier sessions (already logged in `README.md`, listed here only so this is a complete picture in one place)

- **Session 8:** the footer's black section uses a fixed `h-[91vh]` on mobile, not content-driven height. Not confirmed broken, but flagged as a latent risk on unusually short/landscape viewports.
- **Session 7:** the mobile floating-dock's collapse toggle button is commented out in `float_dock.jsx` - currently permanent, not a bug, but worth a decision either way.

---

## Found during Category 4 (not from the original audit above)

### 7. Design page's heading has a leading space: " Design"
`client/src/components/Navigation/Design_Service.jsx`, the first
`FeatureComponent` call (`heading=" Design"`): every other `FeatureComponent`
heading across both service pages (`Develop`, `Support`, `Other`) has no
leading space - this one does, visible as the heading sitting very slightly
off its left edge compared to the other three. Noticed while migrating this
value into `Develop_DesignData.js` for Category 4.4's `serviceGroup` wiring;
carried over unchanged into the new fallback data for the same reason as #5/
#6 above - a data-source migration isn't the moment to silently correct
content, so it still renders exactly as it does today either way.

### 8. Home hero card title has a leading space: " VeggieFeast"
`client/src/components/HeroParalax.jsx`, the `products` array (hero
parallax card #6) - the same pattern as #7: every other hero card title
(`Rishav` x4, `GemX`, `QuickFundz`, `Brand Fusion`) has no leading space,
this one does. Shows briefly on hover as the card's title. Noticed while
migrating `products` for Category 4.7's `heroProject` wiring; carried over
unchanged for the same reason as #7.

### 9. Timeline entry title has a space before its comma: "Node.js , MongoDB & PostgreSQL"
`client/src/components/TimeLineData.jsx`, the 3rd timeline entry's title -
every other title in the same list (`HTML,CSS & JavaScript`, `React.js`,
`GitHub, Vercel & Render`) punctuates normally; this one has `Node.js ,`
with a space before the comma. Shows on both the desktop and mobile
heading for this entry. Noticed while migrating `timelineFallback` for
Category 4.8's `timelineProject` wiring; carried over unchanged for the
same reason as #7/#8.

### 10. Brand-Fusion's description is missing a space: "...responsive layouts.Its real purpose..."
`client/src/components/Carousel.jsx`'s `featuredProjectsFallback` (formerly
`ProjectDescription.jsx`'s `Advertise` component) - "layouts.Its" runs the
sentence into the next one with no space after the period, unlike every
other description in the same carousel. Shows in the opened card for the
Brand-Fusion project. Noticed while migrating this description for Category
4.9's `featuredProject` wiring; carried over unchanged for the same reason
as #7/#8/#9.

---

## Not yet checked

This pass focused on global scroll behavior and the components most likely
to affect it (modals, fixed overlays, global CSS). It did **not** cover:
responsive layout at every breakpoint, color-contrast/accessibility,
animation performance under real network conditions, or every individual
page's visual polish. Flagging the boundary of this audit rather than
implying more was checked than was.
