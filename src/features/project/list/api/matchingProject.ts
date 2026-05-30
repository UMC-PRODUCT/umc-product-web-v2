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
  id: number | string
  name: string
  description: string
  thumbnailImageUrl: string | null
  productOwner: ProjectMember
  partQuotas: {
    part: ProjectPart
    currentCount: number | string
    quota: number | string
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
  applicationId: number | string
  projectId: number | string
  matchingRound: {
    id: number | string | null
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

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"

export type ApplicationStatusResponse = {
  applicationId: number
  status: ApplicationStatus
}

export type ApplicationAnswerItem = {
  questionId: number
  textValue?: string
  selectedOptionIds?: number[]
  fileIds?: string[]
}

export type ActiveMatchingRound = {
  id: number
  type: string
  phase: string
  chapterId: number
  startsAt: string
  endsAt: string
}

export async function getActiveMatchingRound(
  chapterId: number,
): Promise<ActiveMatchingRound | null> {
  const { data } = await api.get<ApiResponse<ActiveMatchingRound[]>>(
    "/v1/project/matching-rounds",
    { params: { chapterId, time: new Date().toISOString() } },
  )
  return data.result?.[0] ?? null
}

export async function createApplicationDraft(
  projectId: number,
  matchingRoundId: number,
): Promise<ApplicationStatusResponse> {
  const { data } = await api.post<ApiResponse<ApplicationStatusResponse>>(
    `/v1/projects/${projectId}/applications`,
    { matchingRoundId },
  )
  return data.result
}

export async function saveApplicationDraft(
  projectId: number,
  answers: ApplicationAnswerItem[],
): Promise<ApplicationStatusResponse> {
  const { data } = await api.put<ApiResponse<ApplicationStatusResponse>>(
    `/v1/projects/${projectId}/applications/me`,
    { answers },
  )
  return data.result
}

export async function submitApplication(
  projectId: number,
): Promise<ApplicationStatusResponse> {
  const { data } = await api.post<ApiResponse<ApplicationStatusResponse>>(
    `/v1/projects/${projectId}/applications/me/submit`,
  )
  return data.result
}
