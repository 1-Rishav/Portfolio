// Default content for siteSettings (architecture decision 13, docs/CMS_INTEGRATION_PLAN.md): read directly
// out of About.jsx, Contact.jsx, Footer_BeamsCollision.jsx and Float_Icon.jsx so this is exactly what the
// site shows today, not an approximation. Shaped exactly like a real siteSettings document - including
// aboutBio as genuine Portable Text blocks, not a plain string - so every consumer renders through the same
// code path whether the data came from Sanity or from here (the whole point of the pattern: a configured
// and an unconfigured site can never visually drift apart).
//
// Two spots keep today's exact wording, typos included, rather than silently correcting them: the bio's
// missing space ("services.I") and the stray space before two of its sentence-ending periods ("quality .",
// "impact ."). Fixing them here would be a real, if small, visual change riding along on a data-source swap
// - flagged in UI_ISSUES_REPORT.md instead, for a decision made on purpose rather than as a side effect of
// this migration.
//
// aboutBio[0] does not start with "Hi," - found while wiring this up in 3.2: that word has its own
// text-blue-800 styling in About.jsx, separate from the rest of the sentence and from every other mark this
// schema defines (strong/em/underline, none of them color), so it is presentation kept in the component
// (architecture decision 12) like every other heading-adjacent accent, not content. The original 3.1 version
// of this file had it wrong, included as plain text inside the block; corrected here instead of carried
// forward, since getting it right now is what the fallback is for.
export const siteSettingsFallback = {
  aboutBio: [
    {
      _type: 'block',
      _key: 'bio1',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'bio1-0',
          marks: [],
          text:
            "I'm an expert web designer and developer offering professional services.I create solutions that align with your vision and   business goals",
        },
      ],
    },
    {
      _type: 'block',
      _key: 'bio2',
      style: 'normal',
      markDefs: [],
      children: [
        {_type: 'span', _key: 'bio2-0', marks: [], text: 'With years of hands-on experience in web development, I bring '},
        {_type: 'span', _key: 'bio2-1', marks: ['underline'], text: 'creativity'},
        {_type: 'span', _key: 'bio2-2', marks: [], text: ', technical expertise, and a strong commitment to '},
        {_type: 'span', _key: 'bio2-3', marks: ['underline'], text: 'quality '},
        {_type: 'span', _key: 'bio2-4', marks: [], text: '.'},
      ],
    },
    {
      _type: 'block',
      _key: 'bio3',
      style: 'normal',
      markDefs: [],
      children: [
        {_type: 'span', _key: 'bio3-0', marks: [], text: 'I have worked with startups, entrepreneurs, and growing businesses. My approach is '},
        {_type: 'span', _key: 'bio3-1', marks: ['underline'], text: 'flexible'},
        {_type: 'span', _key: 'bio3-2', marks: [], text: ' and dedicated to delivering results that make an impact .'},
      ],
    },
  ],

  // Content only - Contact.jsx supplies its own "Contact" label and the styled accent after this (2.6).
  // One deliberate behavior change: today's "Let\u2019s Connect" / "and Create" are two separately hardcoded
  // pieces either side of a forced <br/>. As one field there is nothing to break the line on anymore, so the
  // component now lets it wrap naturally instead - a small, intentional simplification, not an oversight.
  contactHeading: "Let\u2019s Connect and Create",

  // No Sanity asset in the fallback case - resolved via resolveImage() in sanityClient.js, which falls back
  // to this local import exactly as Contact.jsx already does today.
  contactImageAlt: 'Project screenshot',

  phone: '91+ 8271228935',
  email: 'rajrishav011@gmail.com',
  address: 'AnadamNagar Mahalaxmi PG\nRamapuram, Chennai',

  socialLinks: [
    {platform: 'linkedin', url: 'https://www.linkedin.com/in/rishav-raj-ab2893253/'},
    {platform: 'github', url: 'https://github.com/1-Rishav'},
    {platform: 'twitter', url: 'https://x.com/11Rishav'},
  ],

  resumeUrl: 'https://drive.google.com/file/d/1ny2bUWPwPEq94mlI9AOGQTIaubSnVgYC/view?usp=drive_link',
}
