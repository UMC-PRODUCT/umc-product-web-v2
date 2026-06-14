import type { SVGProps } from "react"
const InfoCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <circle cx={8} cy={8} r={6.35} stroke="currentColor" strokeWidth={1.3} />
    <circle cx={8.001} cy={4.7} r={0.7} fill="currentColor" />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.3}
      d="M8 7.4v4.05"
    />
  </svg>
)
export default InfoCircleIcon
