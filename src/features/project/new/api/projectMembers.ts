import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  AddProjectMemberRequest,
  TransferProjectOwnershipRequest,
} from "./types"

export async function addProjectMember(
  projectId: number,
  body: AddProjectMemberRequest,
): Promise<void> {
  await api.post<ApiResponse<void>>(`/v1/projects/${projectId}/members`, body)
}

export async function transferOwnership(
  projectId: number,
  body: TransferProjectOwnershipRequest,
): Promise<void> {
  await api.post<ApiResponse<void>>(
    `/v1/projects/${projectId}/transfer-ownership`,
    body,
  )
}
