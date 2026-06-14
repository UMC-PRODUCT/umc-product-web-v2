import { useQuery } from "@tanstack/react-query"

import { getMemberProfile } from "@/features/challenger/api/member"
import {
  CHALLENGER_STATUS_LABEL,
  PART_LABEL,
  toNumberSafe,
} from "@/features/challenger/model/enums"
import { cn } from "@/shared/lib/utils"

import type { ChallengerInfoResponse } from "@/features/challenger/model/types"

interface MemberRecordListProps {
  memberId: string
  selectedChallengerId: string | null
  onSelect: (record: ChallengerInfoResponse) => void
}

export function MemberRecordList({
  memberId,
  selectedChallengerId,
  onSelect,
}: MemberRecordListProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["challenger", "member-profile", memberId],
    queryFn: () => getMemberProfile(memberId),
  })

  if (isLoading) {
    return (
      <p className="text-body-2-medium text-teal-gray-400">
        챌린저 기록을 불러오는 중입니다...
      </p>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-body-2-medium text-error-500">
        회원 정보를 불러오지 못했습니다.
      </p>
    )
  }

  const records = data.challengerRecords ?? []

  if (records.length === 0) {
    return (
      <p className="text-body-2-medium text-teal-gray-400">
        해당 회원의 챌린저 기록이 없습니다.
      </p>
    )
  }

  return (
    <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      {records.map((record, index) => {
        const isSelected = selectedChallengerId === record.challengerId
        const totalPoints = toNumberSafe(record.totalPoints)
        return (
          <li key={`${record.challengerId || "no-ch"}-${index}`}>
            <button
              type="button"
              onClick={() => onSelect(record)}
              className={cn(
                "border-teal-gray-100 flex w-full flex-col gap-2 rounded-[12px] border bg-white px-5 py-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/40",
                isSelected && "border-teal-400 bg-teal-50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-subtitle-3-semibold text-teal-gray-900">
                  {record.gisu}기 · {PART_LABEL[record.part]}
                </span>
                <span
                  className={cn(
                    "text-caption-2-medium rounded-full px-2 py-0.5",
                    record.challengerStatus === "ACTIVE"
                      ? "bg-teal-100 text-teal-600"
                      : "bg-teal-gray-100 text-teal-gray-500",
                  )}
                >
                  {CHALLENGER_STATUS_LABEL[record.challengerStatus]}
                </span>
              </div>
              <div className="text-body-2-medium text-teal-gray-600 flex flex-col gap-0.5">
                <span>
                  {record.chapterName} · {record.schoolName}
                </span>
                <span className="text-caption-2-medium text-teal-gray-500">
                  누적 점수 {totalPoints.toFixed(1)}점
                </span>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
