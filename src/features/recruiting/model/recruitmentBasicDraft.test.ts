import { beforeEach, describe, expect, it } from "vitest"

import {
  clearRecruitmentBasicDraft,
  readRecruitmentBasicDraft,
  writeRecruitmentBasicDraft,
} from "./recruitmentBasicDraft"

import type { RecruitmentBasicInfo } from "./useRecruitmentCreateStore"

const BASIC_INFO: RecruitmentBasicInfo = {
  chapter: "Chromium",
  school: "가천대",
  recruitmentType: "REGULAR",
  roundNo: "1",
  interviewRequired: false,
  footer: "지원 문의",
  periodForm: {
    documentStartAt: { date: "2026-08-10", time: "10:00" },
    documentEndAt: { date: "2026-08-20", time: "23:59" },
    documentResultPublishedAt: { date: "2026-08-22", time: "18:00" },
    interviewStartAt: { date: "", time: "00:00" },
    interviewEndAt: { date: "", time: "00:00" },
    finalResultPublishedAt: { date: "2026-08-25", time: "18:00" },
  },
}

describe("recruitment basic draft storage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("회원별 기본 정보 초안을 저장하고 복원한다", () => {
    writeRecruitmentBasicDraft("member-1", BASIC_INFO)

    expect(readRecruitmentBasicDraft("member-1")?.basicInfo).toEqual(BASIC_INFO)
    expect(readRecruitmentBasicDraft("member-2")).toBeNull()
  })

  it("회원별 기본 정보 초안을 삭제한다", () => {
    writeRecruitmentBasicDraft("member-1", BASIC_INFO)

    clearRecruitmentBasicDraft("member-1")

    expect(readRecruitmentBasicDraft("member-1")).toBeNull()
  })

  it("손상된 저장값은 초안으로 복원하지 않는다", () => {
    localStorage.setItem(
      "umc:recruiting:create:basic-draft:member-1",
      "not-json",
    )

    expect(readRecruitmentBasicDraft("member-1")).toBeNull()
  })
})
