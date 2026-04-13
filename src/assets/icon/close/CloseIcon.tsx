import type { SVGProps } from "react"
const SvgCloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16.823 6.12a.751.751 0 0 1 1.062 1.06L13.063 12l4.822 4.821a.75.75 0 0 1-1.062 1.06l-4.82-4.82-4.82 4.82a.75.75 0 1 1-1.061-1.06L10.942 12l-4.82-4.82a.751.751 0 0 1 1.06-1.06l4.82 4.82z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgCloseIcon
