import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { recruitingKeys } from "../api/queryKeys"
import {
  cancelAnonymousApplication,
  lookupAnonymousApplication,
  submitAnonymousApplication,
  updateAnonymousApplication,
} from "../api/recruitingApi"

import type {
  RecruitingApplicationCredentialRequest,
  SubmitAnonymousApplicationRequest,
  UpdateAnonymousApplicationRequest,
} from "../api/types"

export function getAnonymousSessionId(): string | null {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem("anonymousSessionId")
}

export function getOrCreateAnonymousSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = sessionStorage.getItem("anonymousSessionId")
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Math.random().toString(36).slice(2)}-${Date.now()}`
    sessionStorage.setItem("anonymousSessionId", sessionId)
  }
  return sessionId
}

export function useAnonymousApplicationQuery(
  email: string | null,
  applicationKey: string | null,
  sessionId?: string | null,
) {
  const effectiveSessionId =
    sessionId ??
    (typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousSessionId")
      : null) ??
    ""

  return useQuery({
    queryKey: recruitingKeys.anonymousApplication(effectiveSessionId),
    queryFn: () => {
      if (!email || !applicationKey) {
        throw new Error("이메일과 지원 코드가 필요합니다.")
      }
      const verifiedEmail: string = email
      const verifiedKey: string = applicationKey
      return lookupAnonymousApplication({
        email: verifiedEmail,
        applicationKey: verifiedKey,
      })
    },
    enabled: Boolean(email && applicationKey),
    staleTime: 60 * 1000,
  })
}

export function useLookupAnonymousApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RecruitingApplicationCredentialRequest) =>
      lookupAnonymousApplication(body),
    onSuccess: (data) => {
      const sessionId = getOrCreateAnonymousSessionId()
      queryClient.setQueryData(
        recruitingKeys.anonymousApplication(sessionId),
        data,
      )
    },
  })
}

export function useCancelAnonymousApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: RecruitingApplicationCredentialRequest) =>
      cancelAnonymousApplication(body),
    onSuccess: () => {
      const sessionId = getAnonymousSessionId()
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: recruitingKeys.anonymousApplication(sessionId),
        })
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("isApplicationVerified")
        sessionStorage.removeItem("anonymousEmail")
        sessionStorage.removeItem("anonymousApplicationKey")
        sessionStorage.removeItem("anonymousSessionId")
      }
    },
  })
}

export function useUpdateAnonymousApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateAnonymousApplicationRequest) =>
      updateAnonymousApplication(body),
    onSuccess: () => {
      const sessionId = getAnonymousSessionId()
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: recruitingKeys.anonymousApplication(sessionId),
        })
      }
    },
  })
}

export function useSubmitAnonymousApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubmitAnonymousApplicationRequest) =>
      submitAnonymousApplication(body),
    onSuccess: () => {
      const sessionId = getAnonymousSessionId()
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: recruitingKeys.anonymousApplication(sessionId),
        })
      }
    },
  })
}
