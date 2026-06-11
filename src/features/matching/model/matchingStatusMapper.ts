// 서버 응답 -> 매칭 현황 프론트 타입 변환

import { toRoundNumber } from "@/features/application/model/mappers"

import type {
  ManagedProjectSummaryResponse,
  ProjectApplicantResponse,
} from "@/features/application/model/apiTypes"
import type { ProjectMembersResponse } from "@/features/project/list/api/matchingProject"

import type {
  MatchingBlockData,
  MatchingRoleRow,
} from "../ui/MatchingResultRow"
import type {
  MatchingPartData,
  MatchingProjectData,
} from "./matchingStatusMock"

// phase 번호 -> 블록 타입/variant 매핑
function phaseToBlock(
  phase: number,
  name: string,
  applicantId: string,
): MatchingBlockData {
  if (phase === 1) {
    return { type: "round1", name, applicantId }
  }
  const variantMap: Record<number, "round2" | "round3" | "random"> = {
    2: "round2",
    3: "round3",
  }
  return {
    type: "filled",
    name,
    tagVariant: variantMap[phase] ?? "random",
    applicantId,
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
  maxColsByRole: Record<string, number>,
  currentRound: number,
): MatchingProjectData {
  // memberId -> APPROVED 지원서 매핑 (차수 태그 조회용)
  // 서버가 memberId를 string으로 내려주는 경우 대비해 String으로 정규화
  const approvedAppByMemberId = new Map<string, ProjectApplicantResponse>()
  for (const app of applicants) {
    if (app.status !== "APPROVED") continue
    approvedAppByMemberId.set(String(app.applicant.memberId), app)
  }

  const roundVariantMap: Record<number, "round2" | "round3" | "random"> = {
    2: "round2",
    3: "round3",
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
        const block: MatchingBlockData = app
          ? {
              ...phaseToBlock(
                toRoundNumber(app.matchingRound.phase),
                member.nickname
                  ? `${member.nickname}/${member.name}`
                  : member.name,
                String(app.applicationId),
              ),
              memberId: String(member.memberId),
            }
          : {
              type:
                currentRound === 1 ? ("round1" as const) : ("filled" as const),
              name: member.nickname
                ? `${member.nickname}/${member.name}`
                : member.name,
              tagVariant: roundVariantMap[currentRound] ?? "random",
              memberId: String(member.memberId),
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

  function buildRoleRow(
    role: string,
    quota: number,
    maxCols: number,
  ): MatchingRoleRow {
    const filledBlocks = blocksByRole.get(role) ?? []
    const emptyCount = Math.max(0, quota - filledBlocks.length)
    const emptyBlocks: MatchingBlockData[] = Array.from(
      { length: emptyCount },
      () => ({ type: "none" }),
    )
    const blockedCount = Math.max(0, maxCols - quota)
    const blockedBlocks: MatchingBlockData[] = Array.from(
      { length: blockedCount },
      () => ({ type: "blocked" }),
    )
    return { role, blocks: [...filledBlocks, ...emptyBlocks, ...blockedBlocks] }
  }

  const roleRows = [
    buildRoleRow("Design", designQuota, maxColsByRole["Design"] ?? designQuota),
    buildRoleRow("Frontend", feQuota, maxColsByRole["Frontend"] ?? feQuota),
    buildRoleRow("Backend", beQuota, maxColsByRole["Backend"] ?? beQuota),
  ]

  const hasNodejs = project.partQuotas.some(
    (q) => q.part === "NODEJS" && Number(q.quota) > 0,
  )
  const backendPart: "springboot" | "nodejs" = hasNodejs
    ? "nodejs"
    : "springboot"

  const totalCount = designQuota + feQuota + beQuota
  const currentCount = applicants.filter((a) => a.status === "APPROVED").length

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
  }
}

// 프로젝트 목록에서 역할별 최대 열 수 계산
function computeMaxCols(
  projects: ManagedProjectSummaryResponse[],
): Record<string, number> {
  const maxCols: Record<string, number> = { Design: 0, Frontend: 0, Backend: 0 }
  for (const p of projects) {
    for (const q of p.partQuotas) {
      const role = PART_TO_ROLE[q.part]
      const numQuota = Number(q.quota)
      if (role && numQuota > (maxCols[role] ?? 0)) {
        maxCols[role] = numQuota
      }
    }
  }
  return maxCols
}

export function toMatchingPartDataList(
  projects: ManagedProjectSummaryResponse[],
  applicantsByProject: Map<string, ProjectApplicantResponse[]>,
  membersByProject: Map<string, ProjectMembersResponse>,
  currentRound: number,
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
      const maxCols = computeMaxCols(platformProjects)
      return {
        partName: platform,
        projects: platformProjects.map((p) =>
          toMatchingProject(
            p,
            applicantsByProject.get(String(p.id)) ?? [],
            membersByProject.get(String(p.id)),
            maxCols,
            currentRound,
          ),
        ),
      }
    },
  )
}
