import { cn } from "@/shared/lib/utils"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

export type { RecruitingStatus }

// 헤더 우측의 모집 상태 표시. 상호작용 없는 라벨 전용 버튼(디자인상 '버튼' 형태).
// before: "모집 시작 D-n" / open: "지원하기 D-n"(마감일 기준) / closed: "모집 마감"
export function RecruitingStatusButton({
  status,
}: {
  status: RecruitingStatus
}) {
  const base =
    "flex h-10 min-w-16 items-center justify-center rounded-[10px] px-5 py-1 text-center whitespace-nowrap tracking-[-0.32px]"

  if (status.phase === "open") {
    return (
      <span
        className={cn(base, "text-label-1-semibold bg-teal-600 text-white")}
      >
        지원하기 D-{status.dDay}
      </span>
    )
  }

  const grayClassName = cn(
    base,
    "text-label-1-medium border-teal-gray-150 text-teal-gray-400 shadow-inner-neutral-1 border bg-white",
  )

  if (status.phase === "before") {
    return <span className={grayClassName}>모집 시작 D-{status.dDay}</span>
  }

  return <span className={grayClassName}>모집 마감</span>
}
