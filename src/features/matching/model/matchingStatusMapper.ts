// 서버 응답 -> 매칭 현황 프론트 타입 변환

import { toRoundNumber } from "@/features/application/model/mappers"

import type { ManagedProjectSummaryResponse } from "@/features/application/model/apiTypes"
import type { Part } from "@/features/challenger/model/types"
import type { ProjectMembersResponse } from "@/features/project/list/api/matchingProject"

import type {
  MatchingBlockData,
  MatchingRoleRow,
} from "../ui/MatchingResultRow"
import type {
  MatchingPartData,
  MatchingProjectData,
} from "./matchingStatusTypes"

// phase 번호 -> 블록 타입/variant 매핑
function phaseToBlock(phase: number, name: string): MatchingBlockData {
  if (phase === 1) {
    return { type: "round1", name }
  }
  const variantMap: Record<number, "round2" | "round3" | "random"> = {
    2: "round2",
    3: "round3",
  }
  return {
    type: "filled",
    name,
    tagVariant: variantMap[phase] ?? "random",
  }
}

// 서버 part -> 역할 행 라벨 (ANDROID/IOS도 Frontend 행으로 표시)
const PART_TO_ROLE: Record<string, string> = {
  DESIGN: "Design",
  WEB: "Frontend",
  ANDROID: "Frontend",
  IOS: "Frontend",
  SPRINGBOOT: "Backend",
  NODEJS: "Backend",
}

const ROLE_TO_PARTS: Record<string, string[]> = {
  Design: ["DESIGN"],
  Frontend: ["WEB", "ANDROID", "IOS"],
  Backend: ["SPRINGBOOT", "NODEJS"],
}

// 각 역할에 대해 아직 채워지지 않은 파트별 남은 슬롯 수 계산
function getNeededParts(
  role: string,
  partQuotas: ManagedProjectSummaryResponse["partQuotas"],
  members: ProjectMembersResponse | undefined,
): Part[] {
  const subParts = ROLE_TO_PARTS[role] ?? []
  const neededParts: Part[] = []

  const filledCounts = new Map<string, number>()
  if (members) {
    for (const group of members.partGroups) {
      filledCounts.set(group.part, group.members.length)
    }
  }

  for (const part of subParts) {
    const partQuota =
      Number(partQuotas.find((q) => q.part === part)?.quota) || 0
    const filledCount = filledCounts.get(part) ?? 0
    const needed = Math.max(0, partQuota - filledCount)
    for (let i = 0; i < needed; i++) {
      neededParts.push(part as Part)
    }
  }
  return neededParts
}

// 섹션 헤더용 FE 플랫폼 분류
const FE_PLATFORM_ORDER = ["Web", "iOS", "Android"] as const
type FEPlatform = (typeof FE_PLATFORM_ORDER)[number]

const PART_TO_FE_PLATFORM: Record<string, FEPlatform> = {
  WEB: "Web",
  ANDROID: "Android",
  IOS: "iOS",
}

