// 서버 응답 -> 매칭 현황 프론트 타입 변환

import { toRoundNumber } from "@/features/application/model/mappers"

import type {
  ManagedProjectSummaryResponse,
  ProjectApplicantResponse,
} from "@/features/application/model/apiTypes"
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
function phaseToBlock(
  phase: number,
  name: string,
  applicantId?: string,
): MatchingBlockData {
  if (phase === 1) {
    return { type: "round1", name, ...(applicantId ? { applicantId } : {}) }
  }
  const variantMap: Record<number, "round2" | "round3" | "random"> = {
    2: "round2",
    3: "round3",
  }
  return {
    type: "filled",
    name,
    tagVariant: variantMap[phase] ?? "random",
    ...(applicantId ? { applicantId } : {}),
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
  approvedAppByMemberId: Map<string, ProjectApplicantResponse>,
  members: ProjectMembersResponse | undefined,
): Part[] {
  const subParts = ROLE_TO_PARTS[role] ?? []
  const neededParts: Part[] = []

  const filledCounts = new Map<string, number>()
  if (members) {
    for (const group of members.partGroups) {
      filledCounts.set(group.part, group.members.length)
    }
  } else {
    for (const app of approvedAppByMemberId.values()) {
      const p = app.applicant.part
      filledCounts.set(p, (filledCounts.get(p) ?? 0) + 1)
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

// 프로젝트 + 지원자 + 팀원 -> MatchingProjectData 변환
function toMatchingProject(
  project: ManagedProjectSummaryResponse,
  applicants: ProjectApplicantResponse[],
  members: ProjectMembersResponse | undefined,
): MatchingProjectData {
  // memberId -> APPROVED 지원서 매핑 (차수 태그 조회용)
  // 서버가 memberId를 string으로 내려주는 경우 대비해 String으로 정규화
  const approvedAppByMemberId = new Map<string, ProjectApplicantResponse>()
  for (const app of applicants) {
    if (app.status !== "APPROVED") continue
    approvedAppByMemberId.set(String(app.applicant.memberId), app)
  }

  // partGroups를 현재 멤버 기준으로 사용 - 매칭 해제 시 즉시 반영
  // members 미로딩 시 APPROVED 지원서 기반으로 폴백
  const blocksByRole = new Map<string, MatchingBlockData[]>()
  if (members) {
    for (const group of members.partGroups) {
      const role = PART_TO_ROLE[group.part]
      if (!role) continue
      for (const member of group.members) {
        const app = approvedAppByMemberId.get(String(member.memberId))
        const displayName = member.nickname
          ? `${member.nickname}/${member.name}`
          : member.name
        // APPROVED 지원서 있으면 지원서 차수 사용
        // 없고 matchedRoundInfo 있으면 해당 차수 사용 (수동 배정 차수 보존)
        // 둘 다 없으면 랜덤 매칭으로 표기
        const block: MatchingBlockData = app
          ? {
              ...phaseToBlock(
                toRoundNumber(app.matchingRound.phase),
                displayName,
                String(app.applicationId),
              ),
              memberId: String(member.memberId),
              part: group.part as Part,
            }
          : member.matchedRoundInfo
            ? {
                ...phaseToBlock(
                  toRoundNumber(member.matchedRoundInfo.phase),
                  displayName,
                ),
                memberId: String(member.memberId),
                part: group.part as Part,
              }
            : {
                // matchedRoundInfo 미제공: 배정 차수 알 수 없음 → 랜덤 매칭으로 표기
                // 서버에서 matchedRoundInfo 배포 후 정확한 차수로 표시됨
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
  } else {
    // members 미로딩 폴백: APPROVED 지원서 기반
    for (const [, app] of approvedAppByMemberId) {
      const role = PART_TO_ROLE[app.applicant.part]
      if (!role) continue
      const block: MatchingBlockData = {
        ...phaseToBlock(
          toRoundNumber(app.matchingRound.phase),
          app.applicant.nickname
            ? `${app.applicant.nickname}/${app.applicant.name}`
            : app.applicant.name,
          String(app.applicationId),
        ),
        memberId: app.applicant.memberId,
        part: app.applicant.part as Part,
      }
      const list = blocksByRole.get(role) ?? []
      list.push(block)
      blocksByRole.set(role, list)
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
    const neededParts = getNeededParts(
      "Design",
      project.partQuotas,
      approvedAppByMemberId,
      members,
    )
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
    const neededParts = getNeededParts(
      role,
      project.partQuotas,
      approvedAppByMemberId,
      members,
    )
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
    : applicants.filter((a) => a.status === "APPROVED").length

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
  applicantsByProject: Map<string, ProjectApplicantResponse[]>,
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
          toMatchingProject(
            p,
            applicantsByProject.get(String(p.id)) ?? [],
            membersByProject.get(String(p.id)),
          ),
        ),
      }
    },
  )
}
