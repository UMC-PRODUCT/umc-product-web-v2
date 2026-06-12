import type { SVGProps } from "react"
const UmcLogoFilled = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 64 20"
    {...props}
  >
    <g filter="url(#UMCLogoFilled_svg__a)">
      <path
        fill="currentColor"
        d="M18.602 0H.979A.99.99 0 0 0 0 1v9c0 5.522 4.384 10 9.79 10 5.407 0 9.79-4.478 9.79-10V1a.99.99 0 0 0-.978-1"
      />
      <path
        fill="currentColor"
        fillOpacity={0.4}
        d="M18.602 0H.979A.99.99 0 0 0 0 1v9c0 5.522 4.384 10 9.79 10 5.407 0 9.79-4.478 9.79-10V1a.99.99 0 0 0-.978-1"
      />
      <path
        fill="currentColor"
        d="M40.63 0c-4.867 0-8.812 3.028-8.812 8 0-4.972-3.946-8-8.812-8a.99.99 0 0 0-.979 1v18c0 .552.439 1 .98 1h17.622a.99.99 0 0 0 .98-1V1a.99.99 0 0 0-.98-1"
      />
      <path
        fill="currentColor"
        fillOpacity={0.4}
        d="M40.63 0c-4.867 0-8.812 3.028-8.812 8 0-4.972-3.946-8-8.812-8a.99.99 0 0 0-.979 1v18c0 .552.439 1 .98 1h17.622a.99.99 0 0 0 .98-1V1a.99.99 0 0 0-.98-1"
      />
      <path
        fill="currentColor"
        d="M63.637 19V1a.99.99 0 0 0-.98-1h-8.81c-5.407 0-9.791 4.478-9.791 10s4.384 10 9.79 10h8.811a.99.99 0 0 0 .98-1"
      />
      <path
        fill="currentColor"
        fillOpacity={0.4}
        d="M63.637 19V1a.99.99 0 0 0-.98-1h-8.81c-5.407 0-9.791 4.478-9.791 10s4.384 10 9.79 10h8.811a.99.99 0 0 0 .98-1"
      />
    </g>
    <defs>
      <filter
        id="UMCLogoFilled_svg__a"
        width={63.637}
        height={24}
        x={0}
        y={-4}
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
        <feOffset dy={-4} />
        <feGaussianBlur stdDeviation={2} />
        <feComposite in2="hardAlpha" k2={-1} k3={1} operator="arithmetic" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
        <feBlend in2="shape" result="effect1_innerShadow_7289_1596" />
      </filter>
    </defs>
  </svg>
)
export default UmcLogoFilled
