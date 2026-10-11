// One entry per Sanity schema type - document types and the reusable object types they use. Category 2 of
// docs/CMS_INTEGRATION_PLAN.md adds these one document type at a time; object types used by only one
// document live alongside it conceptually but get their own file under objects/ once another document
// needs the same shape (or, as with socialLink/linkedImage/techStackItem, when a named type is what gives
// it a sane Studio preview). shared/ holds non-type helpers (plain field/ordering/preview factories) that
// more than one document's own defineType spreads in, to avoid duplicating an identical shape twice.

// Documents
import siteSettings from './documents/siteSettings'
import heroProject from './documents/heroProject'
import timelineProject from './documents/timelineProject'
import featuredProject from './documents/featuredProject'
import serviceGroup from './documents/serviceGroup'
import serviceShowcaseProject from './documents/serviceShowcaseProject'
import projectHighlight from './documents/projectHighlight'
import skillTickerItem from './documents/skillTickerItem'
import web3TickerItem from './documents/web3TickerItem'
import faqItem from './documents/faqItem'
import labCategory from './documents/labCategory'
import lab from './documents/lab'
import sectionIntro from './documents/sectionIntro'

// Objects
import socialLink from './objects/socialLink'
import linkedImage from './objects/linkedImage'
import techStackItem from './objects/techStackItem'

export const schemaTypes = [
  // Documents
  siteSettings,
  heroProject,
  timelineProject,
  featuredProject,
  serviceGroup,
  serviceShowcaseProject,
  projectHighlight,
  skillTickerItem,
  web3TickerItem,
  faqItem,
  labCategory,
  lab,
  sectionIntro,

  // Objects
  socialLink,
  linkedImage,
  techStackItem,
]
