import type { SVGProps } from "react"
const RubberConeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="#E5F5F2"
      d="M11.236 2.375 3.676 20.05H20.21l-7.56-17.675a.77.77 0 0 0-1.415 0"
    />
    <rect
      width={23.04}
      height={2.288}
      x={0.48}
      y={20.032}
      fill="#0E8179"
      rx={1.144}
    />
    <path
      fill="#0E8179"
      d="M20.21 20.05H3.677l1.087-2.541h14.361zm-2.642-6.178H6.318l1.726-4.035h7.799zM11.235 2.375a.77.77 0 0 1 1.416 0L14.287 6.2H9.6z"
    />
  </svg>
)
export default RubberConeIcon
