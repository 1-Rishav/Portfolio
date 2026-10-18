import { FloatingDock } from "../components/ui/float_dock";
import { FaGithub, FaXTwitter, FaInstagram, FaYoutube, FaDribbble, FaBehance } from "react-icons/fa6";
import { SiStandardresume } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { useSiteSettings } from "../hooks/use_site_settings";

const ICON_CLASS = "h-full w-full text-neutral-500 dark:text-neutral-300";

// One entry per option in the socialLink schema (2.6/objects/socialLink.js), not just the 3 platforms live
// today - the schema's own comment promises that adding a platform already on its list is a content change,
// not a code change, so every option needs an icon here now for that to actually be true, not just true for
// linkedin/github/twitter.
const PLATFORM_META = {
  linkedin: { title: "Linkedin", Icon: FaLinkedin },
  github: { title: "GitHub", Icon: FaGithub },
  twitter: { title: "Twitter", Icon: FaXTwitter },
  instagram: { title: "Instagram", Icon: FaInstagram },
  youtube: { title: "YouTube", Icon: FaYoutube },
  dribbble: { title: "Dribbble", Icon: FaDribbble },
  behance: { title: "Behance", Icon: FaBehance },
};

export function FloatingDockDemo() {
  const settings = useSiteSettings();

  // Mapped generically, in whatever order/count settings.socialLinks actually holds - not three fixed
  // lookups for linkedin/github/twitter specifically, which would silently ignore a platform the editor adds
  // later despite the schema saying that should just work. An unrecognized platform (shouldn't happen, given
  // the schema's closed list, but not assumed) is dropped rather than rendered broken.
  const socialItems = settings.socialLinks
    .map((link) => {
      const meta = PLATFORM_META[link.platform];
      if (!meta) return null;
      return { title: meta.title, icon: <meta.Icon className={ICON_CLASS} />, href: link.url };
    })
    .filter(Boolean);

  // Resume stays hardcoded - that's 3.6, not this task. Appended after the social links rather than
  // reinserted at its current 2nd-of-4 position: that position only has meaning relative to today's fixed
  // 3-link order, which this change deliberately makes variable, so there is no single "right" index to put
  // it back at that would still be correct once a 4th or 5th social link exists.
  const links = [
    ...socialItems,
    {
      title: "Resume",
      icon: (
        <SiStandardresume className={ICON_CLASS} />
      ),
      href: settings.resumeUrl,
    },
  ];
  return (
    (<div className="flex items-center justify-center h-fit w-full md:h-[5rem] md:w-full">
      <FloatingDock
        // only for demo, remove for production
        //mobileClassName="translate-y-20"
        items={links} />
    </div>)
  );
}
