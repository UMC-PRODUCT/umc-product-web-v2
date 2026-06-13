import type { SVGProps } from "react"
const SvgFavicon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 512 512"
    {...props}
  >
    <g clipPath="url(#favicon_svg__a)">
      <path fill="#fff" d="M0 0h512v512H0z" />
      <path fill="#000" d="M0 0h512v512H0z" />
      <path
        fill="#fff"
        d="M188.32 199.239H85.701A5.705 5.705 0 0 0 80 204.944v51.345c0 31.503 25.529 57.05 57.01 57.05 31.482 0 57.011-25.547 57.011-57.05v-51.345a5.705 5.705 0 0 0-5.701-5.705M307.051 199c-28.334 0-51.31 17.275-51.31 45.64 0-28.365-22.975-45.64-51.309-45.64a5.705 5.705 0 0 0-5.701 5.705v102.69a5.705 5.705 0 0 0 5.701 5.705h102.619a5.705 5.705 0 0 0 5.701-5.705v-102.69a5.705 5.705 0 0 0-5.701-5.705M431.16 307.493v-102.69a5.705 5.705 0 0 0-5.701-5.705H374.15c-31.482 0-57.011 25.547-57.011 57.05s25.529 57.05 57.011 57.05h51.309a5.705 5.705 0 0 0 5.701-5.705"
      />
    </g>
    <defs>
      <clipPath id="favicon_svg__a">
        <path fill="#fff" d="M0 0h512v512H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgFavicon
