// 서버 응답 -> 매칭 현황 프론트 타입 변환

import { toRoundNumber } from "@/features/application/model/mappers"

import type {
  ManagedProjectSummaryResponse,
  ProjectApplicantResponse,
} from "@/features/application/model/apiTypes"

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

// 프로젝트 + 지원자 -> MatchingProjectData 변환
function toMatchingProject(
  project: ManagedProjectSummaryResponse,
  applicants: ProjectApplicantResponse[],
  maxColsByRole: Record<string, number>,
): MatchingProjectData {
  // APPROVED 지원자만 블록에 표시
  const approvedByRole = new Map<string, ProjectApplicantResponse[]>()
  for (const app of applicants) {
    if (app.status !== "APPROVED") continue
    const role = PART_TO_ROLE[app.applicant.part]
    if (!role) continue
    const list = approvedByRole.get(role) ?? []
    list.push(app)
    approvedByRole.set(role, list)
  }

  // partQuotas에서 역할별 quota 추출
  const designQuota =
    project.partQuotas.find((q) => q.part === "DESIGN")?.quota ?? 0
  // WEB/ANDROID/IOS 중 해당 프로젝트의 FE 파트 quota 합산
  const feQuota = project.partQuotas
    .filter((q) => q.part === "WEB" || q.part === "ANDROID" || q.part === "IOS")
    .reduce((sum, q) => sum + q.quota, 0)
  const beQuota = project.partQuotas
    .filter((q) => q.part === "SPRINGBOOT" || q.part === "NODEJS")
    .reduce((sum, q) => sum + q.quota, 0)

  function buildRoleRow(
    role: string,
    quota: number,
    maxCols: number,
  ): MatchingRoleRow {
    const approved = approvedByRole.get(role) ?? []
    const filledBlocks: MatchingBlockData[] = approved.map((app) => ({
      ...phaseToBlock(
        toRoundNumber(app.matchingRound.phase),
        app.applicant.nickname || app.applicant.name,
        String(app.applicationId),
      ),
      memberId: app.applicant.memberId,
    }))
    const emptyCount = Math.max(0, quota - approved.length)
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
    (q) => q.part === "NODEJS" && q.quota > 0,
  )
  const backendPart: "springboot" | "nodejs" = hasNodejs
    ? "nodejs"
    : "springboot"

  const totalCount = designQuota + feQuota + beQuota
  const currentCount = applicants.filter((a) => a.status === "APPROVED").length

  return {
    projectId: project.id,
    projectName: project.name,
    challengerName: `${project.productOwner.nickname}/${project.productOwner.name}`,
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
      if (role && q.quota > (maxCols[role] ?? 0)) {
        maxCols[role] = q.quota
      }
    }
  }
  return maxCols
}

export function toMatchingPartDataList(
  projects: ManagedProjectSummaryResponse[],
  applicantsByProject: Map<number, ProjectApplicantResponse[]>,
): MatchingPartData[] {
  if (projects.length === 0) return []

  // FE 플랫폼별 프로젝트 그룹핑 (quota > 0인 파트 기준)
  const byPlatform = new Map<FEPlatform, ManagedProjectSummaryResponse[]>()
  for (const p of projects) {
    const addedPlatforms = new Set<FEPlatform>()
    for (const q of p.partQuotas) {
      const platform = PART_TO_FE_PLATFORM[q.part]
      if (platform && q.quota > 0 && !addedPlatforms.has(platform)) {
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
          toMatchingProject(p, applicantsByProject.get(p.id) ?? [], maxCols),
        ),
      }
    },
  )
}
