import { describe, expect, it } from "vitest"

import { RECRUITING_HOME_PATH, ROOT_LANDING_PATH } from "./landingPolicy"

// 목적지는 시즌 성격에 따라 바뀐다. 바꿀 때 여기가 같이 깨져서, 무엇이
// 달라졌는지 눈에 보이게 한다.
describe("루트 진입 목적지", () => {
  // 로그인 여부와 역할을 가리지 않는다. 갈래가 없어야 게스트와 운영진이 같은
  // 첫 화면을 본다.
  it("누구든 소개 랜딩으로 간다", () => {
    expect(ROOT_LANDING_PATH).toBe("/about")
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
