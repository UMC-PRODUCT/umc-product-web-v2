import { useBlocker } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { useRecruitmentDraft } from "../hooks/useRecruitmentDraft"
import {
  type RecruitmentDraft,
  RecruitmentDraftError,
} from "../hooks/useRecruitmentDraft"
import {
  RecruitmentCreateStoreProvider,
  useRecruitmentCreateStore,
  useRecruitmentCreateStoreApi,
} from "../model/useRecruitmentCreateStore"
import { RecruitmentAnnouncementForm } from "./create/RecruitmentAnnouncementForm"
import { RecruitmentBasicInfoForm } from "./create/RecruitmentBasicInfoForm"
import { RecruitmentQuestionForm } from "./create/RecruitmentQuestionForm"
import { RecruitmentStepper } from "./RecruitmentStepper"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingListRole } from "../model/recruitingListRole"

interface RecruitmentCreatePageProps {
  role?: RecruitingListRole
  initialChapter?: Chapter
  initialSchool?: string
  draftRoundId?: string
  draftSeasonId?: string
}

const CREATE_BREADCRUMB = [
  { id: "recruiting", label: "리크루팅" },
  { id: "recruitment-management", label: "모집 관리" },
  { id: "recruitment-create", label: "모집 생성" },
]

function DraftNotice({ message }: { message: string }) {
  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={CREATE_BREADCRUMB}
        title="임시 저장 모집 이어쓰기"
        description="임시 저장한 모집을 다시 작성합니다."
        className="pl-3"
      />
      <div
        role="status"
        aria-live="polite"
        className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 w-full items-center justify-center rounded-[12px] border bg-white"
      >
        {message}
      </div>
    </div>
  )
}

function getDraftErrorMessage(error: unknown) {
  if (error instanceof RecruitmentDraftError) return error.message
  return "임시 저장한 모집을 불러오지 못했습니다."
}

export function RecruitmentCreatePage({
  role,
  initialChapter,
  initialSchool,
  draftRoundId,
  draftSeasonId,
}: RecruitmentCreatePageProps = {}) {
  const { draft, isLoading, isError, error, isActiveGisuMissing } =
    useRecruitmentDraft(
    draftRoundId,
    draftSeasonId,
  )
  const isDraftMode = draftRoundId != null

  // 2단계 폼은 마운트 시점의 문항 구조로 편집 상태를 한 번만 세운다. 조회가
  // 끝나기 전에 그리면 빈 문항으로 굳어 버리므로, 다 받은 뒤에 그린다.
  if (isDraftMode && isLoading) {
    return <DraftNotice message="임시 저장한 모집을 불러오는 중입니다..." />
  }

  if (isDraftMode && isActiveGisuMissing) {
    return <DraftNotice message="활성 기수를 찾을 수 없습니다." />
  }

  if (isDraftMode && (isError || !draft)) {
    return <DraftNotice message={getDraftErrorMessage(error)} />
  }

  return (
    <RecruitmentCreateStoreProvider>
      <RecruitmentCreatePageInner
        role={role}
        initialChapter={initialChapter}
        initialSchool={initialSchool}
        draftRoundId={draftRoundId}
        draft={draft}
      />
    </RecruitmentCreateStoreProvider>
  )
}

