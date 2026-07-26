import dayjs from "dayjs"

import type { PartTag } from "@/shared/model/domain"

// TODO: 백엔드 스펙 필요
export interface RecruitmentNoticeItem {
  id: number
  title: string
  schoolName: string
  parts: PartTag[]
  documentStartAt: string
  documentEndAt: string
  isClosed: boolean
  dDay?: number
  logoUrl?: string
  announcement: string
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
