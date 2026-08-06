import { describe, expect, it } from "vitest"

import { buildRecruitingNavItems, isNavActive } from "./recruitingHeaderNav"

const SETTINGS_ENTRY = "/manage/school"

const GUEST = {
  isAuthed: false,
  showRecruiting: false,
  showSettings: false,
  settingsEntryPath: SETTINGS_ENTRY,
}
const CHALLENGER = { ...GUEST, isAuthed: true }
const SCHOOL_STAFF = { ...CHALLENGER, showRecruiting: true }
const CENTRAL = { ...SCHOOL_STAFF, showSettings: true }

function labelsFor(visibility: typeof GUEST) {
  return buildRecruitingNavItems(visibility).map((item) => item.label)
}

/** 해당 경로에서 활성으로 켜지는 탭 라벨 */
function activeLabels(pathname: string, visibility: typeof GUEST) {
  return buildRecruitingNavItems(visibility)
    .filter((item) => isNavActive(pathname, item))
    .map((item) => item.label)
}

describe("역할별 노출 탭", () => {
  it("비로그인은 매칭·리크루팅·설정을 보지 못한다", () => {
    expect(labelsFor(GUEST)).toEqual(["소개", "모집 안내", "프로젝트"])
  })

  // 매칭이 챌린저의 주 사용처인데 헤더에 진입로가 없었다
  it("로그인하면 데모데이 매칭이 생긴다", () => {
    expect(labelsFor(CHALLENGER)).toContain("데모데이 매칭")
    expect(labelsFor(CHALLENGER)).not.toContain("리크루팅")
  })

  it("운영진은 리크루팅까지, 중앙은 설정까지 본다", () => {
    expect(labelsFor(SCHOOL_STAFF)).not.toContain("설정")
    expect(labelsFor(SCHOOL_STAFF)).toContain("리크루팅")
    expect(labelsFor(CENTRAL)).toContain("설정")
  })
})

describe("경로별 활성 표시", () => {
  // 탭 목적지는 대시보드인데 활성은 영역 전체여야 한다
  it("리크루팅 하위 어디서든 리크루팅이 활성이다", () => {
    for (const path of [
      "/recruiting/dashboard/applications",
      "/recruiting/dashboard/evaluations",
      "/recruiting/recruitments",
      "/recruiting/recruitments/quota",
      "/recruiting/evaluations/document/40",
      "/recruiting/history/archive",
    ]) {
      expect(activeLabels(path, CENTRAL)).toEqual(["리크루팅"])
    }
  })

  it("매칭 하위 어디서든 데모데이 매칭이 활성이다", () => {
    for (const path of [
      "/matching",
      "/matching/projects",
      "/matching/projects/edit/7",
      "/matching/rounds",
    ]) {
      expect(activeLabels(path, CENTRAL)).toEqual(["데모데이 매칭"])
    }
  })

  it("설정 영역은 탭 목적지가 아닌 경로에서도 활성이다", () => {
    expect(activeLabels("/manage/chapter", CENTRAL)).toEqual(["설정"])
    expect(activeLabels("/manage/curriculum/create", CENTRAL)).toEqual(["설정"])
  })

  it("프로젝트 하위는 게스트에게도 활성이다", () => {
    expect(activeLabels("/projects", GUEST)).toEqual(["프로젝트"])
    expect(activeLabels("/projects/notice", GUEST)).toEqual(["프로젝트"])
  })

  // `모집 안내`가 자리표시자 `/` 를 목적지로 갖고 있어 루트에서 켜지던 문제
  it("비활성 탭은 루트에서도 켜지지 않는다", () => {
    expect(activeLabels("/", CENTRAL)).toEqual([])
  })

  it("한 경로에서 두 탭이 동시에 켜지지 않는다", () => {
    for (const path of [
      "/intro",
      "/projects",
      "/matching/projects",
      "/recruiting/recruitments",
      "/manage/school",
    ]) {
      expect(activeLabels(path, CENTRAL).length).toBeLessThanOrEqual(1)
    }
  })
})
