import { useQuery } from "@tanstack/react-query"

import { recruitingKeys } from "../api/queryKeys"
import {
  getApplicationInterviewQuestions,
  getRoundInterviewQuestions,
} from "../api/recruitingApi"
import { toInterviewContent } from "../model/interviewMapper"

// 공통 질문은 차수에만, 개별 질문은 지원서에만 의존한다. 하나로 묶으면 같은
// 차수의 다른 지원자를 볼 때마다 공통 질문을 다시 받게 되므로 캐시를 나눈다.
export function useInterviewQuestions(
  applicationId: string,
  roundId: string | undefined,
  enabled: boolean,
) {
  const roundQuestions = useQuery({
    queryKey: recruitingKeys.roundInterviewQuestions(roundId ?? ""),
    queryFn: () => getRoundInterviewQuestions(roundId!),
    enabled: enabled && roundId != null,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const applicationQuestions = useQuery({
    queryKey: recruitingKeys.applicationInterviewQuestions(applicationId),
    queryFn: () => getApplicationInterviewQuestions(applicationId),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return {
    interview: toInterviewContent(
      roundQuestions.data ?? [],
      applicationQuestions.data ?? [],
    ),
  }
}
