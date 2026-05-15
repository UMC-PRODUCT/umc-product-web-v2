import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

export type ProjectPart =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "ANDROID"
  | "IOS"
  | "NODEJS"
  | "SPRINGBOOT"
  | "ADMIN"

export type PartQuotaStatus = "RECRUITING" | "COMPLETED"

export type ProjectStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABORTED"

type ProjectMember = {
  memberId: number
  nickname: string
  name: string
  schoolName: string
}

export type ProjectItem = {
  id: number
  name: string
  description: string
  thumbnailImageUrl: string | null
  chapterId: number
  productOwner: ProjectMember
  partQuotas: {
    part: ProjectPart
    currentCount: number
    quota: number
    status: PartQuotaStatus
  }[]
  partQuotaStatus: PartQuotaStatus
}

export type ProjectDetail = {
  id: number
  name: string
  description: string
  thumbnailImageUrl: string | null
  logoImageUrl: string | null
  externalLink: string | null
  productOwner: ProjectMember
  coProductOwners: ProjectMember[]
  partQuotas: {
    part: ProjectPart
    currentCount: number
    quota: number
    status: PartQuotaStatus
  }[]
  partQuotaStatus: PartQuotaStatus
  applicationFormId: number | null
}

export type ProjectPage = {
  content: ProjectItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type GetMatchingProjectsParams = {
  gisuId: number
  keyword?: string
  chapterId?: number
  schoolIds?: number[]
  parts?: ProjectPart[]
  partQuotaStatus?: PartQuotaStatus
  statuses?: ProjectStatus[]
  page?: number
  size?: number
  sort?: string[]
}

export type MemberBrief = {
  memberId: number
  nickname: string
  name: string
  schoolName: string
}

export type PartGroup = {
  part: ProjectPart
  members: MemberBrief[]
}

export type ProjectMembersResponse = {
  projectId: number
  productOwner: MemberBrief
  coProductOwners: MemberBrief[]
  partGroups: PartGroup[]
}

export async function getProjectDetail(
  projectId: number,
): Promise<ProjectDetail> {
  const { data } = await api.get<ApiResponse<ProjectDetail>>(
    `/v1/projects/${projectId}`,
  )
  return data.result
}

export async function getProjectMembers(
  projectId: number,
): Promise<ProjectMembersResponse> {
  const { data } = await api.get<ApiResponse<ProjectMembersResponse>>(
    `/v1/projects/${projectId}/members`,
  )
  return data.result
}

export async function getMatchingProjects(
  params: GetMatchingProjectsParams,
): Promise<ProjectPage> {
  const { data } = await api.get<ApiResponse<ProjectPage>>("/v1/projects", {
    params,
  })
  return data.result
}

export type MyApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"

export type MyProjectApplicationResponse = {
  applicationId: number
  projectId: number
  matchingRound: {
    id: number | null
    type: string
    phase: string
  }
  status: MyApplicationStatus
}

export async function getMyApplications(
  gisuId: number,
): Promise<MyProjectApplicationResponse[]> {
  const { data } = await api.get<ApiResponse<MyProjectApplicationResponse[]>>(
    "/v1/projects/me/applications",
    { params: { gisuId } },
  )
  return data.result
}
