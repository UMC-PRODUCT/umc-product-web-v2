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

export type ProjectItem = {
  id: number
  name: string
  description: string
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
  partQuotaStatus: PartQuotaStatus
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

export async function getMatchingProjects(
  params: GetMatchingProjectsParams,
): Promise<ProjectPage> {
  const { data } = await api.get<ApiResponse<ProjectPage>>("/v1/projects", {
    params,
  })
  return data.result
}
