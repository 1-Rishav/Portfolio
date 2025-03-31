"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from 'gsap'
import { Boxes } from "../components/ui/background_boxes";
import { cn } from "../utils/cn";
import InvertedCard from "./NavNavigation/InvertedCard/InvertedCard";
import images from '../assets/index'
export function BackgroundBoxesDemo() {

  const carouselLeft = useRef(null);

  useEffect(() => {
    const carousel = carouselLeft.current;
    const images = Array.from(carousel.children);
    const imageWidth = images[0].offsetWidth;

    // GSAP Timeline for Smooth Movement
    const timeline = gsap.timeline({
      repeat: -1, // Infinite loop
      defaults: { ease: "linear", duration: 5 }, // Smooth and consistent speed
    });

    timeline.to(carousel, {
      x: `-=${imageWidth}`, // Move carousel to the right
      onComplete: () => {
        // Clone the first image instead of moving it
        const firstImage = carousel.firstElementChild;
        const cloneFirstImage = firstImage.cloneNode(true);

        // Append the cloned image to the end
        carousel.appendChild(cloneFirstImage);

        // Remove the original first image
        firstImage.remove();

        // Reset position to avoid jump
        gsap.set(carousel, { x: `+=${imageWidth}` });
      },
    });

    return () => {
      timeline.kill(); // Cleanup GSAP animation on unmount
    };
  }, []);
  return (
    <>
<div className="w-full h-full px-6 | md:px-10 | lg:px-16 | xl:px-20 | 4xl:px-24">
    <div
      className="h-full p-10 min-h-screen relative w-full overflow-hidden bg-slate-200 flex  items-center justify-center rounded-xl">
      <div
        className="absolute inset-0 w-full h-full bg-slate-200 z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      <div className="  mx-96 w-full h-full">
      <div className='relative  text-black h-full w-full flex items-center mb-10 justify-center md:text-5xl xl:text-7xl sm:text-3xl max-sm:text-xl text-xl font-semibold leading-1'><li className='absolute left-0  -top-5 md:text-xl text-sm text-gray-700 mb-5 '>My Playground</li> Platforms where I solve problems and explore new concepts .</div>
        <div ref={carouselLeft} className="w-full h-full flex items-center justify-center ">
          <a href="https://leetcode.com/u/rajrishav011/" target="_blank">
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20 w-full")}>
        <InvertedCard site={'Leet Code'} img={images.program1} wide='25rem' high='25rem'/>
        
      </h1>
      </a>
      <a href="https://www.geeksforgeeks.org/user/rajrishav011/">
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20 w-full")}>
        <InvertedCard site={'GeeksforGeeks'} img={images.program2} wide='25rem' high='25rem'/>
        
      </h1>
      </a>
      <a href="https://www.hackerrank.com/profile/rajrishav011">
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20 w-full")}>
        <InvertedCard site={'Hacker Rank'} img={images.program3} wide='25rem' high='25rem'/>
        
      </h1>
      </a>
      <a href="https://www.codechef.com/users/rajrishav011">
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20 w-full")}>
        <InvertedCard site={'Code Chef'} img={images.program4} wide='25rem' high='25rem'/>
        
      </h1>
      </a>
      <a href="https://www.naukri.com/code360/profile/d2082175-0091-4b88-8350-c6182fdebf40">
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20 w-full")}>
        <InvertedCard site={'Coding Ninja'} img={images.program5} wide='25rem' high='25rem'/>
        
      </h1>
      </a>
      {/* <a href="">
      <h1 className={cn("md:text-4xl text-xl text-white relative z-20 w-full")}>
        <InvertedCard wide='25rem' high='25rem'/>
        
      </h1>
      </a> */}
      </div>
      </div>

      <p className="text-center mt-2 text-neutral-300 relative z-20">
        
      </p>
    </div>
    </div>
    </>
  );
}
