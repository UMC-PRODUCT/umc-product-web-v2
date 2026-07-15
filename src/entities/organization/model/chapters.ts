// 지부(chapter) 정적 목록. URL search param 검증과 세그먼트 탭 렌더링에
// 동기적으로 필요해서 상수로 유지한다.
// TODO: 지부 개편 시 getAllChapters API 기반으로 전환 검토 (라우트 진입 시점의
// 동기 검증을 비동기 데이터로 대체하는 방안 필요)
export const CHAPTERS = [
  "Chromium",
  "Ferrum",
  "Neon",
  "Platinum",
  "Selenium",
  "Xenon",
] as const

export type Chapter = (typeof CHAPTERS)[number]

export function isChapter(value: unknown): value is Chapter {
  return (
    typeof value === "string" && (CHAPTERS as readonly string[]).includes(value)
  )
}
