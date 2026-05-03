import type { SVGProps } from "react"

const PersonGraphicIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    fill="currentColor"
    width={30}
    height={30}
    {...props}
  >
    <circle cx={15} cy={8.5} r={5.5} />
    <path d="M4.5 28a10.5 10.5 0 0 1 21 0H4.5Z" />
  </svg>
)

export default PersonGraphicIcon
