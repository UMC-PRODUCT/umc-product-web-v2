import { cn } from "@/shared/lib/utils"

import type { SVGProps } from "react"

interface MoreVerticalIconProps extends SVGProps<SVGSVGElement> {
  buttonClassName?: string
}

const MoreVerticalIcon = ({
  buttonClassName,
  ...props
}: MoreVerticalIconProps) => (
  <button
    type="button"
    className={cn(
      "hover:bg-teal-gray-100 flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-lg transition-colors",
      buttonClassName,
    )}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      {...props}
    >
      <path
        d="M13.5 7.5C13.5 8.32843 12.8284 9 12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5Z"
        fill="currentColor"
      />
      <path
        d="M13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12Z"
        fill="currentColor"
      />
      <path
        d="M13.5 16.5C13.5 17.3284 12.8284 18 12 18C11.1716 18 10.5 17.3284 10.5 16.5C10.5 15.6716 11.1716 15 12 15C12.8284 15 13.5 15.6716 13.5 16.5Z"
        fill="currentColor"
      />
    </svg>
  </button>
)

export default MoreVerticalIcon
