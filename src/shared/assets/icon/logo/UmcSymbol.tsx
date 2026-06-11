import type { SVGProps } from "react"

export default function UmcSymbol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="163"
      height="50"
      viewBox="0 0 163 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_i_umc_symbol)">
        <path
          d="M47.5 0H2.49995C1.12003 0 0 1.12003 0 2.50012V25C0 38.8051 11.195 50 25 50C38.805 50 49.9999 38.8051 49.9999 25V2.50012C49.9999 1.12003 48.8801 0 47.5 0Z"
          fill="currentColor"
        />
        <path
          d="M103.75 0C91.325 0 81.2499 7.57013 81.2499 20.0001C81.2499 7.57013 71.1749 0 58.75 0C57.3699 0 56.25 1.12003 56.25 2.50012V47.5C56.25 48.88 57.3699 50 58.75 50H103.75C105.13 50 106.25 48.88 106.25 47.5V2.50012C106.25 1.12003 105.13 0 103.75 0Z"
          fill="currentColor"
        />
        <path
          d="M162.498 47.5V2.50012C162.498 1.12003 161.379 0 159.998 0H137.498C123.693 0 112.498 11.1951 112.498 25C112.498 38.8051 123.693 50 137.498 50H159.998C161.379 50 162.498 48.88 162.498 47.5Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <filter
          id="filter0_i_umc_symbol"
          x="0"
          y="-4"
          width="162.498"
          height="54"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_umc_symbol"
          />
        </filter>
      </defs>
    </svg>
  )
}
