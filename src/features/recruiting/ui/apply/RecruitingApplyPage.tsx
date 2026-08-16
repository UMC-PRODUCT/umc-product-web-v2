import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { useAuthStore } from "@/entities/member/store/authStore"
import { getPublicTermByType } from "@/shared/api/terms"
import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  clearAnonymousApplicationSession,
  getOrCreateAnonymousSessionId,
} from "../../hooks/useAnonymousApplication"
import { useApplyForm } from "../../hooks/useApplyForm"
import {
  useSaveApplicationDraft,
  useSubmitApplication,
} from "../../hooks/useApplyMutations"
import { clearApplyDraft, readApplyDraft } from "../../model/applyDraftStorage"
import { buildApplyAnswerPayload } from "../../model/applyPayload"
import { RecruitmentNoticePage } from "../RecruitmentNoticePage"
import { RecruitingApplyForm } from "./RecruitingApplyForm"

import type { ApplyAnswerValue } from "../../model/applyForm"
import type { ApplyPayloadValue } from "../../model/applyPayload"
import type { ApplicantInfo } from "./ApplicantInfoFields"

const LIST_PATH = "/projects/application/list"

// 지원서 상태가 어긋났다는 답. 제출은 DRAFT 에서만 받는다.
const APPLICATION_INVALID_TRANSITION = "RECRUITING-0300"

function errorBody(error: unknown) {
  if (!isAxiosError(error)) return null
  const body: unknown = error.response?.data
  if (typeof body !== "object" || body === null) return null
  return body as { code?: string; message?: string }
}

function isFinalizedApplication(error: unknown) {
  return errorBody(error)?.code === APPLICATION_INVALID_TRANSITION
}

// 서버가 내려주는 문구는 이미 지원자용 한국어라 그대로 쓴다. 중복 지원·기간
// 종료처럼 다시 눌러도 달라지지 않는 사유를 '잠시 후 다시 시도'로 덮지 않는다.
function toApplyErrorMessage(error: unknown, fallback: string) {
  const message = errorBody(error)?.message
  return message && message.trim().length > 0 ? message : fallback
}

interface RecruitingApplyPageProps {
  roundId: string
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 flex min-h-40 items-center justify-center rounded-[12px] border bg-white">
      {children}
    </div>
  )
}

