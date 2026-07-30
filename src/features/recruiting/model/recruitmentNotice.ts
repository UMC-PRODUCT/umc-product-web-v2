import dayjs from "dayjs"

import { toPartTagsFromTracks } from "./applicantMapper"

import type { PartTag } from "@/shared/model/domain"

import type { RecruitingRoundGroup } from "../api/types"

export interface RecruitmentNoticeItem {
  id: string
  title: string
  schoolName: string
  parts: PartTag[]
  documentStartAt: string
  documentEndAt: string
  isClosed: boolean
  dDay?: number
  logoUrl?: string
  announcement: string
  // 로그인한 사용자의 이 공고에 대한 기존 지원 상태. 없으면 아직 지원 전.
  appliedStatus?: "submitted" | "submittedEditable" | "draft"
}

// GET /public/rounds 응답(시즌·학교별로 묶인 그룹)을 카드 목록이 바로 쓸 수 있는 평평한 형태로 편다.
export function toRecruitmentNoticeItems(
  groups: RecruitingRoundGroup[],
): RecruitmentNoticeItem[] {
  const now = dayjs()
  return groups.flatMap((group) =>
    group.rounds.map((round) => ({
      id: round.roundId,
      title: round.title,
      schoolName: group.schoolName,
      parts: toPartTagsFromTracks(round.recruitableTracks),
      documentStartAt: round.documentStartAt ?? "",
      documentEndAt: round.documentEndAt ?? "",
      isClosed: !round.applicationOpen,
      dDay:
        round.applicationOpen && round.documentEndAt
          ? Math.max(0, dayjs(round.documentEndAt).diff(now, "day"))
          : undefined,
      announcement: round.announcement ?? "",
    })),
  )
}

// "2026-01-10 00:00 ~ 01-17 23:59" 형태. 종료일이 시작일과 같은 해면 연도를 생략
export function formatNoticePeriod(startAt: string, endAt: string): string {
  const start = dayjs(startAt)
  const end = dayjs(endAt)
  const endLabel = start.isSame(end, "year")
    ? end.format("MM-DD HH:mm")
    : end.format("YYYY-MM-DD HH:mm")
  return `${start.format("YYYY-MM-DD HH:mm")} ~ ${endLabel}`
}
