import type { SVGProps } from "react"
const HamburgerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M4 4h8M4 8h8M4 12h8"
    />
  </svg>
)
export default HamburgerIcon
