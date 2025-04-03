"use client";
import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useGSAP(() => {
    gsap.to(".time", {
      xPercent: 30, // Moves exactly to center based on its own width
      //left: "50%", // Ensures it is positioned relative to viewport center
      scrollTrigger: {
        trigger: ".time",
        
        scrub: true,
        toggleActions: "play",
        invalidateOnRefresh: true, // Recalculate values on resize
        duration:2,
      }
    });
  }, []);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto  px-4 md:px-8 lg:px-5 relative md:h-64 h-fit flex md:gap-10 gap-20">
        <h2 className="absolute time text-lg md:text-4xl mb-4 text-black font-bold dark:text-white max-w-xl">
        My Tech Journey (2022-2025)
        </h2>
        <p className="relative  md:mt-10 h-fit pt-10 bottom-0 font-medium text-neutral-800 dark:text-neutral-300 text-xl md:text-2xl md:w-xxl w-xl">
        Skills aren’t just numbers or progress bars—they represent dedication, learning, and real-world experience. Here, I showcase the technologies I’ve mastered and the projects that have shaped my expertise over the years .
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-20 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute -left-4 md:-left-8 w-10 rounded-full  bg-white dark:bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-8 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:-left-3 left-1 top-0 overflow-hidden w-[3px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[5px] bg-gradient-to-t from-purple-500 via-blue-900 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
