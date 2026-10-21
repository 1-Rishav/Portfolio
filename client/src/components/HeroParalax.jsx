"use client";
import { HeroParallax } from "../components/ui/hero_paralax";
import images from '../assets/index'
import { useSanityList } from '../hooks/use_sanity_list'
import { resolveImage } from '../utils/sanityClient'

// 4.7: no $params needed (no page/sectionKey filter - every heroProject document belongs here).
const HERO_PRODUCTS_QUERY = `*[_type == "heroProject"] | order(displayOrder asc){title, link, thumbnail}`

export function HeroParallaxDemo() {
  // title/link pass straight through either way - the fallback's items already carry the real fallback
  // values for both, so there is nothing source-dependent to branch on there, unlike thumbnail, where the
  // fallback and a real Sanity image are two genuinely different shapes and resolveImage is what reconciles
  // them (same pattern as every image field wired so far: 4.2, 4.5, 4.6).
  const docs = useSanityList(HERO_PRODUCTS_QUERY, products.map((p) => ({ title: p.title, link: p.link, thumbnail: null })))
  const resolvedProducts = docs.map((doc, index) => ({
    id: index + 1,
    title: doc.title,
    link: doc.link,
    thumbnail: resolveImage(doc.thumbnail, products[index].thumbnail, doc.title),
  }))
  return <HeroParallax products={resolvedProducts} />;
}
export const products = [
  {
    id:1,
    title: "Rishav",
    link: null,
    thumbnail:
      images.Rishav1,
  },
  {
    id:2,
    title: "GemX",
    link: "https://gem-x.vercel.app/",
    thumbnail:
      images.Project2,
  },
  {
    id:3,
    title: "Rishav",
    link: null,
    thumbnail:
      images.Rishav3,
  },

  {
    id:4,
    title: "QuickFundz",
    link: "https://quick-fundz.vercel.app/",
    thumbnail:
      images.Project1,
  },
  {
    id:5,
    title: "Rishav",
    link: null,
    thumbnail:
      images.Rishav5,
  },
  {
    id:6,
    title: " VeggieFeast",
    link: "https://veggiefeast.netlify.app/",
    thumbnail:
      images.Project4,
  },

  {
    id:7,
    title: "Rishav",
    link: null,
    thumbnail:
    images.Rishav6,
  },
  {
    id:8,
    title: "Brand Fusion",
    link: "https://brand-fusion.netlify.app/",
    thumbnail:
      images.Project3,
  },
  /*{
    title: "Tailwind Master Kit",
    link: "https://tailwindmasterkit.com",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png",
  },
  {
    title: "SmartBridge",
    link: "https://smartbridgetech.com",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/smartbridge.png",
  },
 */
];
