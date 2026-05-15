import axios from "axios"

import { api } from "@/shared/lib/axios"

import type { ApiResponse } from "@/shared/lib/apiResponse"

import type {
  PrepareUploadRequest,
  PrepareUploadResponse,
  UploadCategory,
} from "./types"

export async function prepareUpload(
  payload: PrepareUploadRequest,
): Promise<PrepareUploadResponse> {
  const { data } = await api.post<ApiResponse<PrepareUploadResponse>>(
    "/v1/storage/prepare-upload",
    payload,
  )
  return data.result
}

export async function uploadToSignedUrl(
  uploadUrl: string,
  uploadMethod: string,
  headers: Record<string, string>,
  file: File,
): Promise<void> {
  await axios.request({
    url: uploadUrl,
    method: uploadMethod,
    headers,
    data: file,
  })
}

export async function confirmUpload(fileId: string): Promise<void> {
  await api.post<ApiResponse<void>>(
    `/v1/storage/${encodeURIComponent(fileId)}/confirm`,
  )
}

export async function uploadFileFlow(
  file: File,
  category: UploadCategory,
): Promise<{ fileId: string }> {
  const prepared = await prepareUpload({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    category,
  })
  await uploadToSignedUrl(
    prepared.uploadUrl!,
    prepared.uploadMethod!,
    (prepared.headers ?? {}) as Record<string, string>,
    file,
  )
  await confirmUpload(prepared.fileId!)
  return { fileId: prepared.fileId! }
}
