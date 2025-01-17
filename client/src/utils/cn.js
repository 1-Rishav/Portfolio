import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import '../index.css'; // Make sure to import your Tailwind CSS file

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}