import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: ["shadow-tooltip-light"],
      "font-size": [
        "text-display-1-bold",
        "text-display-2-medium",
        "text-heading-1-bold",
        "text-heading-2-bold",
        "text-heading-3-semibold",
        "text-heading-4-semibold",
        "text-heading-5-semibold",
        "text-heading-6-semibold",
        "text-heading-7-semibold",
        "text-subtitle-1-semibold",
        "text-subtitle-1-medium",
        "text-subtitle-2-medium",
        "text-subtitle-3-semibold",
        "text-subtitle-4-semibold",
        "text-body-1-medium",
        "text-body-1-regular",
        "text-body-2-medium",
        "text-body-2-regular",
        "text-body-3-medium",
        "text-body-3-regular",
        "text-label-1-semibold",
        "text-label-1-medium",
        "text-label-2-medium",
        "text-label-3-semibold",
        "text-label-4-medium",
        "text-caption-1-medium",
        "text-caption-2-medium",
        "text-caption-2-regular",
        "text-caption-3-regular",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
