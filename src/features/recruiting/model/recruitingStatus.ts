import type { RecruitingStatus } from "@/shared/model/recruitingStatus"

export interface RecruitingPeriod {
  documentStartAt?: string | null
  documentEndAt?: string | null
  applicationOpen?: boolean
}

/**
 * 여러 차수를 묶어 헤더에 띄울 상태 하나를 만든다.
 *
 * 접수 중인 차수가 하나라도 있으면 접수 중이다. 학교마다 기간이 달라 어느 차수를
 * 대표로 고를 근거가 없으므로 D-day 는 내지 않고 상태만 말한다.
 *
 * 시작 전 차수만 있으면 `undefined` 를 낸다. 아직 열리지 않은 것을 마감이라고
 * 하면 틀린 말이 되고, 근거 없는 안내를 하느니 버튼을 그리지 않는 편이 낫다.
 */
export function resolveRecruitingStatus(
  periods: readonly RecruitingPeriod[],
  now: number,
): RecruitingStatus | undefined {
  if (periods.length === 0) return undefined

  let hasOpen = false
  let hasUpcoming = false

  for (const period of periods) {
    const start = period.documentStartAt
      ? Date.parse(period.documentStartAt)
      : NaN
    const end = period.documentEndAt ? Date.parse(period.documentEndAt) : NaN

    // 아직 시작 전이면 applicationOpen 이 켜져 있어도 접수 중이 아니다.
    const started = !Number.isFinite(start) || start <= now

    if (
      started &&
      Number.isFinite(end) &&
      end > now &&
      period.applicationOpen
    ) {
      hasOpen = true
      continue
    }
    if (Number.isFinite(start) && start > now) {
      hasUpcoming = true
    }
  }

  if (hasOpen) return { phase: "open" }
  if (hasUpcoming) return undefined
  return { phase: "closed" }
}

/**
 * 표시가 바뀌는 다음 시각. 화면을 열어 둔 채 이 시각을 넘기면 상태가 실제와
 * 어긋나므로, 호출부는 여기에 맞춰 다시 계산해야 한다.
 *
 * D-day 가 없어졌어도 여전히 필요하다. 마감 시각을 넘기는 순간 접수 중에서
 * 마감으로 바뀌는데, 헤더는 이동이 없으면 다시 그려지지 않는다.
 *
 * 넘길 경계가 없으면 `undefined`. 지난 차수만 있으면 더 바뀔 일이 없다.
 */
export function nextStatusBoundary(
  periods: readonly RecruitingPeriod[],
  now: number,
): number | undefined {
  const candidates: number[] = []
  for (const period of periods) {
    for (const raw of [period.documentStartAt, period.documentEndAt]) {
      const at = raw ? Date.parse(raw) : NaN
      if (Number.isFinite(at) && at > now) candidates.push(at)
    }
  }
  return candidates.length > 0 ? Math.min(...candidates) : undefined
}
