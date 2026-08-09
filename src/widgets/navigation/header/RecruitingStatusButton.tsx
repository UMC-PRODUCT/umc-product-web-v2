import { Link } from "@tanstack/react-router"

import { APPLY_ENTRY_PATH } from "@/shared/config/headerRecruitingWindow"
import { useIsWithinHeaderRecruitingWindow } from "@/shared/hooks/useHeaderRecruitingWindow"
import { cn } from "@/shared/lib/utils"
import { GlassRim } from "@/shared/ui/GlassRim"

import { GLASS_ENTRY_BUTTON, GLASS_RIM, type HeaderTone } from "./headerTone"

import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

export type { RecruitingStatus }

const BASE_CLASS =
  "flex h-10 min-w-16 items-center justify-center rounded-[10px] px-5 py-1 text-center whitespace-nowrap tracking-[-0.32px]"

/**
 * 헤더 우측의 모집 진입로.
 *
 * 앱 안쪽 헤더는 모집 기간에만 띄우고 그 밖에는 자리를 비운다. 마감을 알리는
 * 라벨은 두지 않는다.
 *
 * 소개 랜딩은 시안이 두 상태 모두에 버튼을 그려 두어 `alwaysVisible` 로 계속
 * 띄우되, 모집 기간이 아니면 눌러도 아무 데도 가지 않게 한다. 마감된 뒤에
 * 지원 화면으로 보내면 안 되기 때문이다.
 *
 * D-day 는 붙이지 않는다. 학교마다 모집 기간이 달라 헤더에 띄울 숫자의 기준이
 * 없다.
 */
export function RecruitingStatusButton({
  tone = "light",
  alwaysVisible = false,
}: {
  tone?: HeaderTone
  /** 소개 랜딩은 시안에서 모집 기간과 무관하게 지원하기를 둔다. */
  alwaysVisible?: boolean
}) {
  const showApplyCta = useIsWithinHeaderRecruitingWindow()
  const isGlass = tone === "glass"

  if (!showApplyCta && !alwaysVisible) return null

  const className = cn(
    BASE_CLASS,
    "text-label-1-semibold relative transition-colors",
    isGlass ? GLASS_ENTRY_BUTTON : "bg-teal-600 text-white hover:bg-teal-700",
  )
  const content = (
    <>
      {isGlass && <GlassRim radius={10} {...GLASS_RIM} />}
      <span className="relative">지원하기</span>
    </>
  )

  // 모집 기간이 아닌데도 자리를 지키는 경우. 모양은 그대로 두고 이동만 막는다.
  // aria-disabled 로 알려 두어야 화면 낭독기에서 눌러도 안 되는 이유가 전해진다.
  if (!showApplyCta) {
    return (
      <button
        type="button"
        aria-disabled="true"
        className={cn(className, "cursor-default")}
      >
        {content}
      </button>
    )
  }

  return (
    <Link to={APPLY_ENTRY_PATH} className={className}>
      {content}
    </Link>
  )
}
