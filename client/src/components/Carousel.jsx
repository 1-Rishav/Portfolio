"use client";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Carousel, Card } from "../components/ui/apple_card_carousel";
import images from '../assets/index'
import { FeaturedProjectContent } from "./Form_&_Features/ProjectDescription";
import { useSanityList } from '../hooks/use_sanity_list'
import { resolveImage } from '../utils/sanityClient'

gsap.registerPlugin(useGSAP,ScrollTrigger);

// 4.9: no $params needed, same as 4.7/4.8's entry-list queries.
const FEATURED_PROJECTS_QUERY = `*[_type == "featuredProject"] | order(displayOrder asc){category, title, cardImage, detailImage, description, githubUrl, websiteUrl}`

export function AppleCardsCarouselDemo() {


 useGSAP(() => {
  gsap.to(".head", {
    xPercent: 35, // Moves exactly to center based on its own width
    //left: "50%", // Ensures it is positioned relative to viewport center
    scrollTrigger: {
      trigger: ".head",
      
      scrub: true,
      toggleActions: "play",
      invalidateOnRefresh: true, // Recalculate values on resize
      duration:2,
    }
  });
}, []);

  const docs = useSanityList(FEATURED_PROJECTS_QUERY, featuredProjectsFallback)
  const data = docs.map((doc, index) => ({
    category: doc.category,
    title: doc.title,
    // detailImage falls back to cardImage per the schema's own documented convention ("leave empty to reuse
    // the card image") before ever reaching the local fallback image - doc.cardImage is only null/undefined
    // itself while useSanityList is still on its own fallback (see featuredProjectsFallback below), since
    // cardImage is a required field on every real document.
    src: resolveImage(doc.cardImage, featuredCardImages[index], doc.title),
    content: (
      <FeaturedProjectContent
        description={doc.description}
        githubUrl={doc.githubUrl}
        websiteUrl={doc.websiteUrl}
        image={resolveImage(doc.detailImage || doc.cardImage, featuredDetailImages[index], `${doc.title} Image`)}
      />
    ),
  }))

  const cards = data.map((card, index) => (
    <Card key={card.title} card={card} index={index} layout={true} />
  ));

  return (
    (<div className="w-full h-full  py-20">
      <div className="w-full h-full  flex flex-wrap relative">
    <h2
        className=" absolute head w-fit pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Projects That Define Me .
      </h2>
      
      </div>   
      
      <Carousel items={cards} />
      
    </div>)
  );
}

// Fallback content, transcribed directly from the pre-4.9 Carousel.jsx data array and ProjectDescription.jsx's
// 4 components - same byte-for-byte-fallback discipline as every fallback built in this category, trailing/
// missing spaces in the descriptions included (see docs/UI_ISSUES_REPORT.md #10 for the one found this task).
const featuredProjectsFallback = [
  {
    category: 'Artificial Intelligence', title: 'GemX', cardImage: null, detailImage: null,
    description: 'GemX is an innovative application designed to provide users with dynamic and interactive responses based on their prompts. With features ranging from text and voice interaction to video calls and travel planning, GemX is your versatile AI companion.',
    githubUrl: 'https://github.com/1-Rishav/GeminiAI',
    websiteUrl: 'https://gem-x.vercel.app/app',
  },
  {
    category: 'Fintech', title: 'QuickFundz', cardImage: null, detailImage: null,
    description: 'A web application designed to simplify peer-to-peer lending with security, transparency, and flexibility. It connects verified borrowers and lenders, allowing seamless loan requests, negotiations, and secure transactions.',
    githubUrl: 'https://github.com/1-Rishav/Quick_Fundz',
    websiteUrl: 'https://quick-fundz.vercel.app/auth/home',
  },
  {
    category: 'Advertisement-Design', title: 'Brand-Fusion', cardImage: null, detailImage: null,
    description: 'Brand Fusion is a single-page website designed to showcase modern front-end design techniques such as scroll-triggered animations, minimalist UI, and responsive layouts.Its real purpose is to demonstrate creative design elements that can be repurposed to advertise or brand any product or service.',
    githubUrl: 'https://github.com/1-Rishav/Advertisement-Web-app',
    websiteUrl: 'https://brand-fusion.netlify.app/',
  },
  {
    category: 'Geography', title: 'GeoPix', cardImage: null, detailImage: null,
    description: 'GeoPix is a sleek, interactive web application that allows users to explore a world map-based photo gallery. Users can click on different locations to view associated photos.',
    githubUrl: 'https://github.com/1-Rishav/GeoPix',
    websiteUrl: 'https://geopix.netlify.app/',
  },
]

// Index-aligned with featuredProjectsFallback above (same null-placeholder pattern as every image field in
// this category). Card images match Carousel.jsx's original `src` values; detail images match
// ProjectDescription.jsx's original per-component images - only GemX's ever differed from its card image.
const featuredCardImages = [images.Project2, images.Project1, images.Project3, images.Project10]
const featuredDetailImages = [images.Gem2, images.Project1, images.Project3, images.Project10]
