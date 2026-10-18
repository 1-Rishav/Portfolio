import React from "react";
import { BackgroundBeamsWithCollision } from "../components/ui/footer_beams_collision";
import { FloatingDockDemo } from "./Float_Icon";
import { useSiteSettings } from "../hooks/use_site_settings";

export function BackgroundBeamsWithCollisionDemo() {
  const settings = useSiteSettings();
  // settings.address keeps its line break as a literal "\n" (the schema's `text` field, not a structured
  // object - architecture decision in 2.6, nothing ever parses an address programmatically) rather than
  // hardcoding a <br/> for exactly two lines the way the live markup does today; splitting on "\n" renders
  // correctly however many lines an editor actually enters, not just the two there happen to be right now.
  const addressLines = settings.address.split("\n");
  return (
    (<BackgroundBeamsWithCollision>
      <div className="w-full h-full flex items-center justify-center">
        <div
  className="w-full h-full
    grid
    lg:grid-cols-[25rem_auto_22rem]
    md:grid-cols-[18rem_auto_16rem]
    grid-cols-[4rem_auto_0]
    grid-rows-[12rem_12rem_14rem_3rem]
    md:grid-rows-[5rem_auto_3rem]
    lg:grid-rows-[5rem_auto_3rem]
  "
>
          <div className="bg-white rounded-br-3xl row-start-1 col-start-1"><FloatingDockDemo /></div>
          <div className=" md:row-start2 md:col-end-2 ">
            <div className="h-full w-full list-none flex flex-wrap items-center justify-center gap-2 text-white text-gradient cursor-pointer text-3xl font-bold">
              <li>Driven by Code, Defined by Quality.</li>
            </div>
          </div>
          <div className="row-start-2 col-start-2">
            <div className="mx-0 h-fit w-full flex items-center justify-between gap-2 ">
              <div className="h-full w-1/2  text-neutral-100 list-none  text-xl cursor-pointer">
                <li className="sm:my-7 max-sm:my-3 text-gray-500 cursor-not-allowed">Know</li>
                <li >About</li>
                <li >Resume</li>
                <li>FAQs</li>
                <li>Contact</li>
              </div>

              <div className="h-fit w-full text-neutral-100 list-none text-xl cursor-pointer">
                <li className="sm:my-7 max-sm:my-3 text-gray-500 cursor-not-allowed">Explore</li>
                <li>MERN Project</li>
                <li>PERN Project</li>
                <li>Web Design</li>
                <li>Web Development</li>
              </div>
            </div>
          </div>
          <div className=" row-start-3 col-start-2 md:row-start-2 md:col-start-3">
            <div className="sm:mx-7  h-full w-full list-none flex flex-col items-start justify-center gap-3  text-white text-xl cursor-pointer">
              <li className="sm:my-4 text-gray-500">Get in touch</li>
              <li>{settings.phone}</li>
              <li>{settings.email}</li>
              <li>
                {addressLines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </li>
            </div>
          </div>
        </div>
      </div>



      {/* <h2
        className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
        What&apos;s cooler than Beams?{" "} 
        <div
          className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div
            className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
            <span className="">Exploding beams.</span>
          </div>
          <div
            className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            <span className="">Exploding beams.</span>
          </div>
        </div>
      </h2> */}
    </BackgroundBeamsWithCollision>)
  );
}
