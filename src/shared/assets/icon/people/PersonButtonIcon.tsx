import type { SVGProps } from "react"
const PersonButtonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    {...props}
  >
    <circle cx={12} cy={6} r={4.25} stroke="currentColor" strokeWidth={1.5} />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.353 22.25h15.295c.383 0 .78-.177 1.093-.543.316-.37.509-.892.509-1.457v-.153l-.001-.024-.001-.038v-.013l-.003-.033-.009-.114a8.2 8.2 0 0 0-1.07-3.36 6.9 6.9 0 0 0-2.585-2.52c-1.27-.718-3.056-1.245-5.581-1.245s-4.31.526-5.581 1.244a6.9 6.9 0 0 0-2.378 2.194l-.207.33a8.2 8.2 0 0 0-1.07 3.357l-.014.19v.185c0 .565.193 1.088.509 1.457.313.366.71.543 1.094.543"
    />
  </svg>
)
export default PersonButtonIcon
