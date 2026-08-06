import { describe, expect, it } from "vitest"

import { resolveRecruitingStatus } from "./recruitingStatus"

const NOW = Date.parse("2026-08-01T00:00:00Z")

function at(daysFromNow: number) {
  return new Date(NOW + daysFromNow * 24 * 60 * 60 * 1000).toISOString()
}

describe("resolveRecruitingStatus", () => {
  it("차수가 없으면 아무것도 표시하지 않는다", () => {
    // 버튼을 그리지 않아야 한다. 상태를 모르는데 마감이라고 하면 거짓말이 된다
    expect(resolveRecruitingStatus([], NOW)).toBeUndefined()
  })

  it("열린 차수가 있으면 지원 마감까지 남은 일수를 준다", () => {
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
    ).toEqual({ phase: "open", dDay: 22 })
  })

  // 마감이 임박한 쪽을 보여줘야 지원자가 놓치지 않는다
  it("열린 차수가 여럿이면 가장 먼저 마감하는 것을 쓴다", () => {
    expect(
      resolveRecruitingStatus(
        [
          { documentEndAt: at(30), applicationOpen: true },
          { documentEndAt: at(5), applicationOpen: true },
          { documentEndAt: at(14), applicationOpen: true },
        ],
        NOW,
      ),
    ).toEqual({ phase: "open", dDay: 5 })
  })

  it("아직 시작 전이면 시작까지 남은 일수를 준다", () => {
    expect(
      resolveRecruitingStatus(
        [
          { documentStartAt: at(7), documentEndAt: at(20) },
          { documentStartAt: at(15), documentEndAt: at(30) },
        ],
        NOW,
      ),
    ).toEqual({ phase: "before", dDay: 7 })
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

  it("날짜가 비어 있어도 터지지 않는다", () => {
    expect(
      resolveRecruitingStatus(
        [{ documentStartAt: null, documentEndAt: undefined }],
        NOW,
      ),
    ).toEqual({ phase: "closed" })
  })
})
