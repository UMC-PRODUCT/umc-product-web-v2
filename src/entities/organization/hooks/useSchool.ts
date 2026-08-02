import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createSchool,
  deleteSchool,
  deleteSchools,
  getAdminSchoolsSummary,
  getAllSchools,
  getSchoolDetail,
  updateSchool,
} from "@/entities/organization/api/schoolApi"

import type {
  CreateSchoolRequest,
  DeleteSchoolsRequest,
  UpdateSchoolRequest,
} from "@/entities/organization/model/schoolTypes"

/** 학교 상세 정보 조회 훅 */
export function useSchoolDetail(schoolId?: string | number) {
  return useQuery({
    queryKey: ["school", "detail", String(schoolId)],
    queryFn: () => getSchoolDetail(schoolId!),
    enabled: Boolean(schoolId),
    staleTime: 5 * 60 * 1000,
  })
}

/** 전체 학교 목록 조회 훅 */
export function useSchoolList() {
  return useQuery({
    queryKey: ["schools", "all"],
    queryFn: getAllSchools,
    staleTime: 5 * 60 * 1000,
  })
}

/** 관리자용 학교 현황 요약 목록 조회 훅 (지부명/인원수 포함) */
export function useAdminSchoolsSummary(params?: {
  gisuId?: number
  chapterId?: number
  search?: string
  page?: number
  size?: number
  sort?: string | string[]
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ["schools", "admin-summary", params],
    queryFn: () => getAdminSchoolsSummary(params),
    enabled: params?.enabled ?? params?.gisuId != null,
    staleTime: 5 * 60 * 1000,
  })
}

/** 학교 생성 뮤테이션 훅 */
export function useCreateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSchoolRequest) => createSchool(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}

/** 학교 정보 수정 뮤테이션 훅 */
export function useUpdateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      schoolId,
      body,
    }: {
      schoolId: string | number
      body: UpdateSchoolRequest
    }) => updateSchool(schoolId, body),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({
        queryKey: ["school", "detail", String(schoolId)],
      })
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}

/** 학교 삭제 뮤테이션 훅 (단건) */
export function useDeleteSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schoolId: string | number) => deleteSchool(schoolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}

/** 학교 일괄 삭제 뮤테이션 훅 */
export function useDeleteSchools() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: DeleteSchoolsRequest) => deleteSchools(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}
