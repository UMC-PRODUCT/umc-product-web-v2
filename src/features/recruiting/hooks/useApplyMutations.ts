import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import {
  createAnonymousApplicationDraft,
  createApplicationDraft,
  saveApplicationDraft,
  submitAnonymousApplication,
  submitApplication,
  updateAnonymousApplication,
} from "../api/recruitingApi"
import {
  clearApplyDraft,
  readApplyDraft,
  writeApplyDraft,
} from "../model/applyDraftStorage"

import type { RecruitingAnswerRequest, RecruitingTrack } from "../api/types"
import type { ApplyDraftRef } from "../model/applyDraftStorage"

export interface ApplySaveInput {
  applicantName: string
  applicantEmail: string
  firstChoice: RecruitingTrack
  secondChoice?: RecruitingTrack
  answers: RecruitingAnswerRequest[]
}

interface ApplySaveContext {
  roundId: string
  memberId: string
  applicationFormId: string
  isAnonymous: boolean
  privacyTermId?: number
  privacyAgreed: boolean
}

function getAnonymousCredentialEmail() {
  if (typeof window === "undefined") return null
  return sessionStorage.getItem("anonymousEmail")
}

// 브라우저에 남은 초안을 버려도 되는 경우만 고른다. 4xx 전체로 넓히면 세션
// 만료(401)나 지원 기간 종료(400)에서도 멀쩡한 참조를 지워 되찾을 길이 없어진다.
//  · 404 서버에 없는 초안 / 403 내 것이 아닌 초안
//  · 400 + RECRUITING-0300 은 취소된 지원서처럼 더는 쓸 수 없는 상태다.
//    이것까지 남겨 두면 임시저장이 같은 이유로 계속 실패한다.
const STALE_DRAFT_STATUS = [403, 404]
const APPLICATION_INVALID_TRANSITION = "RECRUITING-0300"

function isStaleDraft(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  if (status == null) return false
  if (STALE_DRAFT_STATUS.includes(status)) return true

  const body: unknown = error.response?.data
  const code =
    typeof body === "object" && body !== null
      ? (body as { code?: string }).code
      : undefined
  return status === 400 && code === APPLICATION_INVALID_TRANSITION
}

async function createAndRemember(
  context: ApplySaveContext,
  input: ApplySaveInput,
): Promise<ApplyDraftRef> {
  const created = context.isAnonymous
    ? await createAnonymousApplicationDraft({
        applicationFormId: Number(context.applicationFormId),
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        firstChoice: input.firstChoice,
        secondChoice: input.secondChoice,
        privacyTermId: context.privacyTermId ?? 0,
        privacyAgreed: context.privacyAgreed,
      })
    : await createApplicationDraft({
        applicationFormId: Number(context.applicationFormId),
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        firstChoice: input.firstChoice,
        secondChoice: input.secondChoice,
      })
  const draft: ApplyDraftRef = {
    applicationId: String(created.applicationId),
    applicationKey: created.applicationKey,
  }
  // 응답 즉시 남긴다. 여기서 미루면 연타나 새로고침에 초안이 하나 더 생긴다.
  writeApplyDraft(context.roundId, context.memberId, draft)
  return draft
}

export function useSaveApplicationDraft(context: ApplySaveContext) {
  return useMutation({
    mutationFn: async (input: ApplySaveInput): Promise<ApplyDraftRef> => {
      const existing = readApplyDraft(context.roundId, context.memberId)
      const draft = existing ?? (await createAndRemember(context, input))

      const body = {
        applicantName: input.applicantName,
        applicantEmail: input.applicantEmail,
        firstChoice: input.firstChoice,
        secondChoice: input.secondChoice,
        answers: input.answers,
      }

      try {
        if (context.isAnonymous) {
          const credentialEmail =
            (existing ? getAnonymousCredentialEmail() : null) ??
            input.applicantEmail
          await updateAnonymousApplication({
            credentialEmail,
            applicationKey: draft.applicationKey,
            ...body,
          })
        } else {
          await saveApplicationDraft(draft.applicationId, body)
        }
        return draft
      } catch (error) {
        if (!existing || !isStaleDraft(error)) throw error
        clearApplyDraft(context.roundId, context.memberId)
        const recreated = await createAndRemember(context, input)
        if (context.isAnonymous) {
          await updateAnonymousApplication({
            credentialEmail: input.applicantEmail,
            applicationKey: recreated.applicationKey,
            ...body,
          })
        } else {
          await saveApplicationDraft(recreated.applicationId, body)
        }
        return recreated
      }
    },
  })
}

export function useSubmitApplication(context: ApplySaveContext) {
  return useMutation({
    mutationFn: ({ applicationId, applicationKey }: ApplySubmitInput) => {
      if (context.isAnonymous) {
        const email = getAnonymousCredentialEmail()
        if (!email) throw new Error("anonymous credential missing")
        return submitAnonymousApplication({
          email,
          applicationKey,
        })
      }
      return submitApplication(applicationId)
    },
    onSuccess: () => {
      // 제출하면 더 이상 이어쓸 초안이 아니다. 남겨 두면 다음 진입에서
      // 제출된 지원서를 초안으로 오인해 덮어쓰기를 시도한다.
      clearApplyDraft(context.roundId, context.memberId)
    },
  })
}

interface ApplySubmitInput {
  applicationId: string
  applicationKey: string
}
