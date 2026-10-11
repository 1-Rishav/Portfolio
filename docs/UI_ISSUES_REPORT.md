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

---

## Carried forward from earlier sessions (already logged in `README.md`, listed here only so this is a complete picture in one place)

- **Session 8:** the footer's black section uses a fixed `h-[91vh]` on mobile, not content-driven height. Not confirmed broken, but flagged as a latent risk on unusually short/landscape viewports.
- **Session 7:** the mobile floating-dock's collapse toggle button is commented out in `float_dock.jsx` - currently permanent, not a bug, but worth a decision either way.

---

## Not yet checked

This pass focused on global scroll behavior and the components most likely
to affect it (modals, fixed overlays, global CSS). It did **not** cover:
responsive layout at every breakpoint, color-contrast/accessibility,
animation performance under real network conditions, or every individual
page's visual polish. Flagging the boundary of this audit rather than
implying more was checked than was.
