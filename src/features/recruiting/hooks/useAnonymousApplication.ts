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

export function useAnonymousApplicationQuery(
  email: string | null,
  applicationKey: string | null,
) {
  return useQuery({
    queryKey: recruitingKeys.anonymousApplication(
      email ?? "",
      applicationKey ?? "",
    ),
    queryFn: () => {
      if (!email || !applicationKey) {
        throw new Error("이메일과 지원 코드가 필요합니다.")
      }
      return lookupAnonymousApplication({ email, applicationKey })
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
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        recruitingKeys.anonymousApplication(
          variables.email,
          variables.applicationKey,
        ),
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recruitingKeys.anonymousApplication(
          variables.email,
          variables.applicationKey,
        ),
      })
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("isApplicationVerified")
        sessionStorage.removeItem("anonymousEmail")
        sessionStorage.removeItem("anonymousApplicationKey")
      }
    },
  })
}

export function useUpdateAnonymousApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateAnonymousApplicationRequest) =>
      updateAnonymousApplication(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recruitingKeys.anonymousApplication(
          variables.credentialEmail,
          variables.applicationKey,
        ),
      })
    },
  })
}

export function useSubmitAnonymousApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubmitAnonymousApplicationRequest) =>
      submitAnonymousApplication(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recruitingKeys.anonymousApplication(
          variables.email,
          variables.applicationKey,
        ),
      })
    },
  })
}
