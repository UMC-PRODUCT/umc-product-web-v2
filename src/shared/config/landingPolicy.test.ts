import { describe, expect, it } from "vitest"

import {
  CHALLENGER_LANDING_PATH,
  GUEST_LANDING_PATH,
  OPERATOR_LANDING_PATH,
} from "./landingPolicy"

// 목적지는 시즌 성격에 따라 바뀐다. 바꿀 때 여기가 같이 깨져서, 무엇이
// 달라졌는지 눈에 보이게 한다.
describe("루트 진입 목적지 (리크루팅 기간)", () => {
  it("운영진은 리크루팅으로 간다", () => {
    expect(OPERATOR_LANDING_PATH).toBe("/recruiting/dashboard/applications")
  })

  it("일반 챌린저와 비로그인은 프로젝트로 간다", () => {
    expect(CHALLENGER_LANDING_PATH).toBe("/projects")
    expect(GUEST_LANDING_PATH).toBe("/projects")
  })

  it("운영진 목적지는 리크루팅 영역 안이어야 한다", () => {
    // 헤더 활성 판정이 /recruiting 접두사로 도는데, 목적지가 밖이면 탭이 꺼진다
    expect(OPERATOR_LANDING_PATH.startsWith("/recruiting/")).toBe(true)
  })
})
