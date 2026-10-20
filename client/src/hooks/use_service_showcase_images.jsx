import { useSanityList } from './use_sanity_list'
import { resolveImage } from '../utils/sanityClient'
import images from '../assets/index'

// 4.5. Develop_Service.jsx's old DevelopImages and Design_Service.jsx's old ProjectImages were byte-identical
// (serviceShowcaseProject's own schema comment: "the exact same 12 images in the exact same order... genuinely
// one set of content shown twice, not two sets that happen to look alike"). Fetching and resolving it here,
// once, rather than repeating the same query string and the same resolveImage mapping in both page files,
// keeps that "one list, not two" fact true in the code too - a page file importing this hook has no way to
// accidentally drift its own copy out of sync with the other page's.
const SERVICE_SHOWCASE_QUERY = `*[_type == "serviceShowcaseProject"] | order(displayOrder asc){image}`

const fallbackImages = [
  images.Project1_i,
  images.Project2,
  images.GemX_Logo,
  images.Project1,
  images.Quick_Logo,
  images.Project3,
  images.Project4,
  images.Project5,
  images.Project6,
  images.Project7,
  images.Project8,
  images.Project9,
]

export function useServiceShowcaseImages() {
  const docs = useSanityList(SERVICE_SHOWCASE_QUERY, fallbackImages.map(() => ({ image: null })))
  return docs.map((doc, index) => resolveImage(doc.image, fallbackImages[index], `custom-img-${index}`))
}
