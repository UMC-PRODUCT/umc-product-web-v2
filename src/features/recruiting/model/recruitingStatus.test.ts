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

  it("시작 전이면 applicationOpen 이 켜져 있어도 시작까지 남은 일수를 준다", () => {
    // 시작 시각을 안 보면 예정 차수를 "마감 D-n" 으로 잘못 알린다
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
    ).toEqual({ phase: "before", dDay: 7 })
  })

  it("시작한 차수와 예정 차수가 섞이면 시작한 쪽의 마감을 쓴다", () => {
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
    ).toEqual({ phase: "open", dDay: 10 })
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

  // 경과 시간(24시간)으로 세면 마감 당일 자정 직후에도 1 이 나온다.
  // 모집 공고 화면이 KST 날짜 경계를 쓰므로 헤더도 같은 값이어야 한다.
  it("마감 당일이면 시각과 무관하게 0 이다", () => {
    const kstMidnight = Date.parse("2026-08-01T00:01:00+09:00")
    expect(
      resolveRecruitingStatus(
        [{ documentEndAt: "2026-08-01T23:59:00+09:00", applicationOpen: true }],
        kstMidnight,
      ),
    ).toEqual({ phase: "open", dDay: 0 })
  })

  it("브라우저 시간대가 달라도 KST 날짜로 센다", () => {
    // UTC 로 보면 7/31 이지만 KST 로는 8/1 이다
    const beforeKstNoon = Date.parse("2026-08-01T09:30:00+09:00")
    expect(
      resolveRecruitingStatus(
        [{ documentEndAt: "2026-08-03T10:00:00+09:00", applicationOpen: true }],
        beforeKstNoon,
      ),
    ).toEqual({ phase: "open", dDay: 2 })
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
