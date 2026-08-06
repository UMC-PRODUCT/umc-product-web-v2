import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

export type { RecruitingStatus }

const BASE_CLASS =
  "flex h-10 min-w-16 items-center justify-center rounded-[10px] px-5 py-1 text-center whitespace-nowrap tracking-[-0.32px]"

const IDLE_CLASS =
  "text-label-1-medium border-teal-gray-150 text-teal-gray-400 shadow-inner-neutral-1 border bg-white"

/**
 * 헤더 우측의 모집 상태.
 *
 * 접수 중일 때만 누를 수 있다. `지원하기` 는 행동을 시키는 문구인데 눌리지 않으면
 * 막다른 길이 된다. 헤더 `모집 안내` 탭이 아직 비활성이라(#710) 게스트에게는
 * 이게 모집 흐름으로 들어가는 유일한 경로다.
 *
 * 시작 전과 마감은 알리기만 하면 되므로 라벨 그대로 둔다.
 */
export function RecruitingStatusButton({
  status,
}: {
  status: RecruitingStatus
}) {
  if (status.phase === "open") {
    return (
      <Link
        to="/projects/notice"
        className={cn(
          BASE_CLASS,
          "text-label-1-semibold bg-teal-600 text-white transition-colors hover:bg-teal-700",
        )}
      >
        지원하기 D-{status.dDay}
      </Link>
    )
  }

  if (status.phase === "before") {
    return (
      <span className={cn(BASE_CLASS, IDLE_CLASS)}>
        모집 시작 D-{status.dDay}
      </span>
    )
  }

  return <span className={cn(BASE_CLASS, IDLE_CLASS)}>모집 마감</span>
}
