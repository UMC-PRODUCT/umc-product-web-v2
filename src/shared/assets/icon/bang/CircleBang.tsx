import type { SVGProps } from "react"
const CircleBang = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx={12} cy={12} r={8.25} stroke="currentColor" strokeWidth={1.5} />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 12.5V8"
    />
    <circle
      cx={12}
      cy={16}
      r={1}
      fill="currentColor"
      transform="rotate(-180 12 16)"
    />
  </svg>
)
export default CircleBang
