import {defineType} from 'sanity'
import {tickerImageSchema} from '../shared/tickerImage'

// One image in the About page's web3/"Exploring" ticker (the left-moving strip - About.jsx's `Web3Images`
// array, 10 images today). The "Exploring" button beside it has no `href` at all on the live site - a dead
// link, unrelated to this task, logged in the UI issues report rather than fixed here.
export default defineType({
  name: 'web3TickerItem',
  title: 'Web3 Ticker Image',
  type: 'document',
  ...tickerImageSchema(),
})