function RecruitmentCreatePageInner({
  role,
  initialChapter,
  initialSchool,
  draftRoundId,
  draft,
}: {
  role?: RecruitingListRole
  initialChapter?: Chapter
  initialSchool?: string
  draftRoundId?: string
  draft: RecruitmentDraft | null
}) {
  const [step, setStep] = useState(1)
  const [isStep1Dirty, setIsStep1Dirty] = useState(false)
  const [isStep2Dirty, setIsStep2Dirty] = useState(false)
  const [isStep3Dirty, setIsStep3Dirty] = useState(false)
  const isDirty = isStep1Dirty || isStep2Dirty || isStep3Dirty

  const [step2HasBlankPart, setStep2HasBlankPart] = useState(false)
  const stepperRef = useRef<HTMLDivElement>(null)
  const addToast = useToastStore((state) => state.addToast)

  const storeApi = useRecruitmentCreateStoreApi()
  const seasonId = useRecruitmentCreateStore((s) => s.seasonId)
  const roundId = useRecruitmentCreateStore((s) => s.roundId)
  const setRoundId = useRecruitmentCreateStore((s) => s.setRoundId)

  // 문항은 2단계 폼이 formStructure 로 직접 세운다. 여기서는 차수 자체에 딸린
  // 값(기간·파트 구성·공지·문의)만 돌려놓는다.
  useEffect(() => {
    if (!draft) return
    const {
      setSeasonId,
      setGisuGeneration,
      patchBasicInfo,
      setAnnouncement,
      setContactText,
      setRoundId: seedRoundId,
    } = storeApi.getState()

    setSeasonId(draft.seasonId)
    setGisuGeneration(draft.gisuGeneration)
    patchBasicInfo(draft.basicInfo)
    setAnnouncement(draft.announcement)
    setContactText(draft.contactText)
    // seasonId·차수 번호가 바뀌면 스토어가 roundId 를 지우므로 마지막에 넣는다.
    seedRoundId(draft.roundId)
  }, [draft, storeApi])

  // 1단계 폼은 학교가 정해질 때마다 seasonId 를 다시 잡는데, 시즌 조회가 끝나기
  // 전에는 빈 값을 넣어 roundId 까지 함께 지운다. 이어쓰기 중에 차수를 잃으면
  // 저장이 기존 공고 수정이 아니라 새 차수 생성으로 새 나가므로 되붙인다.
  useEffect(() => {
    if (!draft) return
    if (seasonId !== draft.seasonId) return
    if (roundId === draft.roundId) return
    setRoundId(draft.roundId)
  }, [draft, seasonId, roundId, setRoundId])

  const moveToStep = (target: number) => {
    setStep(target)
    requestAnimationFrame(() => {
      stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const handleStepChange = (target: number) => {
    if (target > step + 1) {
      addToast({
        message: "이전 단계부터 순서대로 진행해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    if (step === 2 && target > 2 && step2HasBlankPart) {
      addToast({
        message: "사용 중인 섹션의 항목을 모두 입력해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    moveToStep(target)
  }

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveBlockStatus,
  } = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  })

  const isLeaveModalOpen = leaveBlockStatus === "blocked"

  // 초안의 지부·학교는 1단계 폼의 초기값 경로로 넘긴다. 그 폼은 진입 지점 기준
  // 프리필을 따로 돌리는데, 여기서 알려 주지 않으면 복원한 값을 덮어쓴다.
  const resolvedChapter = draft?.basicInfo.chapter ?? initialChapter
  const resolvedSchool = draft?.basicInfo.school ?? initialSchool

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={CREATE_BREADCRUMB}
        title={draft ? "임시 저장 모집 이어쓰기" : "모집 생성"}
        description={
          draft
            ? "임시 저장한 모집을 다시 작성합니다."
            : "모집 공고를 만들고 공개할 준비를 합니다."
        }
        className="pl-3"
      />

      <div ref={stepperRef}>
        <RecruitmentStepper
          step={step}
          onStepChange={handleStepChange}
          className="mt-8"
        />
      </div>

      {/* 단계 전환 시 입력값이 사라지지 않도록 언마운트하지 않고 보이기/숨기기만 전환한다. */}
      <div className={step === 1 ? undefined : "hidden"}>
        <RecruitmentBasicInfoForm
          key={`${role ?? "central"}:${resolvedChapter ?? ""}:${resolvedSchool ?? ""}:${draftRoundId ?? "new"}`}
          onNext={() => moveToStep(2)}
          onDirtyChange={setIsStep1Dirty}
          role={role}
          initialChapter={resolvedChapter}
          initialSchool={resolvedSchool}
        />
      </div>
      <div className={step === 2 ? undefined : "hidden"}>
        <RecruitmentQuestionForm
          onPrev={() => moveToStep(1)}
          onNext={() => handleStepChange(3)}
          onDirtyChange={setIsStep2Dirty}
          onBlankPartsChange={setStep2HasBlankPart}
          initialFormStructure={draft?.formStructure}
        />
      </div>
      <div className={step === 3 ? undefined : "hidden"}>
        <RecruitmentAnnouncementForm
          onPrev={() => moveToStep(2)}
          onDirtyChange={setIsStep3Dirty}
        />
      </div>

      {/* 페이지 이탈 모달 */}
      <CtaModal
        open={isLeaveModalOpen}
        onOpenChange={(open) => {
          if (!open) resetLeave?.()
        }}
        variant="warning"
        title="페이지 이탈"
        content={
          <>
            작성 중인 내용이 저장되지 않습니다.
            <br />
            나가시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="나가기"
        onCancel={() => resetLeave?.()}
        onConfirm={() => proceedLeave?.()}
      />
    </div>
  )
}
