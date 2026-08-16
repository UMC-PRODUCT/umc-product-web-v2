import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/entities/member/store/authStore"

import { recruitingKeys } from "../api/queryKeys"
import { cancelApplication, getMyApplications } from "../api/recruitingApi"

// 로그인 회원의 지원 내역 목록. 비로그인 사용자는 이메일+지원키 조회
// (useAnonymousApplicationQuery) 를 쓰므로 여기서는 호출 자체를 막는다.
export function useMyRecruitingApplicationsQuery() {
  const isAuthed = useAuthStore((s) => s.isAuthed)

  return useQuery({
    queryKey: recruitingKeys.myApplications(),
    queryFn: getMyApplications,
    enabled: isAuthed,
    staleTime: 60 * 1000,
  })
}

export function useCancelMyApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationId: string) => cancelApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: recruitingKeys.myApplications(),
      })
    },
  })
}
