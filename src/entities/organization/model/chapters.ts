// 지부(chapter) 타입 및 유틸리티.
// 지부 목록은 서버 API(getChaptersWithSchools)에서 활성 기수(gisuId)에 맞게 동적으로 조회한다.

export type Chapter = string

export function isChapter(value: unknown): value is Chapter {
  return typeof value === "string" && value.trim().length > 0
}
