import type { SVGProps } from "react"
const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      d="M3.758 8h8.485M8 3.757v8.486"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
    />
  </svg>
)
export default PlusIcon
