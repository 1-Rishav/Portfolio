import PropTypes from 'prop-types'
import { CodeBlockDemo } from "../Code_Block";

// 4.9: replaces 4 near-identical exports (GemX/QuickFundz/Advertise/GeoPix) with one component driven by
// featuredProject's fields - the schema's own comment identifies this as one identical layout with different
// data, confirmed by reading all 4: same wrapper, same p/span structure, same "GitHub:"/"WebSite:" labels,
// only the description/URLs/image actually differed. Those 2 labels and the bold-span styling stay hardcoded
// here - uniform presentation applied to every project, not per-project editorial content (architecture
// decision 12) - while githubUrl/websiteUrl are each optional per the schema, so a project missing one (none
// of today's 4 do) simply omits that line instead of rendering an empty link.
export function FeaturedProjectContent({ description, githubUrl, websiteUrl, image }) {
  return (
    <div className="bg-[#F5F5F7] p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-neutral-600 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        <span className="font-bold text-neutral-700">{description}</span>{" "}
        {githubUrl && (
          <>
            <br />GitHub:
            <CodeBlockDemo name={'GitHub Link'} syntax={githubUrl} />
          </>
        )}
        {websiteUrl && (
          <>
            WebSite:
            <CodeBlockDemo name={'WebSite Link'} syntax={websiteUrl} />
          </>
        )}
      </p>
      <img
        src={image?.src}
        alt={image?.alt}
        height="500"
        width="500"
        className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain mt-10" />
    </div>
  );
}

FeaturedProjectContent.propTypes = {
  description: PropTypes.string,
  githubUrl: PropTypes.string,
  websiteUrl: PropTypes.string,
  image: PropTypes.shape({ src: PropTypes.string, alt: PropTypes.string }),
};
