import type { RecruitmentPostStatus } from "./recruitmentList"

export interface RecruitmentClosingInput {
  status: RecruitmentPostStatus
  /** 서류 접수 마감 시각. 모르면 없다. */
  documentEndAt?: string | null
}

/**
 * 모집이 끝났는지.
 *
 * 서버의 status 는 공개 상태(임시저장·공개·마감처리)라 서류 마감일이 지나도
 * 저절로 바뀌지 않는다. 운영진이 직접 마감 처리를 눌러야 CLOSED 가 된다.
 * 그래서 status 만 보면 몇 주 전에 끝난 공고도 계속 모집 중으로 보인다.
 *
 * 임시저장은 아직 공개하지 않은 글이라 기간과 무관하게 마감으로 보지 않는다.
 */
export function isRecruitmentClosed(
  { status, documentEndAt }: RecruitmentClosingInput,
  now: Date = new Date(),
): boolean {
  if (status === "DRAFT") return false
  if (status === "CLOSED") return true

  if (!documentEndAt) return false
  const endedAt = Date.parse(documentEndAt)
  if (Number.isNaN(endedAt)) return false

  return endedAt < now.getTime()
}
