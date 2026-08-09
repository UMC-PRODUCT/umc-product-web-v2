/**
 * 헤더의 `지원하기` 를 띄울 모집 기간.
 *
 * 기간을 내려주는 경로가 없어서가 아니라, 아직 아무 학교도 차수를 열지 않아서
 * 고정해 둔다. 공개 차수 목록은 게스트도 받을 수 있고 useHeaderRecruitingStatus
 * 가 이미 그것으로 판정하는데, 열린 차수가 하나도 없으면 마감으로 떨어져 진입로가
 * 통째로 사라진다.
 *
 * 그러므로 제거 조건은 "차수가 열렸는지" 하나다. 열리는 대로 이 파일을 지우고
 * useHeaderRecruitingStatus 판정으로 되돌린다.
 *
 * 시각은 한국 기준이다. 오프셋을 적지 않으면 보는 사람의 시간대에 따라 열리고
 * 닫히는 순간이 달라진다.
 */
export const RECRUITING_PERIOD_START = "2026-08-09T00:00:00+09:00"
export const RECRUITING_PERIOD_END = "2026-09-01T00:00:00+09:00"

/** 헤더 `지원하기` 가 보내는 곳. 로그인 여부와 상관없이 같은 화면으로 보낸다. */
export const APPLY_ENTRY_PATH = "/projects/apply-guide"

/** 끝나는 시각은 포함하지 않는다. 09-01 00:00 은 이미 닫힌 것으로 본다. */
export function isWithinRecruitingPeriod(now: Date = new Date()): boolean {
  const at = now.getTime()
  return (
    at >= Date.parse(RECRUITING_PERIOD_START) &&
    at < Date.parse(RECRUITING_PERIOD_END)
  )
}

/**
 * 표시가 바뀌는 다음 시각. 이미 끝났으면 없다.
 *
 * 헤더는 이동이 없으면 다시 그려지지 않아, 화면을 열어 둔 채 마감을 넘기면
 * 지원하기가 그대로 남는다. 마감된 뒤에도 눌리는 지원 버튼이 가장 나쁘다.
 */
export function nextRecruitingPeriodBoundary(
  now: number = Date.now(),
): number | undefined {
  const start = Date.parse(RECRUITING_PERIOD_START)
  const end = Date.parse(RECRUITING_PERIOD_END)
  if (now < start) return start
  if (now < end) return end
  return undefined
}
