// 헤더 우측 모집 상태 라벨의 표시 값.
// before/open 은 D-day 가 필수, closed 는 없다(D-undefined 방지).
export type RecruitingStatus =
  | { phase: "before"; dDay: number } // 모집 시작까지 남은 일수
  | { phase: "open"; dDay: number } // 지원 마감까지 남은 일수
  | { phase: "closed" }
