import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge doesn't have access to the tailwind.config.js file, so we
 * have to manually define the class groups we want to merge in case of issues.
 */
const customTwMerge = extendTailwindMerge({
  override: {
    classGroups: {
      "font-size": [
        "text-1",
        "text-2",
        "text-3",
        "text-4",
        "text-5",
        "text-6",
        "text-7",
        "text-8",
        "text-9",
        "text-10",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
