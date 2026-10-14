import {defineType} from 'sanity'
import {tickerImageSchema} from '../shared/tickerImage'

// One image in the About page's skill ticker (the right-moving strip under "Skill is Best Way to Know
// About." - About.jsx's `webImages` array, 12 images today). The heading above it, and the "Let's Connect"
// button next to it, stay in the component: the heading per architecture decision 12, the button because
// it's a fixed site-navigation link (to /contact), not editorial content.
export default defineType({
  name: 'skillTickerItem',
  title: 'Skill Ticker Image',
  type: 'document',
  ...tickerImageSchema(),
})
