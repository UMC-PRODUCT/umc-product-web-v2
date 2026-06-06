import type { SVGProps } from "react"
const RatingFace1Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 22 22"
    {...props}
  >
    <g
      fillRule="evenodd"
      clipPath="url(#rating-face-1-icon_svg__a)"
      clipRule="evenodd"
    >
      <path fill="var(--face-bg)" d="M11 0a11 11 0 1 0 0 22 11 11 0 0 0 0-22" />
      <path
        fill="var(--face-fg)"
        d="M4.62 6.927c0-.542.44-.982.983-.982H7.65c.544 0 .983.44.983.982v.935a.982.982 0 0 1-1.963.047H5.6a.98.98 0 0 1-.982-.982m11.246 8.824a.98.98 0 0 1-1.204-.695 3.795 3.795 0 0 0-7.326 0 .981.981 0 1 1-1.897-.51 5.76 5.76 0 0 1 11.121 0 .984.984 0 0 1-.694 1.205m-1.52-9.806a.982.982 0 1 0 0 1.964h1.069a.982.982 0 0 0 1.963-.047v-.935a.98.98 0 0 0-.983-.982z"
      />
    </g>
    <defs>
      <clipPath id="rating-face-1-icon_svg__a">
        <path fill="#fff" d="M0 0h22v22H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default RatingFace1Icon
