import type { SVGProps } from "react"
const BangIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fill="currentColor"
      d="M8 11a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5m0-7.993a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75"
    />
  </svg>
)
export default BangIcon
