import type { SVGProps } from "react"

const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={1.5} />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M16.5 16.5 21 21"
    />
  </svg>
)

export default SearchIcon
