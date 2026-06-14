import type { SVGProps } from "react"

const WarningTriangleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m12.987 2.96 9.578 16.522a1.16 1.16 0 0 1 0 1.159 1.166 1.166 0 0 1-1.006.58H2.441a1.166 1.166 0 0 1-1.006-.58 1.16 1.16 0 0 1 0-1.16L11.013 2.962a1.165 1.165 0 0 1 1.974 0m-1.312 13.02a.565.565 0 0 0-.565.565v.873c0 .312.253.565.565.565h.883a.565.565 0 0 0 .565-.565v-.874a.565.565 0 0 0-.565-.564zm0-7.005a.565.565 0 0 0-.565.565v3.88c0 .313.253.566.565.566h.883a.565.565 0 0 0 .565-.565V9.54a.565.565 0 0 0-.565-.565z"
    />
  </svg>
)

export default WarningTriangleIcon
