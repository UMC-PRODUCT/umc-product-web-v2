import type { SVGProps } from "react"
const TrashCan = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 26 26"
    {...props}
  >
    <path
      fill="currentColor"
      d="M17 4.25a.75.75 0 0 1 .75.75v1.25H21a.75.75 0 0 1 0 1.5h-1.25V21a.75.75 0 0 1-.75.75H7a.75.75 0 0 1-.75-.75V7.75H5a.75.75 0 0 1 0-1.5h3.25V5A.75.75 0 0 1 9 4.25zm-9.25 16h10.5V7.75H7.75zm2.965-11a.75.75 0 0 1 .75.75v8a.75.75 0 1 1-1.5 0v-8a.75.75 0 0 1 .75-.75m4.57 0a.75.75 0 0 1 .75.75v8a.75.75 0 0 1-1.5 0v-8a.75.75 0 0 1 .75-.75m-5.535-3h6.5v-.5h-6.5z"
    />
  </svg>
)
export default TrashCan
