import type { SVGProps } from "react"
const SvgCircleCheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <g filter="url(#CircleCheckIcon_svg__a)">
      <rect width={20} height={20} fill="currentColor" rx={10} />
      <path
        stroke="#E5F5F2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6 9.77 8.8 13 14 7"
      />
    </g>
    <defs>
      <filter
        id="CircleCheckIcon_svg__a"
        width={21}
        height={22.5}
        x={-1}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={-1} dy={2.5} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0.892634 0 0 0 0 0.892634 0 0 0 0 0.892634 0 0 0 0.2 0" />
        <feBlend
          in2="shape"
          mode="multiply"
          result="effect1_innerShadow_843_23499"
        />
      </filter>
    </defs>
  </svg>
)
export default SvgCircleCheckIcon
