import { cva } from "class-variance-authority"

/** 팀 매칭 등 페이지 제목 (프레임 상단) */
export const segmentHeadingVariants = cva(
  "w-full text-left text-2xl font-semibold leading-[135%] text-[#161919]",
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
        true: "border-b-[#0b6b64] font-semibold leading-[150%] text-[#0b6b64]",
        false:
          "border-b-[#d3d8d8] font-medium leading-[145%] text-[#6f7878] hover:border-b-[#9ca3a3] hover:text-[#656b6b]",
      },
    },
    defaultVariants: { selected: false },
  },
)

/** 제목 + 탭을 한 프레임(세로 스택, 제목↔탭 간격 24px = gap-6) */
export const segmentListVariants = cva("flex w-full flex-col items-start gap-6")
