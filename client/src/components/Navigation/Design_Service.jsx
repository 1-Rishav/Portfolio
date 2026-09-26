import {
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { gsap } from 'gsap';
import { Separator } from '@/components/ui/separator';

import { design, other } from '../Data/Develop_DesignData';
import CustomImages from '../Form_&_Features/CustomImages';
import FeatureComponent from '../Form_&_Features/FeatureComponent';
import images from '../../assets/index';

function Design_Service() {
  const carouselRef = useRef(null);
  const firstSetRef = useRef(null);

  const videoRef = useRef(null);

  const ProjectImages = [
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
  ];

  /*
   * ---------------------------------------------------------
   * Video autoplay / pause
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Browser may block autoplay.
          });
        } else {
          video.pause();
        }
      },
      {
        threshold: 1,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Infinite left → right carousel
   * ---------------------------------------------------------
   */
  useLayoutEffect(() => {
    const track = carouselRef.current;
    const firstSet = firstSetRef.current;

    if (!track || !firstSet) return;

    const ctx = gsap.context(() => {
      let animation;

      const createAnimation = () => {
        if (animation) {
          animation.kill();
        }

        const distance = firstSet.getBoundingClientRect().width;

        if (distance <= 0) return;

        const speed = 50;

        /*
         * Start at the exact end of the first copy.
         * Then move toward x = 0.
         *
         * Direction:
         * LEFT → RIGHT
         */
        gsap.set(track, {
          x: -distance,
        });

        animation = gsap.to(track, {
          x: 0,
          duration: distance / speed,
          ease: 'none',
          repeat: -1,
        });
      };

      createAnimation();

      /*
       * Recalculate the distance if the viewport
       * or responsive image width changes.
       */
      const resizeObserver = new ResizeObserver(() => {
        createAnimation();
      });

      resizeObserver.observe(firstSet);

      return () => {
        resizeObserver.disconnect();

        if (animation) {
          animation.kill();
        }
      };
    }, carouselRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div className="h-full w-full bg-white brightness-100">

        {/* -------------------------------------------------- */}
        {/* Hero                                               */}
        {/* -------------------------------------------------- */}

        <div
          className="
            relative
            pt-20
            pb-10
            lg:pt-32
            lg:pb-16
            xl:pt-40
            flex
            max-md:flex-wrap
            items-center
            justify-between
            h-full
            w-full
          "
        >

          <div
            className="
              px-2
              sm:px-6
              xl:px-12
              2xl:px-20
              3xl:px-40
              4xl:px-60
              h-full
              w-fit
              text-5xl
              font-semibold
              leading-1
            "
          >
            <li className="text-xl text-gray-600 mb-5">
              Services
            </li>

            Got expertise in crafting <br />
            digital experiences that <br />
            connect brands with their <br />
            audiences
            <span
              className="
                font-bold
                md:text-4xl
                xl:text-5xl
                sm:text-3xl
                max-sm:text-2xl
                text-xl
                text-emerald-500
              "
            >
              .
            </span>
          </div>

          <div
            className="
              items-center
              justify-center
              max-md:pt-6
              h-[12rem]
              sm:h-[14rem]
              md:h-[15rem]
              lg:h-[17rem]
              xl:h-[22rem]
              max-md:w-full
              md:w-[25%]
              lg:w-[25%]
              text-3xl
              md:text-2-5xl
              xl:text-3xl
              4xl:text-4xl
              font-sans-primary
              tracking-tight
              text-black
              dark:text-grayDark-100
              leading-tight
              text-balance
              lg:pr-0
              bg-transparent
              rounded-2xl
              flex
            "
          >
            <video
              ref={videoRef}
              src="/ProjectVideos/advertise.mp4"
              loop
              playsInline
              preload="auto"
              className="
                rounded-2xl
                h-[12rem]
                sm:h-[14rem]
                md:h-[15rem]
                lg:h-[17rem]
                xl:h-[22rem]
                max-md:w-[30%]
                md:w-[45%]
                lg:w-[60%]
                hover:translate-x-2
                transition-transform-colors
                object-cover
              "
            />
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Description                                         */}
        {/* -------------------------------------------------- */}

        <div
          className="
            w-full
            flex
            flex-wrap
            md:justify-end
            justify-center
          "
        >
          <div className="px-2 lg:px-3 xl:px-4">
            <div
              className="
                w-full
                relative
                max-w-xl
                lg:pr-0
                lg:max-w-2xl
                lg:pl-10
              "
            >
              <h2
                className="
                  mb-3
                  text-pretty
                  tracking-tight
                  text-black
                  dark:text-grayDark-100
                  text-lg
                  md:text-2-5xl
                  xl:text-3xl
                  4xl:text-4xl
                  leading-tight
                  font-semibold
                "
              >
                My goal is to deliver user-centered designs that
                are responsive, intuitive, and aligned with the
                client’s vision
                <span
                  className="
                    font-bold
                    md:text-3xl
                    xl:text-4xl
                    sm:text-2xl
                    max-sm:text-xl
                    text-lg
                    text-emerald-500
                  "
                >
                  .
                </span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      <Separator className="mt-16" />

      <FeatureComponent
        heading=" Design"
        subheading="As a web designer, I blend creativity with functionality to ensure that each website not only looks stunning but also performs seamlessly "
        service={design}
        end="."
      />

      <Separator className="mt-16" />

      <FeatureComponent
        heading="Other"
        subheading="I ensure that each project is cohesive, user-centric, and aligned with your brand’s goals.Let’s work together to design something extraordinary "
        service={other}
        end="!"
      />

      <Separator className="mt-16" />

      {/* ---------------------------------------------------- */}
      {/* Infinite Project Carousel                            */}
      {/* ---------------------------------------------------- */}

      <div
        className="
          w-full
          px-2
          lg:px-3
          xl:px-4
          flex
          items-center
          justify-center
          overflow-hidden
        "
      >
        <div
          className="
            px-2
            sm:px-4
            xl:px-10
            2xl:px-16
            3xl:px-32
            4xl:px-40
            w-full
            overflow-hidden
          "
        >
          <div
            className="
              my-10
              lg:my-16
              2xl:my-20
              4xl:my-24
              py-10
              lg:py-14
              2xl:py-24
              4xl:py-32
              rounded-2xl
              lg:rounded-3xl
              w-full
              overflow-hidden
              flex
              items-center
              bg-black
            "
          >
            <div
              ref={carouselRef}
              className="
                flex
                w-max
                items-center
                will-change-transform
              "
            >

              {/* First copy */}
              <div
                ref={firstSetRef}
                className="
                  flex
                  shrink-0
                  gap-7
                  pr-7
                "
              >
                <CustomImages images={ProjectImages} />
              </div>

              {/* Second copy */}
              <div
                className="
                  flex
                  shrink-0
                  gap-7
                  pr-7
                "
                aria-hidden="true"
              >
                <CustomImages images={ProjectImages} />
              </div>

            </div>
          </div>
        </div>
      </div>

      <Separator className="" />
    </>
  );
}

export default Design_Service;