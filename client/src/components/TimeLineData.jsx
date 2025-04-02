import React from "react";
import { Timeline } from "./ui/timeline";
import { FollowerPointerCard } from "./ui/Follower_Pointer";
import { Link } from 'react-router-dom'
import { CardSpotlight } from "./ui/card_spotlight";
import { Boxes } from "./ui/background_boxes";
import images from '../assets/index'
export function TimelineDemo({ topRef }) {

  const data = [
    {

      title: "HTML,CSS & JavaScript",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-8">
            The foundation of my journey started with HTML, CSS, and JavaScript. I have worked on projects that focus on clean design, and performance optimization .
          </p>
          <div className="grid grid-cols-2 gap-4">
            <a href="https://fastest-100.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project5}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>

            <a href="https://lucky-20.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project6}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>
            <a href="https://brand-fusion.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project3}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>
            <a href="https://veggiefeast.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project4}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>

          </div>
        </div>
      ),
    },

    {

      title: "React.js",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-8">
            With React.js,
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-8">
            I have developed interactive, high-performance web applications with reusable components and efficient state management .          </p>
          <div className="grid grid-cols-2 gap-4">
          <a href="https://xoxo-battle.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project7}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>
          <a href="https://invest-meter.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project8}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>
          <a href="https://task-nest-1.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project9}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>
          <a href="https://geopix.netlify.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project10}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>
          </div>
        </div>
      ),
    },
    {

      title: "Node.js , MongoDB & PostgreSQL",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-8">
            With Node.js,
          </p>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-8">
            I create efficient server-side applications, while MongoDB and PostgreSQL help me manage structured and unstructured data effectively .          </p>
          <div className="grid grid-cols-2 gap-4">
          <a href="https://gem-x.vercel.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project2}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>

            <a href="https://quick-fundz.vercel.app/" target="_blank" rel="noopener noreferrer"> 
            <FollowerPointerCard >
              <CardSpotlight >
                <img
                  src={images.Project1}
                  alt="startup template"
                  width={500}
                  height={500}
                  className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                />
              </CardSpotlight>
            </FollowerPointerCard>
            </a>

          </div>
        </div>
      ),
    },
    {
      title: "GitHub, Vercel & Render",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-lg  md:text-xl font-normal mb-4">
            Ensuring smooth deployment and maintaining code integrity are crucial aspects of my workflow .
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg  md:text-xl">
              ✅ Version control and collaborate efficiently
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg  md:text-xl">
              ✅ Deploy scalable and high-performance applications with ease.
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-lg  md:text-xl">
              ✅ My projects focus on seamless CI/CD, reliability, and optimized hosting .
            </div>

          </div>

        </div>
      ),
    },
  ];


  return (<>

    <Timeline data={data} />


  </>);
}
