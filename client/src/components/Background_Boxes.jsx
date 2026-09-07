"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from 'gsap'
import { Boxes } from "../components/ui/background_boxes";
import InvertedCard from "./NavNavigation/InvertedCard/InvertedCard";
import images from '../assets/index'

const platforms = [
  { href: "https://leetcode.com/u/rajrishav011/", site: "Leet Code", img: images.program1 },
  { href: "https://www.geeksforgeeks.org/user/rajrishav011/", site: "GeeksforGeeks", img: images.program2 },
  { href: "https://www.hackerrank.com/profile/rajrishav011", site: "Hacker Rank", img: images.program3 },
  { href: "https://www.codechef.com/users/rajrishav011", site: "Code Chef", img: images.program4 },
  { href: "https://www.naukri.com/code360/profile/d2082175-0091-4b88-8350-c6182fdebf40", site: "Coding Ninja", img: images.program5 },
];

export function BackgroundBoxesDemo() {

  const carouselLeft = useRef(null);

  useEffect(() => {
    const carousel = carouselLeft.current;
    if (!carousel) return;

    // Seamless infinite loop via a single CSS transform, instead of the
    // previous approach (measure the first card's width, animate exactly
    // that far, then on every single cycle: clone the first card, append
    // the clone, remove the original, and nudge the position to hide the
    // swap). That technique needed enough real card content to always
    // fill the visible width for the illusion to hold - at a small card
    // size there wasn't enough of it, which is exactly what produced the
    // empty gap, and was why the cards were sized so large in the first
    // place. The list below is rendered twice back-to-back (see the two
    // renderPlatforms() calls in the JSX), so translating the track by
    // exactly -50% of its own total width moves it by exactly one full
    // copy - at that point copy #2 is sitting in exactly the position
    // copy #1 started in, so the reset back to 0% is visually
    // undetectable. Nothing is ever measured, added, or removed at
    // runtime, so this holds at any card size.
    const tween = gsap.to(carousel, {
      xPercent: -50,
      ease: "linear",
      duration: 25,
      repeat: -1,
    });

    return () => tween.kill();
  }, []);

  const renderPlatforms = (keyPrefix) =>
    platforms.map((p) => (
      <a
        key={`${keyPrefix}-${p.site}`}
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        <InvertedCard site={p.site} img={p.img} />
      </a>
    ));

  return (
    <>
      <div className="w-full h-full px-6 | md:px-10 | lg:px-16 | xl:px-20 | 4xl:px-24">
        <div className="p-6 sm:p-10 min-h-[60vh] sm:min-h-[70vh] md:min-h-[85vh] lg:min-h-screen relative w-full overflow-hidden bg-slate-200 flex flex-col items-center justify-center rounded-xl">
          <div className="absolute inset-0 w-full h-full bg-slate-200 z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <Boxes />

          {/* Left-aligned, matching the reference layout - centering it was
              the wrong call last time. The eyebrow label uses a real
              <ul className="list-disc"><li>...</li></ul> so the bullet
              renders consistently everywhere (explicit, not relying on a
              browser's default <li> styling, which is what made the
              earlier plain <li>-with-no-<ul> version unpredictable) while
              still being valid HTML. mt-6 pushes the whole block down from
              the very top of the section, since sitting flush against it
              didn't look right either. */}
          <div className="relative z-20 w-full flex flex-col items-start text-left text-black mb-8 sm:mb-10 mt-6 sm:mt-10">
            <ul className="list-disc pl-4 mb-2">
              <li className="text-sm md:text-xl text-gray-700">My Playground</li>
            </ul>
            <p className="text-xl sm:text-3xl md:text-5xl xl:text-6xl font-semibold leading-tight">
              Platforms where I explore new concepts .
            </p>
          </div>

          <div className="relative z-20 w-full overflow-hidden">
            <div ref={carouselLeft} className="flex items-center gap-4 sm:gap-6 w-max">
              {renderPlatforms("a")}
              {renderPlatforms("b")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
