import type { SVGProps } from "react"
const CloseCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <g filter="url(#CloseCircleIcon_svg__a)">
      <rect width={18} height={18} fill="currentColor" rx={9} />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth={1.5}
        d="m6 6 6 6M12 6l-6 6"
      />
    </g>
    <defs>
      <filter
        id="CloseCircleIcon_svg__a"
        width={19}
        height={20.5}
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
          result="effect1_innerShadow_1347_42477"
        />
      </filter>
    </defs>
  </svg>
)
export default CloseCircleIcon
