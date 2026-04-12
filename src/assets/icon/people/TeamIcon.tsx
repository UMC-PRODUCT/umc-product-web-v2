import type { SVGProps } from "react"
const SvgTeamIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M7.918 9.167a3.333 3.333 0 1 0 0-6.667 3.333 3.333 0 0 0 0 6.667"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.335 17.5v-1.667a3.335 3.335 0 0 0-2.5-3.228M14.168 17.5c0-1.553 0-2.33-.254-2.942a3.33 3.33 0 0 0-1.804-1.804c-.612-.254-1.389-.254-2.942-.254h-2.5c-1.553 0-2.33 0-2.942.254a3.33 3.33 0 0 0-1.804 1.804c-.254.612-.254 1.389-.254 2.942m9.583-11.667a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0m4.582 0a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0"
    />
  </svg>
)
export default SvgTeamIcon
