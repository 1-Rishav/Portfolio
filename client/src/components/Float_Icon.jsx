import React from "react";
import { FloatingDock } from "../components/ui/float_dock";
import { FaGithub,FaXTwitter  } from "react-icons/fa6";
import { SiStandardresume } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

export function FloatingDockDemo() {
  const links = [

    {
      title: "Linkedin",
      icon: (
        <FaLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.linkedin.com/in/rishav-raj-ab2893253/",
    },
    {
      title: "Resume",
      icon: (
        <SiStandardresume className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://drive.google.com/file/d/1ny2bUWPwPEq94mlI9AOGQTIaubSnVgYC/view?usp=drive_link",
    },
    {
      title: "GitHub",
      icon: (
        <FaGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/1-Rishav",
    },
    {
      title: "Twitter",
      icon: (
        <FaXTwitter className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://x.com/11Rishav",
    },
  ];
  return (
    (<div className="flex items-center justify-center h-[5rem] w-full">
      <FloatingDock
        // only for demo, remove for production
        //mobileClassName="translate-y-20"
        items={links} />
    </div>)
  );
}
