import { cva } from "class-variance-authority"

/** 팀 매칭 등 페이지 제목 (프레임 상단) */
export const segmentHeadingVariants = cva(
  "w-full text-left text-heading-5-semibold font-semibold text-teal-gray-900",
)

/** 탭 줄: 왼쪽 정렬, 탭 너비는 내용 기준 */
export const segmentTabRowVariants = cva(
  "flex w-full flex-wrap items-end justify-start",
)

export const segmentTriggerVariants = cva(
  [
    "inline-flex h-11 shrink-0 cursor-pointer items-end justify-center gap-2.5",
    "border-b-2 px-5 pt-2 pb-3 text-center transition-colors",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      selected: {
        true: "border-b-teal-600 text-subtitle-3-semibold font-semibold text-teal-600",
        false:
          "border-b-teal-gray-300 text-body-1-medium font-medium text-teal-gray-500 hover:border-b-teal-gray-400 hover:text-teal-gray-600",
      },
    },
    defaultVariants: { selected: false },
  },
)

/** 제목 + 탭을 한 프레임 */
export const segmentListVariants = cva("flex w-full flex-col items-start gap-6")
