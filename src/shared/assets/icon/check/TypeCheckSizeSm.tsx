// 프로젝트 목록 페이지 - 드롭다운 선택 시의 체크 아이콘

import type { SVGProps } from "react"

const TypeCheckSizeSm = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 7.76923L6.8 11L12 5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default TypeCheckSizeSm
