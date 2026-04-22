import type { SVGProps } from "react"
const FileClip = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m17 9.17-7.02 7.116a4.05 4.05 0 0 1-5.783 0 4.184 4.184 0 0 1 0-5.86l7.021-7.117a2.7 2.7 0 0 1 3.855 0 2.79 2.79 0 0 1 0 3.907l-6.746 6.838a1.35 1.35 0 0 1-1.927 0 1.395 1.395 0 0 1 0-1.954l5.92-6"
    />
  </svg>
)
export default FileClip
