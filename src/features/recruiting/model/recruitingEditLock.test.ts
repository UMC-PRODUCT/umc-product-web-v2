import { describe, expect, it } from "vitest"

import { canEditQuotaRow } from "./recruitingEditLock"

describe("canEditQuotaRow", () => {
  const permitted = new Set(["100"])
  const canEditSeason = (seasonId: string | undefined) =>
    seasonId != null && permitted.has(String(seasonId))

  it("권한이 있는 시즌 행은 편집할 수 있다", () => {
    expect(
      canEditQuotaRow({
        seasonId: "100",
        canEditSeason,
        canCreateSeason: false,
      }),
    ).toBe(true)
  })

  it("권한이 없는 시즌 행은 잠긴다", () => {
    expect(
      canEditQuotaRow({
        seasonId: "200",
        canEditSeason,
        canCreateSeason: true,
      }),
    ).toBe(false)
  })

  // 시즌이 없는 학교는 값을 넣는 순간 시즌이 새로 만들어진다. 잠가 두면
  // 첫 TO 를 넣을 방법이 사라진다.
  it("시즌이 아직 없는 학교는 시즌을 만들 수 있는 사람에게 열린다", () => {
    expect(
      canEditQuotaRow({
        seasonId: undefined,
        canEditSeason,
        canCreateSeason: true,
      }),
    ).toBe(true)
  })

  it("시즌을 만들 수 없으면 시즌 없는 학교도 잠긴다", () => {
    expect(
      canEditQuotaRow({
        seasonId: undefined,
        canEditSeason,
        canCreateSeason: false,
      }),
    ).toBe(false)
  })

  // 미리보기나 테스트처럼 판정을 넘기지 않는 자리에서는 막지 않는다.
  it("판정 함수가 없으면 전부 편집 가능으로 본다", () => {
    expect(
      canEditQuotaRow({ seasonId: undefined, canCreateSeason: false }),
    ).toBe(true)
  })

  // 권한이 있는 시즌이면 시즌 생성 권한과 무관하게 열려야 한다.
  it("시즌 권한과 생성 권한은 서로를 가리지 않는다", () => {
    expect(
      canEditQuotaRow({
        seasonId: "100",
        canEditSeason,
        canCreateSeason: false,
      }),
    ).toBe(true)
  })
})
