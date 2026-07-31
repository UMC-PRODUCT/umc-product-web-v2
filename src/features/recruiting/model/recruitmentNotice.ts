import dayjs from "dayjs"

import type { PartTag } from "@/shared/model/domain"

// TODO: 백엔드 스펙 필요
export interface RecruitmentNoticeItem {
  // 공개 모집 목록 응답의 round.roundId. 지원 폼(/projects/apply/$roundId)이
  // 차수와 지원 Form 을 찾는 열쇠이기도 하다.
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

// "2026-01-10 00:00 ~ 01-17 23:59" 형태. 종료일이 시작일과 같은 해면 연도를 생략
export function formatNoticePeriod(startAt: string, endAt: string): string {
  const start = dayjs(startAt)
  const end = dayjs(endAt)
  const endLabel = start.isSame(end, "year")
    ? end.format("MM-DD HH:mm")
    : end.format("YYYY-MM-DD HH:mm")
  return `${start.format("YYYY-MM-DD HH:mm")} ~ ${endLabel}`
}
