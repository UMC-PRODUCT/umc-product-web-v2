import type { SVGProps } from "react"
const RatingFace2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 22 22"
    {...props}
  >
    <g clipPath="url(#rating-face-2-icon_svg__a)">
      <path
        fill="var(--face-bg)"
        d="M11 0C4.925 0 0 4.925 0 11s4.925 11 11 11 11-4.925 11-11S17.075 0 11 0"
      />
      <path
        fill="var(--face-fg)"
        fillRule="evenodd"
        d="M7.089 13.933a.978.978 0 1 0 0 1.955h7.822a.978.978 0 0 0 0-1.955zM4.645 8.066a.98.98 0 0 1 .977-.978h2.934a.978.978 0 1 1 0 1.956H5.622a.98.98 0 0 1-.977-.978m8.8-.978a.978.978 0 0 0 0 1.956h2.933a.978.978 0 0 0 0-1.956z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="rating-face-2-icon_svg__a">
        <path fill="#fff" d="M0 0h22v22H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default RatingFace2Icon
