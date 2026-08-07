/**
 * 헤더 우측 모집 상태 라벨의 표시 값.
 *
 * D-day 를 담지 않는다. 학교마다 모집 차수 기간이 달라, 전 화면에 뜨는 헤더에
 * 숫자 하나를 띄우면 "누구의 마감일인가" 가 정해지지 않는다.
 *
 * `모집 시작 D-n` 도 같은 이유로 없다. 공개 모집 목록 API 의 phase 가
 * OPEN(접수 중)·PAST(마감) 뿐이라 아직 시작하지 않은 차수는 내려오지도 않는다.
 */
export type RecruitingStatus = { phase: "open" } | { phase: "closed" }
