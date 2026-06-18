import { describe, expect, it } from "vitest"

import { computeAvailableViewModes } from "@/shared/view-mode/availableViewModes"
import { getProjectViewContext } from "@/shared/view-mode/projectViewContext"

import { normalizeMemberInfo } from "./me"

describe("normalizeMemberInfo", () => {
  it("기존 me 응답의 roles와 challengerRecords를 보존하고 currentGisuMemberInfo를 보강한다", () => {
    const me = normalizeMemberInfo({
      id: "2916",
      name: "송민서",
      nickname: "소온",
      email: "minseosong5@gmail.com",
      schoolId: "12",
      schoolName: "동아대학교",
      profileImageLink: null,
      status: "ACTIVE",
      roles: [
        {
          id: "185",
          challengerId: "751",
          roleType: "SCHOOL_PRESIDENT",
          organizationType: "SCHOOL",
          organizationId: "12",
          responsiblePart: undefined,
          gisuId: "5",
          gisu: "10",
        },
      ],
      challengerRecords: [
        {
          challengerId: "751",
          memberId: "2916",
          gisuId: "5",
          gisu: "10",
          chapterId: "31",
          chapterName: "Platinum",
          part: "SPRINGBOOT",
          challengerStatus: null,
          name: "송민서",
          nickname: "소온",
          email: null,
          schoolId: "12",
          schoolName: "동아대학교",
        },
      ],
    })

    expect(me.roles).toHaveLength(1)
    expect(me.roles[0]?.roleType).toBe("SCHOOL_PRESIDENT")
    expect(me.challengerRecords).toHaveLength(1)
    expect(me.currentGisuMemberInfo).toMatchObject({
      gisuId: "5",
      generation: "10",
      challenger: {
        challengerId: "751",
        part: "SPRINGBOOT",
        challengerStatus: "ACTIVE",
      },
      isAdmin: true,
      roleTypes: ["SCHOOL_PRESIDENT"],
    })
    expect(computeAvailableViewModes(me)).toEqual(["admin", "others"])
    expect(getProjectViewContext(me, "others")).toMatchObject({
      isChallengerView: true,
      currentPart: "SPRINGBOOT",
      currentChapterId: "31",
    })
  })
})
