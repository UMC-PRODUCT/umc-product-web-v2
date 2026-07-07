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
  memberId: string
  nickname: string
  name: string
  schoolName: string
}

export type ProjectItem = {
  id: string
  name: string
  description: string
  thumbnailImageUrl: string | null
  productOwner: ProjectMember
  partQuotas: {
    part: ProjectPart
    currentCount: string
    quota: string
    status: PartQuotaStatus
  }[]
  partQuotaStatus: PartQuotaStatus
}

export type ProjectDetail = {
  id: string
  name: string
  description: string
  thumbnailImageUrl: string | null
  logoImageUrl: string | null
  externalLink: string | null
  productOwner: ProjectMember
  coProductOwners: ProjectMember[]
  partQuotas: {
    part: ProjectPart
    currentCount: string
    quota: string
    status: PartQuotaStatus
  }[]
  partQuotaStatus: PartQuotaStatus
  applicationFormId: string | null
}

export type ProjectPage = {
  content: ProjectItem[]
  page: string
  size: string
  totalElements: string
  totalPages: string
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
  memberId: string
  nickname: string
  name: string
  schoolName: string
  /** 배정된 차수 정보. null이면 랜덤 매칭으로 표기 */
  matchedRoundInfo: {
    phase: "FIRST" | "SECOND" | "THIRD"
  } | null
}

export type PartGroup = {
  part: ProjectPart
  members: MemberBrief[]
}

export type ProjectMembersResponse = {
  projectId: string
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

export async function getProjectMembersBatch(
  projectIds: number[],
): Promise<Map<string, ProjectMembersResponse>> {
  if (projectIds.length === 0) return new Map()
  const { data } = await api.get<
    ApiResponse<Record<string, ProjectMembersResponse>>
  >("/v1/projects/members", {
    params: { projectIds },
    paramsSerializer: { indexes: null },
  })
  return new Map(Object.entries(data.result ?? {}))
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
  applicationId: string
  projectId: string
  project: {
    name: string
    thumbnailImageUrl: string | null
    productOwner: {
      memberId: number
      nickname: string
      name: string
      schoolName: string
    }
    partQuotas: {
      part: ProjectPart
      currentCount: number
      quota: number
      status: PartQuotaStatus
    }[]
  }
  matchingRound: {
    id: string | null
    type: string
    phase: string
  }
  status: MyApplicationStatus
}

export async function getMyApplications(
  gisuId: number,
  status?: ApplicationStatus,
): Promise<MyProjectApplicationResponse[]> {
  const { data } = await api.get<ApiResponse<MyProjectApplicationResponse[]>>(
    "/v1/projects/me/applications",
    { params: status ? { gisuId, status } : { gisuId } },
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
  applicationId: string
  status: ApplicationStatus
}

export type ApplicationAnswerItem = {
  questionId: number
  textValue?: string
  selectedOptionIds?: number[]
  fileIds?: string[]
}

export type ActiveMatchingRound = {
  id: string
  type: string
  phase: string
  chapterId: string
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
  applicationId: number,
  answers: ApplicationAnswerItem[],
): Promise<ApplicationStatusResponse> {
  const { data } = await api.put<ApiResponse<ApplicationStatusResponse>>(
    `/v1/projects/${projectId}/applications/${applicationId}`,
    { answers },
  )
  return data.result
}

export async function submitApplication(
  projectId: number,
  applicationId: number,
): Promise<ApplicationStatusResponse> {
  const { data } = await api.post<ApiResponse<ApplicationStatusResponse>>(
    `/v1/projects/${projectId}/applications/${applicationId}/submit`,
  )
  return data.result
}

export type AnswerView = {
  answerId: string
  answeredAsType:
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "RADIO"
    | "CHECKBOX"
    | "DROPDOWN"
    | "SCHEDULE"
    | "FILE"
    | "PORTFOLIO"
  textValue?: string
  selectedOptions?: { questionOptionId: string; answeredAsContent: string }[]
  files?: { fileId: string; originalFileName: string; url: string }[]
  times?: string[]
}

export type QuestionView = {
  questionId: string
  type: AnswerView["answeredAsType"]
  title: string
  description?: string
  isRequired: boolean
  orderNo: string
  options: {
    optionId: string
    content: string
    orderNo: string
    isOther?: boolean
  }[]
  answer?: AnswerView
}

export type ApplicationDetailSectionView = {
  sectionId: string
  type: "COMMON" | "PART"
  allowedParts: ProjectPart[]
  title: string
  description?: string
  orderNo: string
  questions: QuestionView[]
}

export type FormResponseView = {
  formResponseId: string
  formId: string
  status: "DRAFT" | "SUBMITTED"
  submittedAt?: string
  lastSavedAt?: string
  sections: ApplicationDetailSectionView[]
}

export type ApplicationDetail = {
  applicationId: string
  applicant: {
    memberId: string
    nickname: string
    name: string
    schoolName: string
    part: ProjectPart
  }
  matchingRound: { id: string; type: string; phase: string }
  status: MyApplicationStatus
  submittedAt?: string
  statusChangedAt?: string
  formResponse: FormResponseView
}

export async function getApplicationDetail(
  projectId: number,
  applicationId: number,
): Promise<ApplicationDetail> {
  const { data } = await api.get<ApiResponse<ApplicationDetail>>(
    `/v1/projects/${projectId}/applications/${applicationId}`,
  )
  return data.result
}

export async function cancelApplication(
  projectId: number,
  applicationId: number,
  reason?: string,
): Promise<ApplicationStatusResponse> {
  const { data } = await api.delete<ApiResponse<ApplicationStatusResponse>>(
    `/v1/projects/${projectId}/applications/${applicationId}`,
    { params: reason ? { reason } : undefined },
  )
  return data.result
}