// 프로젝트 + 팀원 -> MatchingProjectData 변환
function toMatchingProject(
  project: ManagedProjectSummaryResponse,
  members: ProjectMembersResponse | undefined,
): MatchingProjectData {
  // partGroups(ProjectMember)를 기준으로 블록 구성 - 매칭 해제 시 즉시 반영
  // 차수 태그는 member.matchedRoundInfo.phase, 없으면 랜덤 매칭으로 표기
  const blocksByRole = new Map<string, MatchingBlockData[]>()
  if (members) {
    for (const group of members.partGroups) {
      const role = PART_TO_ROLE[group.part]
      if (!role) continue
      for (const member of group.members) {
        const displayName = member.nickname
          ? `${member.nickname}/${member.name}`
          : member.name
        const block: MatchingBlockData = member.matchedRoundInfo
          ? {
              ...phaseToBlock(
                toRoundNumber(member.matchedRoundInfo.phase),
                displayName,
              ),
              memberId: String(member.memberId),
              part: group.part as Part,
            }
          : {
              type: "filled" as const,
              name: displayName,
              tagVariant: "random" as const,
              memberId: String(member.memberId),
              part: group.part as Part,
            }
        const list = blocksByRole.get(role) ?? []
        list.push(block)
        blocksByRole.set(role, list)
      }
    }
  }

  // partQuotas에서 역할별 quota 추출
  const designQuota =
    Number(project.partQuotas.find((q) => q.part === "DESIGN")?.quota) || 0
  // WEB/ANDROID/IOS 중 해당 프로젝트의 FE 파트 quota 합산
  const feQuota = project.partQuotas
    .filter((q) => q.part === "WEB" || q.part === "ANDROID" || q.part === "IOS")
    .reduce((sum, q) => sum + Number(q.quota), 0)
  const beQuota = project.partQuotas
    .filter((q) => q.part === "SPRINGBOOT" || q.part === "NODEJS")
    .reduce((sum, q) => sum + Number(q.quota), 0)

  // Design: blocked 없음, 슬롯 수 = max(quota, filled), 최대 4
  function buildDesignRow(quota: number): MatchingRoleRow {
    const filledBlocks = blocksByRole.get("Design") ?? []
    const totalSlots = Math.min(Math.max(filledBlocks.length, quota), 4)
    const emptyCount = Math.max(
      0,
      Math.min(quota, totalSlots) - filledBlocks.length,
    )
    const neededParts = getNeededParts("Design", project.partQuotas, members)
    const emptyBlocks: MatchingBlockData[] = Array.from(
      { length: emptyCount },
      (_, index) => ({
        type: "none",
        part: neededParts[index] as Part,
      }),
    )
    return {
      role: "Design",
      blocks: [...filledBlocks.slice(0, totalSlots), ...emptyBlocks],
      colsPerRow: totalSlots,
    }
  }

  // FE/BE: 5칸 단위 행, 빈 칸은 blocked
  function buildRoleRow(role: string, quota: number): MatchingRoleRow {
    const filledBlocks = blocksByRole.get(role) ?? []
    const effectiveCount = Math.max(filledBlocks.length, quota)
    const colsPerRow = 5
    const totalSlots = Math.max(
      colsPerRow,
      Math.ceil(effectiveCount / colsPerRow) * colsPerRow,
    )

    const emptyCount = Math.max(0, quota - filledBlocks.length)
    const neededParts = getNeededParts(role, project.partQuotas, members)
    const emptyBlocks: MatchingBlockData[] = Array.from(
      { length: emptyCount },
      (_, index) => ({
        type: "none",
        part: neededParts[index] as Part,
      }),
    )
    const blockedCount = totalSlots - filledBlocks.length - emptyCount
    const blockedBlocks: MatchingBlockData[] = Array.from(
      { length: blockedCount },
      () => ({ type: "blocked" }),
    )
    return {
      role,
      blocks: [...filledBlocks, ...emptyBlocks, ...blockedBlocks],
      colsPerRow,
    }
  }

  const roleRows = [
    buildDesignRow(designQuota),
    buildRoleRow("Frontend", feQuota),
    buildRoleRow("Backend", beQuota),
  ]

  const hasNodejs = project.partQuotas.some(
    (q) => q.part === "NODEJS" && Number(q.quota) > 0,
  )
  const backendPart: "springboot" | "nodejs" = hasNodejs
    ? "nodejs"
    : "springboot"

  const totalCount = designQuota + feQuota + beQuota
  // 실제 배정된 멤버 수 (수동 배정 포함, 매칭 해제 즉시 반영)
  const currentCount = members
    ? members.partGroups.reduce((sum, g) => sum + g.members.length, 0)
    : 0

  return {
    projectId: project.id,
    projectName: project.name,
    challengerName: project.productOwner.nickname
      ? `${project.productOwner.nickname}/${project.productOwner.name}`
      : project.productOwner.name,
    challengerUniversity: project.productOwner.schoolName,
    backendPart,
    roleRows,
    status:
      project.partQuotaStatus === "RECRUITING" ? "recruiting" : "completed",
    currentCount,
    totalCount,
    thumbnailUrl: project.thumbnailImageUrl || undefined,
  }
}

export function toMatchingPartDataList(
  projects: ManagedProjectSummaryResponse[],
  membersByProject: Map<string, ProjectMembersResponse>,
): MatchingPartData[] {
  if (projects.length === 0) return []

  // FE 플랫폼별 프로젝트 그룹핑 (quota > 0인 파트 기준)
  const byPlatform = new Map<FEPlatform, ManagedProjectSummaryResponse[]>()
  for (const p of projects) {
    const addedPlatforms = new Set<FEPlatform>()
    for (const q of p.partQuotas) {
      const platform = PART_TO_FE_PLATFORM[q.part]
      if (platform && Number(q.quota) > 0 && !addedPlatforms.has(platform)) {
        addedPlatforms.add(platform)
        const list = byPlatform.get(platform) ?? []
        list.push(p)
        byPlatform.set(platform, list)
      }
    }
  }

  return FE_PLATFORM_ORDER.filter((platform) => byPlatform.has(platform)).map(
    (platform) => {
      const platformProjects = byPlatform.get(platform)!
      return {
        partName: platform,
        projects: platformProjects.map((p) =>
          toMatchingProject(p, membersByProject.get(String(p.id))),
        ),
      }
    },
  )
}
