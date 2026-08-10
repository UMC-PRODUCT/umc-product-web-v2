import { describe, expect, it } from "vitest"

import { isRecruitmentClosed } from "./recruitmentPostStatus"

const NOW = new Date("2026-08-09T02:00:00Z")

describe("isRecruitmentClosed", () => {
  it("운영진이 마감 처리했으면 마감이다", () => {
    expect(
      isRecruitmentClosed({ status: "CLOSED", documentEndAt: null }, NOW),
    ).toBe(true)
  })

  // 서버 status 는 공개 상태(임시저장·공개·마감처리)라 서류 마감일이 지나도
  // 저절로 바뀌지 않는다. 기간이 끝난 공고를 계속 모집 중으로 보여주면 안 된다.
  it("서류 마감이 지났으면 공개 상태여도 마감이다", () => {
    expect(
      isRecruitmentClosed(
        { status: "OPEN", documentEndAt: "2026-08-09T01:10:00Z" },
        NOW,
      ),
    ).toBe(true)
  })

  it("서류 마감 전이면 모집 중이다", () => {
    expect(
      isRecruitmentClosed(
        { status: "OPEN", documentEndAt: "2026-08-09T03:00:00Z" },
        NOW,
      ),
    ).toBe(false)
  })

  // 마감 시각 자체는 아직 접수 가능한 시점이다
  it("마감 시각과 같으면 아직 모집 중이다", () => {
    expect(
      isRecruitmentClosed(
        { status: "OPEN", documentEndAt: "2026-08-09T02:00:00Z" },
        NOW,
      ),
    ).toBe(false)
  })

  it("마감일을 모르면 공개 상태를 따른다", () => {
    expect(
      isRecruitmentClosed({ status: "OPEN", documentEndAt: null }, NOW),
    ).toBe(false)
    expect(
      isRecruitmentClosed({ status: "OPEN", documentEndAt: undefined }, NOW),
    ).toBe(false)
  })

  it("날짜를 읽을 수 없으면 공개 상태를 따른다", () => {
    expect(
      isRecruitmentClosed({ status: "OPEN", documentEndAt: "언젠가" }, NOW),
    ).toBe(false)
  })

  it("임시저장은 마감이 아니다", () => {
    expect(
      isRecruitmentClosed(
        { status: "DRAFT", documentEndAt: "2020-01-01T00:00:00Z" },
        NOW,
      ),
    ).toBe(false)
  })
})
