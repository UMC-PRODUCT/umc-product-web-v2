import type { SVGProps } from "react"

const ProfileIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 40 40"
    {...props}
  >
    <circle cx={20} cy={20} r={20} fill="#E9ECEC" />
    <path
      fill="#9CA3A3"
      d="M12.889 15.111a7.111 7.111 0 1 1 14.222 0 7.111 7.111 0 0 1-14.222 0ZM12.889 25.778A8.889 8.889 0 0 0 4 34.667 5.333 5.333 0 0 0 9.333 40h21.334A5.333 5.333 0 0 0 36 34.667a8.889 8.889 0 0 0-8.889-8.889h-14.222Z"
    />
  </svg>
)

export default ProfileIcon
