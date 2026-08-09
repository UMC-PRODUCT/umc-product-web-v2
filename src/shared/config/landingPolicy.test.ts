import { describe, expect, it } from "vitest"

import {
  CHALLENGER_LANDING_PATH,
  GUEST_LANDING_PATH,
  RECRUITING_HOME_PATH,
} from "./landingPolicy"

// 목적지는 시즌 성격에 따라 바뀐다. 바꿀 때 여기가 같이 깨져서, 무엇이
// 달라졌는지 눈에 보이게 한다.
describe("루트 진입 목적지", () => {
  // 운영진도 로그인하면 먼저 프로젝트를 본다. 리크루팅은 헤더 탭으로 들어간다.
  it("누구든 프로젝트로 간다", () => {
    expect(CHALLENGER_LANDING_PATH).toBe("/projects")
    expect(GUEST_LANDING_PATH).toBe("/projects")
  })
})

describe("리크루팅 기본 화면", () => {
  it("권한이 모자라 되돌려 보낼 때 쓰는 자리다", () => {
    expect(RECRUITING_HOME_PATH).toBe("/recruiting/dashboard/applications")
  })

  it("리크루팅 영역 안이어야 한다", () => {
    // 헤더 활성 판정이 /recruiting 접두사로 도는데, 목적지가 밖이면 탭이 꺼진다
    expect(RECRUITING_HOME_PATH.startsWith("/recruiting/")).toBe(true)
  })
})
