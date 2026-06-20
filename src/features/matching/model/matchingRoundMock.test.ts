import { describe, expect, it } from "vitest"

import {
  computeDecisionDeadline,
  parseServerDatetime,
  toISODatetime,
} from "./matchingRoundMock"

// 차수 등록 환경(브라우저)이 KST(UTC+9)인지. 운영 기준 타임존.
const AMBIENT_IS_KST =
  new Date("2026-06-20T00:00:00").getTimezoneOffset() === -540

// UTC instant -> KST(고정 +9h) 벽시계 문자열. ambient 타임존과 무관하게 동작.
function kstWallClock(iso: string): string {
  const kst = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000)
  const y = kst.getUTCFullYear()
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0")
  const d = String(kst.getUTCDate()).padStart(2, "0")
  const hh = String(kst.getUTCHours()).padStart(2, "0")
  const mm = String(kst.getUTCMinutes()).padStart(2, "0")
  return `${y}-${m}-${d} ${hh}:${mm}`
}

describe("computeDecisionDeadline (타임존 무관 — UTC instant 연산)", () => {
  it("다음 차수 있음 -> 다음 차수 startsAt - 5분", () => {
    expect(
      computeDecisionDeadline(
        "2026-06-19T03:00:00.000Z",
        "2026-06-20T00:00:00.000Z",
      ),
    ).toBe("2026-06-19T23:55:00.000Z")
  })

  it("마지막 차수 -> endsAt + 12시간", () => {
    expect(computeDecisionDeadline("2026-06-19T03:00:00.000Z", undefined)).toBe(
      "2026-06-19T15:00:00.000Z",
    )
  })

  // 인시던트 핵심: 운영자가 '자정 마감'으로 인지해도 다음 차수가 자정에 시작하면
  // 2차 결정 마감은 자정 5분 전이다. (타임존과 무관한 규칙 자체를 고정)
  it("다음 차수 자정(UTC) 시작 -> 결정 마감은 자정 5분 전(23:55Z), 자정이 아님", () => {
    const deadline = computeDecisionDeadline(
      "2026-06-19T03:00:00.000Z",
      "2026-06-20T00:00:00.000Z",
    )
    expect(deadline).toBe("2026-06-19T23:55:00.000Z")
    expect(deadline).not.toBe("2026-06-20T00:00:00.000Z")
  })
})

describe("toISODatetime / parseServerDatetime (ambient 타임존 의존)", () => {
  it("toISODatetime은 ambient 타임존 오프셋만큼 UTC instant가 이동한다", () => {
    const offsetMs =
      new Date("2026-06-20T00:00:00").getTimezoneOffset() * 60 * 1000
    expect(toISODatetime("2026-06-20", "00:00", "start")).toBe(
      new Date(Date.UTC(2026, 5, 20, 0, 0, 0) + offsetMs).toISOString(),
    )
  })

  it("parse -> toISO 왕복은 같은 환경에서 벽시계를 보존한다", () => {
    const utc = "2026-06-19T15:00:00.000Z"
    const { date, time } = parseServerDatetime(utc)
    expect(toISODatetime(date, time, "start")).toBe(utc)
  })
})

// 차수를 KST 브라우저에서 등록했을 때만 의도대로 동작함을 고정.
// 비-KST 환경(예: TZ=UTC)에서 돌리면 이 블록이 skip 되며, 그 자체로
// "등록 환경 타임존에 동작이 좌우된다"는 사실을 드러낸다.
describe.runIf(AMBIENT_IS_KST)("KST 환경 인시던트 재현", () => {
  it("운영자가 '자정까지'로 인지한 2차 결정 마감은 실제 23:55 KST", () => {
    const nextStart = toISODatetime("2026-06-20", "00:00", "start")
    const deadline = computeDecisionDeadline("2026-06-19T03:00:00.000Z", nextStart)
    expect(kstWallClock(deadline)).toBe("2026-06-19 23:55")
  })

  it("11:50~11:52(KST) 시도는 23:55 마감 이전이라 정상이면 열려 있어야 한다", () => {
    const nextStart = toISODatetime("2026-06-20", "00:00", "start")
    const deadlineMs = new Date(
      computeDecisionDeadline("2026-06-19T03:00:00.000Z", nextStart),
    ).getTime()
    const tryAt = new Date("2026-06-19T14:51:00.000Z").getTime() // 23:51 KST
    expect(tryAt < deadlineMs).toBe(true)
  })
})

// 비-KST 환경에서 동일 입력이 어떻게 어긋나는지 명시적으로 고정 (CI TZ=UTC 가정).
describe.runIf(!AMBIENT_IS_KST)("비-KST 환경에서의 마감 어긋남", () => {
  it("같은 '자정' 입력이라도 ambient가 UTC면 결정 마감 KST 벽시계가 23:55가 아니다", () => {
    const nextStart = toISODatetime("2026-06-20", "00:00", "start")
    const deadline = computeDecisionDeadline("2026-06-19T03:00:00.000Z", nextStart)
    expect(kstWallClock(deadline)).not.toBe("2026-06-19 23:55")
  })
})
