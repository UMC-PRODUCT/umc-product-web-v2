import { describe, expect, it } from "vitest"

import { resolveMatchingApplicationView } from "./applicationViewMode"

describe("resolveMatchingApplicationView", () => {
  it("운영진+PM 복합 신분은 admin mode에서 운영진 화면만 본다", () => {
    expect(
      resolveMatchingApplicationView({
        mode: "admin",
        canViewAdminApplications: true,
        canViewPmApplications: true,
        canViewOwnApplications: false,
      }),
    ).toBe("admin")
  })

  it("운영진+PM 복합 신분은 pm mode에서 PM 화면만 본다", () => {
    expect(
      resolveMatchingApplicationView({
        mode: "pm",
        canViewAdminApplications: true,
        canViewPmApplications: true,
        canViewOwnApplications: false,
      }),
    ).toBe("pm")
  })

  it("운영진+비PM 챌린저는 others mode에서 내 지원 현황을 본다", () => {
    expect(
      resolveMatchingApplicationView({
        mode: "others",
        canViewAdminApplications: true,
        canViewPmApplications: false,
        canViewOwnApplications: true,
      }),
    ).toBe("others")
  })

  it("현재 mode가 불가능하면 가능한 화면 중 우선순위가 높은 화면으로 보정한다", () => {
    expect(
      resolveMatchingApplicationView({
        mode: "others",
        canViewAdminApplications: false,
        canViewPmApplications: true,
        canViewOwnApplications: false,
      }),
    ).toBe("pm")
  })

  it("가능한 화면이 없으면 none을 반환한다", () => {
    expect(
      resolveMatchingApplicationView({
        mode: "admin",
        canViewAdminApplications: false,
        canViewPmApplications: false,
        canViewOwnApplications: false,
      }),
    ).toBe("none")
  })
})
