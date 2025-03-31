"use client";
//import img from "next/img";
import React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Carousel, Card } from "../components/ui/apple_card_carousel";
import images from '../assets/index'
import { Advertise, GemX, GeoPix, QuickFundz } from "./Form_&_Features/ProjectDescription";
gsap.registerPlugin(useGSAP,ScrollTrigger);
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

  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={true} />
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

const data = [
  {
    category: "Artificial Intelligence",
    title: "GemX",
    src: images.Project2,
    content: <GemX/>,
  },
  {
    category: "Fintech",
    title: "QuickFundz",
    src: images.Project1,
    content: <QuickFundz/>,
  },
  {
    category: "Advertisement-Design",
    title: "Brand-Fusion",
    src: images.Project3,
    content: <Advertise/>,
  },

  {
    category: "Geography",
    title: 'GeoPix',
    src: images.Project10,
    content:<GeoPix/>,
  },
];