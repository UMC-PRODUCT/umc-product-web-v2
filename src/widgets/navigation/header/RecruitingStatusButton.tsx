import { Link } from "@tanstack/react-router"

import { APPLY_ENTRY_PATH } from "@/shared/config/recruitingPeriod"
import { useIsRecruitingPeriod } from "@/shared/hooks/useIsRecruitingPeriod"
import { cn } from "@/shared/lib/utils"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

export type { RecruitingStatus }

const BASE_CLASS =
  "flex h-10 min-w-16 items-center justify-center rounded-[10px] px-5 py-1 text-center whitespace-nowrap tracking-[-0.32px]"

/**
 * 헤더 우측의 모집 진입로.
 *
 * 모집 기간에만 나오고, 그 밖에는 자리를 비운다. 마감을 알리는 라벨은 두지
 * 않는다. 누를 수 없는 버튼 모양이 헤더에 남아 있으면 막다른 길로 보인다.
 *
 * D-day 는 붙이지 않는다. 학교마다 모집 기간이 달라 헤더에 띄울 숫자의 기준이
 * 없다.
 */
export function RecruitingStatusButton() {
  const isRecruitingPeriod = useIsRecruitingPeriod()

  if (!isRecruitingPeriod) return null

  return (
    <Link
      to={APPLY_ENTRY_PATH}
      className={cn(
        BASE_CLASS,
        "text-label-1-semibold bg-teal-600 text-white transition-colors hover:bg-teal-700",
      )}
    >
      지원하기
    </Link>
  )
}
