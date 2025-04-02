"use client";
import React, { useState } from "react";
import { HeroParallax } from "../components/ui/hero_paralax";
import images from '../assets/index'



export function HeroParallaxDemo() {
  return   <HeroParallax products={products} />;
  
  
}
export const products = [
  {
    id:1,
    title: "Rishav",
    link: "#",
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
    link: "#",
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
    link: "#",
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
    link: "#",
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
