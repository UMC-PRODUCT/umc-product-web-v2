import { describe, expect, it } from "vitest"

import { toMatchingPartDataList } from "./matchingStatusMapper"

import type { ManagedProjectSummaryResponse } from "@/features/application/model/apiTypes"
import type { ProjectMembersResponse } from "@/features/project/list/api/matchingProject"

const baseProject: ManagedProjectSummaryResponse = {
  id: "1",
  name: "테스트 프로젝트",
  description: "테스트 프로젝트 설명",
  thumbnailImageUrl: null,
  productOwner: {
    memberId: "10",
    nickname: "포비",
    name: "김포비",
    schoolName: "테스트대학교",
  },
  partQuotas: [
    { part: "WEB", quota: "1", currentCount: "0", status: "RECRUITING" },
    { part: "SPRINGBOOT", quota: "1", currentCount: "0", status: "RECRUITING" },
  ],
  partQuotaStatus: "RECRUITING",
}

function makeProject(
  partQuotas: ManagedProjectSummaryResponse["partQuotas"],
): ManagedProjectSummaryResponse {
  return {
    ...baseProject,
    partQuotas,
  }
}

function makeMembers(
  partGroups: ProjectMembersResponse["partGroups"],
): Map<string, ProjectMembersResponse> {
  return new Map([
    [
      "1",
      {
        projectId: "1",
        productOwner: {
          memberId: "10",
          nickname: "포비",
          name: "김포비",
          schoolName: "테스트대학교",
          matchedRoundInfo: null,
        },
        coProductOwners: [],
        partGroups,
      },
    ],
  ])
}

describe("toMatchingPartDataList assignment slots", () => {
  it("iOS 프로젝트의 Frontend 빈 슬롯은 IOS part를 유지한다", () => {
    const project = makeProject([
      { part: "IOS", quota: "2", currentCount: "0", status: "RECRUITING" },
      {
        part: "SPRINGBOOT",
        quota: "1",
        currentCount: "0",
        status: "RECRUITING",
      },
    ])

    const result = toMatchingPartDataList([project], new Map())

    const frontendBlocks = result
      .find((part) => part.partName === "iOS")
      ?.projects[0]?.roleRows.find((row) => row.role === "Frontend")?.blocks

    expect(frontendBlocks?.filter((block) => block.type === "none")).toEqual([
      { type: "none", part: "IOS" },
      { type: "none", part: "IOS" },
    ])
  })

  it("Android 프로젝트의 Frontend 빈 슬롯은 ANDROID part를 유지한다", () => {
    const project = makeProject([
      { part: "ANDROID", quota: "2", currentCount: "0", status: "RECRUITING" },
      {
        part: "SPRINGBOOT",
        quota: "1",
        currentCount: "0",
        status: "RECRUITING",
      },
    ])

    const result = toMatchingPartDataList([project], new Map())

    const frontendBlocks = result
      .find((part) => part.partName === "Android")
      ?.projects[0]?.roleRows.find((row) => row.role === "Frontend")?.blocks

    expect(frontendBlocks?.filter((block) => block.type === "none")).toEqual([
      { type: "none", part: "ANDROID" },
      { type: "none", part: "ANDROID" },
    ])
  })

  it("Frontend 세부 파트가 함께 있으면 quota 순서대로 빈 슬롯 part를 만든다", () => {
    const project = makeProject([
      { part: "WEB", quota: "1", currentCount: "0", status: "RECRUITING" },
      { part: "ANDROID", quota: "1", currentCount: "0", status: "RECRUITING" },
      { part: "IOS", quota: "1", currentCount: "0", status: "RECRUITING" },
      {
        part: "SPRINGBOOT",
        quota: "1",
        currentCount: "0",
        status: "RECRUITING",
      },
    ])
    const members = makeMembers([
      {
        part: "WEB",
        members: [
          {
            memberId: "20",
            nickname: "웹",
            name: "김웹",
            schoolName: "테스트대학교",
            matchedRoundInfo: null,
          },
        ],
      },
    ])

    const result = toMatchingPartDataList([project], members)

    const frontendBlocks = result
      .find((part) => part.partName === "Web")
      ?.projects[0]?.roleRows.find((row) => row.role === "Frontend")?.blocks

    expect(
      frontendBlocks
        ?.filter((block) => block.type === "none")
        .map((block) => block.part),
    ).toEqual(["ANDROID", "IOS"])
  })
})
