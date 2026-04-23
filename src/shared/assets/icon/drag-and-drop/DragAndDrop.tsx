import type { SVGProps } from "react"
const DragAndDrop = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 16 10"
    {...props}
  >
    <circle cx={2} cy={2} r={2} fill="#D9D9D9" />
    <circle cx={8} cy={2} r={2} fill="#D9D9D9" />
    <circle cx={14} cy={2} r={2} fill="#D9D9D9" />
    <circle cx={2} cy={8} r={2} fill="#D9D9D9" />
    <circle cx={8} cy={8} r={2} fill="#D9D9D9" />
    <circle cx={14} cy={8} r={2} fill="#D9D9D9" />
  </svg>
)
export default DragAndDrop