export function RecruitingApplyPage({ roundId }: RecruitingApplyPageProps) {
  const navigate = useNavigate()
  const addToast = useToastStore((state) => state.addToast)
  const isAuthed = useAuthStore((state) => state.isAuthed)
  const isAnonymous = !isAuthed
  const { data: me } = useMe()
  const memberId = me?.id ?? ""
  const anonymousSessionId = useMemo(
    () => (isAnonymous ? getOrCreateAnonymousSessionId() : ""),
    [isAnonymous],
  )
  const storageIdentity = isAnonymous ? anonymousSessionId : memberId
  const privacyTermQuery = useQuery({
    queryKey: ["terms", "PRIVACY"],
    queryFn: () => getPublicTermByType("PRIVACY"),
    enabled: isAnonymous,
    staleTime: 5 * 60 * 1000,
  })

  const [applicant, setApplicant] = useState<ApplicantInfo>({
    applicantName: "",
    applicantEmail: "",
    firstChoice: undefined,
    secondChoice: undefined,
  })
  const [applicationKey, setApplicationKey] = useState<string | undefined>()
  const [resumeDecided, setResumeDecided] = useState(false)
  const [privacyAgreed, setPrivacyAgreed] = useState(false)

  const handleApplicantInfoChange = useCallback(
    (partial: Partial<ApplicantInfo>) => {
      setApplicant((prev) => ({ ...prev, ...partial }))
    },
    [],
  )

  // 로그인 정보로 한 번만 채운다. me 가 다시 조회될 때마다 채우면 사용자가
  // 일부러 비운 칸이 되살아난다(빈 문자열은 falsy 라 폴백에 걸린다).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (!me || hydratedRef.current) return
    hydratedRef.current = true
    setApplicant((prev) => ({
      ...prev,
      applicantName: prev.applicantName || me.name,
      applicantEmail: prev.applicantEmail || (me.email ?? ""),
    }))
  }, [me])

  const savedDraft = useMemo(
    () => (storageIdentity ? readApplyDraft(roundId, storageIdentity) : null),
    [roundId, storageIdentity],
  )

  const { round, config, isLoading, isStructureFetching, isError, isNotFound } =
    useApplyForm(roundId, applicant.firstChoice, applicant.secondChoice)

  const context = {
    roundId,
    memberId: storageIdentity,
    applicationFormId: round?.applicationFormId ?? "",
    isAnonymous,
    privacyTermId: privacyTermQuery.data?.id,
    privacyAgreed,
  }
  const saveDraft = useSaveApplicationDraft(context)
  const submit = useSubmitApplication(context)

  const toPayload = (values: Record<string, ApplyAnswerValue>) =>
    buildApplyAnswerPayload(
      values as Record<string, ApplyPayloadValue>,
      config?.sections ?? [],
    )

  // 이어서 쓸지 새로 쓸지 정하기 전에 저장하면, 서버에 남아 있는 초안이 지금
  // 화면의 빈 답변으로 덮어써진다. 저장된 답변을 되불러올 경로가 없어 복구도
  // 안 되므로, 결정 전에는 보내지 않는다.
  const awaitingResumeChoice = savedDraft != null && !resumeDecided

  // 이름·이메일은 문항이 아니라 지원서 필드라 폼 검증에 걸리지 않는다.
  // 보내기 직전에 확인한다 — 없다고 폼을 감추면 작성 중인 답변이 사라진다.
  const missingApplicantInfo = () => {
    if (isAuthed && !memberId) return "로그인 정보를 불러오는 중입니다."
    if (awaitingResumeChoice) {
      return "이어서 작성할지 새로 시작할지 먼저 선택해 주세요."
    }
    if (!applicant.applicantName.trim()) return "이름을 입력해 주세요."
    if (!applicant.applicantEmail.trim()) return "이메일을 입력해 주세요."
    if (!applicant.firstChoice) return "1지망 파트를 선택해 주세요."
    if (isAnonymous && privacyTermQuery.isError) {
      return "개인정보 처리방침을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
    }
    if (isAnonymous && !privacyTermQuery.data) {
      return "개인정보 처리방침을 불러오는 중입니다."
    }
    if (isAnonymous && !privacyAgreed) {
      return "개인정보 처리방침에 동의해 주세요."
    }
    return null
  }

  const persist = async (values: Record<string, ApplyAnswerValue>) => {
    if (!applicant.firstChoice) throw new Error("firstChoice required")
    const draft = await saveDraft.mutateAsync({
      applicantName: applicant.applicantName.trim(),
      applicantEmail: applicant.applicantEmail.trim(),
      firstChoice: applicant.firstChoice,
      secondChoice: applicant.secondChoice,
      answers: toPayload(values),
    })
    setApplicationKey(draft.applicationKey)
    return draft
  }

  const showError = (message: string) =>
    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })

  const handleSaveDraft = async (values: Record<string, ApplyAnswerValue>) => {
    const missing = missingApplicantInfo()
    if (missing) {
      showError(missing)
      throw new Error("applicant info missing")
    }
    try {
      await persist(values)
    } catch (error) {
      showError(
        toApplyErrorMessage(
          error,
          "임시저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ),
      )
      throw new Error("save failed")
    }
  }

  const handleSubmit = async (values: Record<string, ApplyAnswerValue>) => {
    const missing = missingApplicantInfo()
    if (missing) {
      showError(missing)
      throw new Error("applicant info missing")
    }
    try {
      // 제출은 저장된 내용을 확정하는 동작이라 마지막 저장을 먼저 보낸다.
      const draft = await persist(values)
      await submit.mutateAsync({
        applicationId: draft.applicationId,
        applicationKey: draft.applicationKey,
      })
    } catch (error) {
      // 서버는 이미 제출된 지원서에도 저장은 받아 주고 제출만 거부한다. 응답이
      // 유실돼 제출된 줄 모르고 다시 누르면 이 경로로 영원히 돌게 되므로,
      // 상태가 어긋났다는 답을 받으면 초안 참조를 정리하고 내 지원서로 보낸다.
      if (isFinalizedApplication(error)) {
        clearApplyDraft(roundId, storageIdentity)
        showError("이미 제출된 지원서입니다. 내 지원서에서 확인해주세요.")
        void navigate({ to: LIST_PATH })
        throw new Error("already finalized")
      }
      showError(
        toApplyErrorMessage(
          error,
          "제출에 실패했습니다. 잠시 후 다시 시도해주세요.",
        ),
      )
      throw new Error("submit failed")
    }
  }

  if (isError) {
    return (
      <Notice>
        모집 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </Notice>
    )
  }
  if (isNotFound) {
    return <Notice>모집을 찾지 못했습니다. 링크를 다시 확인해주세요.</Notice>
  }
  if (isLoading || !round) {
    return <Notice>모집 정보를 불러오는 중입니다.</Notice>
  }
  if (!round.applicationOpen) {
    return <Notice>지원 기간이 아닙니다.</Notice>
  }

  return (
    <>
      <RecruitmentNoticePage />
      <Modal.Root
        open
        onOpenChange={(open) => {
          if (!open) void navigate({ to: "/projects/notice" })
        }}
      >
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content className="max-h-[calc(100dvh-2rem)] w-[928px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-[12px] bg-transparent p-0 shadow-[0px_4px_8px_rgba(239,240,240,0.3)] focus:outline-none">
            <Modal.Close asChild>
              <button
                type="button"
                aria-label="지원서 닫기"
                className="text-teal-gray-600 absolute top-[95px] right-[10px] z-10 flex size-[26px] items-center justify-center"
              >
                <CloseIcon className="size-6" />
              </button>
            </Modal.Close>
            <div className="flex w-full flex-col gap-6">
              {savedDraft && !resumeDecided && (
                <div className="flex items-center justify-between gap-4 rounded-[12px] border border-teal-300 bg-teal-50 px-6 py-5">
                  <p className="text-body-2-regular text-teal-gray-700 whitespace-pre-line">
                    {
                      "이 브라우저에 임시저장한 지원서가 있습니다.\n이어서 작성하면 같은 지원서에 저장되지만, 이전에 쓴 답변은 다시 불러오지 못합니다."
                    }
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="weak"
                      color="neutral"
                      size="s"
                      onClick={() => {
                        clearApplyDraft(roundId, storageIdentity)
                        if (isAnonymous) clearAnonymousApplicationSession()
                        setApplicationKey(undefined)
                        setResumeDecided(true)
                      }}
                    >
                      새로 시작
                    </Button>
                    <Button size="s" onClick={() => setResumeDecided(true)}>
                      이어서 작성
                    </Button>
                  </div>
                </div>
              )}

              {isStructureFetching && !config ? (
                <Notice>지원 문항을 불러오는 중입니다.</Notice>
              ) : config ? (
                <RecruitingApplyForm
                  config={config}
                  applicantName={applicant.applicantName}
                  applicantEmail={applicant.applicantEmail}
                  firstChoice={applicant.firstChoice}
                  secondChoice={applicant.secondChoice}
                  onApplicantInfoChange={handleApplicantInfoChange}
                  applicationKey={applicationKey}
                  onSaveDraft={handleSaveDraft}
                  onSubmit={handleSubmit}
                  canSubmit={() => {
                    const missing = missingApplicantInfo()
                    if (!missing) return true
                    showError(missing)
                    return false
                  }}
                  isSaving={saveDraft.isPending}
                  isSubmitting={submit.isPending}
                  isAnonymous={isAnonymous}
                  privacyTerm={privacyTermQuery.data}
                  privacyAgreed={privacyAgreed}
                  onPrivacyChange={setPrivacyAgreed}
                  onExit={() => void navigate({ to: LIST_PATH })}
                  onViewApplication={() => void navigate({ to: LIST_PATH })}
                />
              ) : (
                <Notice>지원 문항을 불러오지 못했습니다.</Notice>
              )}
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
