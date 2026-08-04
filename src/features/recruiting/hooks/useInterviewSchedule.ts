import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useMemo } from "react"

import { recruitingKeys } from "../api/queryKeys"
import {
  getAllRoundApplications,
  getInterviewScheduleBoard,
  getInterviewSessions,
} from "../api/recruitingApi"

import type { RecruitingInterviewSession } from "../api/types"

// 데이터가 오기 전에는 항상 같은 배열을 돌려준다. 렌더마다 새 배열을 만들면
// 이 값을 의존성으로 둔 메모·이펙트가 끝없이 다시 돌아 화면이 멈춘다.
const EMPTY_SESSIONS: RecruitingInterviewSession[] = []

// 면접 세션 목록. 차수에 속한 세션이 시작 시각 순으로 온다.
export function useInterviewSessions(roundId: string) {
  const query = useQuery({
    queryKey: recruitingKeys.interviewSessions(roundId),
    queryFn: () => getInterviewSessions(roundId),
    enabled: roundId !== "",
    // 운영 권한이 없으면 403 이 확정 답이라 재시도해도 결과가 같다.
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 403) &&
      failureCount < 2,
  })

  return {
    sessions: query.data ?? EMPTY_SESSIONS,
    isLoading: query.isLoading,
    isError: query.isError,
    isForbidden:
      isAxiosError(query.error) && query.error.response?.status === 403,
  }
}

// 날짜별 배정 보드. 서버가 세션의 슬롯 길이로 슬롯을 계산해 내려준다.
export function useInterviewScheduleBoard(roundId: string, date: string) {
  const query = useQuery({
    queryKey: recruitingKeys.interviewScheduleBoard(roundId, date),
    queryFn: () => getInterviewScheduleBoard(roundId, date),
    enabled: roundId !== "" && date !== "",
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 403) &&
      failureCount < 2,
  })

  return {
    board: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

// 일괄 확정에 필요한 연락처를 지원자 목록에서 끌어온다. 보드 응답에는 지원서 ID 와
// 이름만 있고 연락처가 없는데, 서버는 확정 요청에 연락처를 필수로 받는다.
//
// 키를 면접 스케줄링 접두사 밖에 둔다. 세션·확정 변경은 그 접두사를 통째로
// 무효화하는데, 연락처는 세션 변경과 무관해서 같이 다시 받을 이유가 없다.
export function useApplicantContacts(roundId: string) {
  const query = useQuery({
    queryKey: recruitingKeys.applicantContacts(roundId),
    queryFn: () => getAllRoundApplications(roundId),
    enabled: roundId !== "",
    staleTime: 5 * 60 * 1000,
  })

  const contactByApplicationId = useMemo(() => {
    const map = new Map<string, string>()
    ;(query.data ?? []).forEach((application) => {
      if (application.email)
        map.set(application.applicationId, application.email)
    })
    return map
  }, [query.data])

  return { contactByApplicationId, isLoading: query.isLoading }
}
