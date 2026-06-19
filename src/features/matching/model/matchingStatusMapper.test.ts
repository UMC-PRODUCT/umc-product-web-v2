import { describe, expect, it } from "vitest"

import { toMatchingPartDataList } from "./matchingStatusMapper"

import type { ManagedProjectSummaryResponse } from "@/features/application/model/apiTypes"
import type { ProjectMembersResponse } from "@/features/project/list/api/matchingProject"

const baseProject: ManagedProjectSummaryResponse = {
  id: "1",
  name: "테스트 프로젝트",
  description: "설명",
  thumbnailImageUrl: "",
  status: "IN_PROGRESS",
  productOwner: {
    memberId: "100",
    nickname: "닉네임",
    name: "이름",
    schoolName: "가천대",
  },
  partQuotas: [
    { part: "WEB", quota: "3", currentCount: "0", status: "RECRUITING" },
    { part: "SPRINGBOOT", quota: "2", currentCount: "0", status: "RECRUITING" },
    { part: "DESIGN", quota: "1", currentCount: "0", status: "RECRUITING" },
  ],
  partQuotaStatus: "RECRUITING",
}

const makeMembers = (
  partGroups: ProjectMembersResponse["partGroups"],
): Map<string, ProjectMembersResponse> =>
  new Map([
    [
      "1",
      {
        projectId: "1",
        productOwner: {
          memberId: "100",
          nickname: "닉네임",
          name: "이름",
          schoolName: "가천대",
          matchedRoundInfo: null,
        },
        coProductOwners: [],
        partGroups,
      },
    ],
  ])

describe("toMatchingPartDataList - 지원자/멤버 없을 때", () => {
  it("지원자도 멤버도 없어도 Web 탭에 프로젝트가 포함된다", () => {
    const result = toMatchingPartDataList([baseProject], new Map())
    const webPart = result.find((p) => p.partName === "Web")
    expect(webPart).toBeDefined()
    expect(webPart?.projects).toHaveLength(1)
  })

  it("Frontend 행이 WEB quota(3) 수만큼 빈 슬롯(type: none)을 가진다", () => {
    const result = toMatchingPartDataList([baseProject], new Map())
    const project = result.find((p) => p.partName === "Web")?.projects[0]
    const feRow = project?.roleRows.find((r) => r.role === "Frontend")
    const noneBlocks = feRow?.blocks.filter((b) => b.type === "none")
    expect(noneBlocks).toHaveLength(3)
  })

  it("Design 행이 DESIGN quota(1) 수만큼 빈 슬롯을 가진다", () => {
    const result = toMatchingPartDataList([baseProject], new Map())
    const project = result.find((p) => p.partName === "Web")?.projects[0]
    const designRow = project?.roleRows.find((r) => r.role === "Design")
    const noneBlocks = designRow?.blocks.filter((b) => b.type === "none")
    expect(noneBlocks).toHaveLength(1)
  })

  it("Backend 행이 SPRINGBOOT quota(2) 수만큼 빈 슬롯을 가진다", () => {
    const result = toMatchingPartDataList([baseProject], new Map())
    const project = result.find((p) => p.partName === "Web")?.projects[0]
    const beRow = project?.roleRows.find((r) => r.role === "Backend")
    const noneBlocks = beRow?.blocks.filter((b) => b.type === "none")
    expect(noneBlocks).toHaveLength(2)
  })
})

describe("toMatchingPartDataList - 탭 분류", () => {
  it("WEB quota가 0이면 Web 탭에 포함되지 않는다", () => {
    const project: ManagedProjectSummaryResponse = {
      ...baseProject,
      partQuotas: [
        { part: "DESIGN", quota: "1", currentCount: "0", status: "RECRUITING" },
        {
          part: "SPRINGBOOT",
          quota: "2",
          currentCount: "0",
          status: "RECRUITING",
        },
      ],
    }
    const result = toMatchingPartDataList([project], new Map())
    expect(result.find((p) => p.partName === "Web")).toBeUndefined()
  })

  it("IOS quota가 있으면 iOS 탭에 포함된다", () => {
    const project: ManagedProjectSummaryResponse = {
      ...baseProject,
      partQuotas: [
        { part: "IOS", quota: "2", currentCount: "0", status: "RECRUITING" },
        {
          part: "SPRINGBOOT",
          quota: "2",
          currentCount: "0",
          status: "RECRUITING",
        },
      ],
    }
    const result = toMatchingPartDataList([project], new Map())
    expect(result.find((p) => p.partName === "iOS")).toBeDefined()
  })

  it("프로젝트가 없으면 빈 배열을 반환한다", () => {
    expect(toMatchingPartDataList([], new Map())).toEqual([])
  })
})

describe("toMatchingPartDataList - 멤버 배정 시", () => {
  it("WEB 1명 배정 시 빈 슬롯이 quota(3) - 1 = 2개가 된다", () => {
    const members = makeMembers([
      {
        part: "WEB",
        members: [
          {
            memberId: "200",
            nickname: "닉2",
            name: "이름2",
            schoolName: "가천대",
            matchedRoundInfo: { phase: "FIRST" },
          },
        ],
      },
    ])
    const result = toMatchingPartDataList([baseProject], members)
    const feRow = result
      .find((p) => p.partName === "Web")
      ?.projects[0]?.roleRows.find((r) => r.role === "Frontend")
    expect(feRow?.blocks.filter((b) => b.type === "none")).toHaveLength(2)
    expect(
      feRow?.blocks.filter((b) => b.type === "round1" || b.type === "filled"),
    ).toHaveLength(1)
  })

  it("quota만큼 전부 배정되면 빈 슬롯이 0개다", () => {
    const members = makeMembers([
      {
        part: "WEB",
        members: [
          {
            memberId: "1",
            nickname: "a",
            name: "a",
            schoolName: "a",
            matchedRoundInfo: { phase: "FIRST" },
          },
          {
            memberId: "2",
            nickname: "b",
            name: "b",
            schoolName: "b",
            matchedRoundInfo: { phase: "SECOND" },
          },
          {
            memberId: "3",
            nickname: "c",
            name: "c",
            schoolName: "c",
            matchedRoundInfo: { phase: "THIRD" },
          },
        ],
      },
    ])
    const result = toMatchingPartDataList([baseProject], members)
    const feRow = result
      .find((p) => p.partName === "Web")
      ?.projects[0]?.roleRows.find((r) => r.role === "Frontend")
    expect(feRow?.blocks.filter((b) => b.type === "none")).toHaveLength(0)
  })
})
