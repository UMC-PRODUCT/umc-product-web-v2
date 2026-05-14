import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getApplicationDetail,
  getManagedProjects,
  getMatchingRounds,
  getProjectApplications,
  updateApplicationDecision,
} from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"

import type { DecisionRequest } from "../model/apiTypes"

// 프로젝트별 지원자 목록
export function useProjectApplications(
  projectId: number,
  params?: {
    matchingRoundId?: number
    part?: string
    status?: string
  },
) {
  return useQuery({
    queryKey: applicationKeys.applicants(projectId),
    queryFn: () => getProjectApplications(projectId, params),
    enabled: projectId > 0,
  })
}

// 지원서 단건 상세
export function useApplicationDetail(projectId: number, applicationId: number) {
  return useQuery({
    queryKey: applicationKeys.applicantDetail(projectId, applicationId),
    queryFn: () => getApplicationDetail(projectId, applicationId),
    enabled: projectId > 0 && applicationId > 0,
  })
}

// 내가 관리하는 프로젝트 목록 (PM용)
export function useManagedProjects(gisuId: number) {
  return useQuery({
    queryKey: applicationKeys.managedProjects(gisuId),
    queryFn: () => getManagedProjects(gisuId),
    enabled: gisuId > 0,
  })
}

// 매칭 차수 목록
export function useMatchingRounds(chapterId?: number) {
  return useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
  })
}

// 합불 결정 mutation
export function useDecisionMutation(projectId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      body,
    }: {
      applicationId: number
      body: DecisionRequest
    }) => updateApplicationDecision(projectId, applicationId, body),
    onSuccess: () => {
      // 지원자 목록 갱신
      void queryClient.invalidateQueries({
        queryKey: applicationKeys.applicants(projectId),
      })
    },
  })
}
