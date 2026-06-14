import { useMutation, useQuery } from "@tanstack/react-query"

import { feedbackKeys } from "../api/queryKeys"
import {
  getFeedbackTemplate,
  submitFeedbackResponse,
} from "../api/userFeedbackApi"

import type { FeedbackContext } from "../api/types"

export function useFeedbackTemplate(
  context: FeedbackContext,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: feedbackKeys.template(context),
    queryFn: () => getFeedbackTemplate(context),
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
  })
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: submitFeedbackResponse,
  })
}
