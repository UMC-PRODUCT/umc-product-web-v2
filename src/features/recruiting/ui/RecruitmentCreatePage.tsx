import { useBlocker } from "@tanstack/react-router"
import { useRef, useState } from "react"

import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

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
}

export function RecruitmentCreatePage({
  role,
  initialChapter,
  initialSchool,
}: RecruitmentCreatePageProps = {}) {
  const [step, setStep] = useState(1)
  const [isStep1Dirty, setIsStep1Dirty] = useState(false)
  const [isStep2Dirty, setIsStep2Dirty] = useState(false)
  const [isStep3Dirty, setIsStep3Dirty] = useState(false)
  const isDirty = isStep1Dirty || isStep2Dirty || isStep3Dirty

  const [step2HasBlankPart, setStep2HasBlankPart] = useState(false)
  const stepperRef = useRef<HTMLDivElement>(null)
  const addToast = useToastStore((state) => state.addToast)

  const moveToStep = (target: number) => {
    setStep(target)
    requestAnimationFrame(() => {
      stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const handleStepChange = (target: number) => {
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

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "recruitment-management", label: "모집 관리" },
          { id: "recruitment-create", label: "모집 생성" },
        ]}
        title="모집 생성"
        description="모집 공고를 만들고 공개할 준비를 합니다."
        className="pl-3"
      />

      <div ref={stepperRef}>
        <RecruitmentStepper
          step={step}
          onStepChange={handleStepChange}
          className="mt-8"
        />
      </div>

      {step === 1 && (
        <RecruitmentBasicInfoForm
          key={`${role ?? "central"}:${initialChapter ?? ""}:${initialSchool ?? ""}`}
          onNext={() => moveToStep(2)}
          onDirtyChange={setIsStep1Dirty}
          role={role}
          initialChapter={initialChapter}
          initialSchool={initialSchool}
        />
      )}
      {step === 2 && (
        <RecruitmentQuestionForm
          onPrev={() => moveToStep(1)}
          onNext={() => moveToStep(3)}
          onDirtyChange={setIsStep2Dirty}
          onBlankPartsChange={setStep2HasBlankPart}
        />
      )}
      {step === 3 && (
        <RecruitmentAnnouncementForm
          onPrev={() => moveToStep(2)}
          onDirtyChange={setIsStep3Dirty}
        />
      )}

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
