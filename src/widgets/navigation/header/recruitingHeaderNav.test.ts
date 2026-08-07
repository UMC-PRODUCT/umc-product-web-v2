import { describe, expect, it } from "vitest"

import { buildRecruitingNavItems, isNavActive } from "./recruitingHeaderNav"

const SETTINGS_ENTRY = "/manage/school"

const GUEST = {
  isAuthed: false,
  showRecruiting: false,
  showSettings: false,
  settingsEntryPath: SETTINGS_ENTRY,
  isRecruitingPeriod: false,
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

// 데모데이와 리크루팅은 같이 돌지 않는다. 모집 중에 매칭 탭을 열어 두면
// 지난 시즌 화면으로 보낸다.
describe("모집 기간에는 데모데이 매칭을 감춘다", () => {
  it("로그인 사용자도 모집 중이면 매칭 탭이 없다", () => {
    const labels = labelsFor({ ...CHALLENGER, isRecruitingPeriod: true })
    expect(labels).not.toContain("데모데이 매칭")
    expect(labels).toEqual(["소개", "모집 안내", "프로젝트"])
  })

  it("운영진은 모집 중이어도 리크루팅 탭은 남는다", () => {
    const labels = labelsFor({ ...CENTRAL, isRecruitingPeriod: true })
    expect(labels).not.toContain("데모데이 매칭")
    expect(labels).toContain("리크루팅")
    expect(labels).toContain("설정")
  })

  it("모집이 끝나면 매칭 탭이 돌아온다", () => {
    expect(labelsFor({ ...CHALLENGER, isRecruitingPeriod: false })).toContain(
      "데모데이 매칭",
    )
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

  it("프로젝트 목록과 상세는 프로젝트 탭이 활성이다", () => {
    expect(activeLabels("/projects", GUEST)).toEqual(["프로젝트"])
    expect(activeLabels("/projects/49", GUEST)).toEqual(["프로젝트"])
  })

  it("모집 공고와 지원 화면은 모집 안내 탭이 활성이다", () => {
    expect(activeLabels("/projects/notice", GUEST)).toEqual(["모집 안내"])
    expect(activeLabels("/projects/apply/7", GUEST)).toEqual(["모집 안내"])
  })

  it("루트에서는 모집 안내 탭이 활성화되지 않는다", () => {
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
