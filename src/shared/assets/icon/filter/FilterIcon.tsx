import type { SVGProps } from "react"
const FilterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M4.5 4.25h15a.75.75 0 0 1 .75.75v2.379a.75.75 0 0 1-.22.53l-5.12 5.121a2.25 2.25 0 0 0-.66 1.591V20a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-5.379a2.25 2.25 0 0 0-.66-1.59L3.97 7.908a.75.75 0 0 1-.22-.53V5a.75.75 0 0 1 .75-.75Z"
    />
  </svg>
)
export default FilterIcon
