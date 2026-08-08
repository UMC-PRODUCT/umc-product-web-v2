import { describe, expect, it } from "vitest"

import { nextStatusBoundary, resolveRecruitingStatus } from "./recruitingStatus"

const NOW = Date.parse("2026-08-01T00:00:00Z")

function at(daysFromNow: number) {
  return new Date(NOW + daysFromNow * 24 * 60 * 60 * 1000).toISOString()
}

describe("resolveRecruitingStatus", () => {
  it("차수가 없으면 아무것도 표시하지 않는다", () => {
    // 버튼을 그리지 않아야 한다. 상태를 모르는데 마감이라고 하면 거짓말이 된다
    expect(resolveRecruitingStatus([], NOW)).toBeUndefined()
  })

  it("접수 중인 차수가 있으면 접수 중이다", () => {
    expect(
      resolveRecruitingStatus(
        [
          {
            documentStartAt: at(-3),
            documentEndAt: at(22),
            applicationOpen: true,
          },
        ],
        NOW,
      ),
    ).toEqual({ phase: "open" })
  })

  // 학교마다 기간이 달라 어느 차수를 대표로 고를 근거가 없다. 하나라도 열려
  // 있으면 열린 것이고, 그 이상은 말하지 않는다
  it("접수 중인 차수가 여럿이어도 접수 중 하나로만 말한다", () => {
    expect(
      resolveRecruitingStatus(
        [
          { documentEndAt: at(30), applicationOpen: true },
          { documentEndAt: at(5), applicationOpen: true },
          { documentEndAt: at(14), applicationOpen: true },
        ],
        NOW,
      ),
    ).toEqual({ phase: "open" })
  })

  it("시작 전 차수만 있으면 아무것도 표시하지 않는다", () => {
    // 아직 열리지 않은 것을 마감이라고 하면 틀린 말이 된다
    expect(
      resolveRecruitingStatus(
        [
          {
            documentStartAt: at(7),
            documentEndAt: at(20),
            applicationOpen: true,
          },
        ],
        NOW,
      ),
    ).toBeUndefined()
  })

  it("시작한 차수와 예정 차수가 섞이면 접수 중이다", () => {
    expect(
      resolveRecruitingStatus(
        [
          {
            documentStartAt: at(7),
            documentEndAt: at(20),
            applicationOpen: true,
          },
          {
            documentStartAt: at(-1),
            documentEndAt: at(10),
            applicationOpen: true,
          },
        ],
        NOW,
      ),
    ).toEqual({ phase: "open" })
  })

  // applicationOpen 이 false 면 기간이 남았어도 지원을 받지 않는다
  it("기간이 남아도 지원을 닫아 두면 열린 것으로 보지 않는다", () => {
    expect(
      resolveRecruitingStatus(
        [{ documentEndAt: at(10), applicationOpen: false }],
        NOW,
      ),
    ).toEqual({ phase: "closed" })
  })

  it("전부 지났으면 마감이다", () => {
    expect(
      resolveRecruitingStatus(
        [
          {
            documentStartAt: at(-30),
            documentEndAt: at(-1),
            applicationOpen: true,
          },
        ],
        NOW,
      ),
    ).toEqual({ phase: "closed" })
  })

  it("마감 시각을 넘기기 전까지는 접수 중이다", () => {
    const justBeforeClose = Date.parse("2026-08-01T23:58:00+09:00")
    expect(
      resolveRecruitingStatus(
        [{ documentEndAt: "2026-08-01T23:59:00+09:00", applicationOpen: true }],
        justBeforeClose,
      ),
    ).toEqual({ phase: "open" })
  })

  it("마감 시각을 넘기면 마감이다", () => {
    const justAfterClose = Date.parse("2026-08-02T00:00:00+09:00")
    expect(
      resolveRecruitingStatus(
        [{ documentEndAt: "2026-08-01T23:59:00+09:00", applicationOpen: true }],
        justAfterClose,
      ),
    ).toEqual({ phase: "closed" })
  })

  it("날짜가 비어 있어도 터지지 않는다", () => {
    expect(
      resolveRecruitingStatus(
        [{ documentStartAt: null, documentEndAt: undefined }],
        NOW,
      ),
    ).toEqual({ phase: "closed" })
  })
})

describe("nextStatusBoundary", () => {
  it("가장 먼저 오는 시작·마감 시각을 준다", () => {
    expect(
      nextStatusBoundary(
        [
          { documentStartAt: at(3), documentEndAt: at(20) },
          { documentStartAt: at(-1), documentEndAt: at(10) },
        ],
        NOW,
      ),
    ).toBe(Date.parse(at(3)))
  })

  // 지난 차수만 남으면 표시가 더 바뀔 일이 없다. 타이머를 걸 이유가 없다
  it("지난 시각뿐이면 경계가 없다", () => {
    expect(
      nextStatusBoundary(
        [{ documentStartAt: at(-30), documentEndAt: at(-1) }],
        NOW,
      ),
    ).toBeUndefined()
  })

  it("차수가 없으면 경계가 없다", () => {
    expect(nextStatusBoundary([], NOW)).toBeUndefined()
  })
})
