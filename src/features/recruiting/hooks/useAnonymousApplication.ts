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
    queryFn: () =>
      lookupAnonymousApplication({
        email: email!,
        applicationKey: applicationKey!,
      }),
    enabled: Boolean(email && applicationKey),
    staleTime: 60 * 1000,
  })
}

export function useLookupAnonymousApplication() {
  return useMutation({
    mutationFn: (body: RecruitingApplicationCredentialRequest) =>
      lookupAnonymousApplication(body),
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
