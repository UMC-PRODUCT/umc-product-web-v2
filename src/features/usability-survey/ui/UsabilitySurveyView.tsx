import { Button } from "@/shared/ui/Button"

import { SurveyQuestionList } from "./SurveyQuestionList"
import { UsabilitySurveyModal } from "./UsabilitySurveyModal"

import type { useMultistepSurvey } from "../model/useMultistepSurvey"

interface UsabilitySurveyViewProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  survey: ReturnType<typeof useMultistepSurvey>
  preventClose?: boolean
  onSubmit: () => void
  isSubmitting?: boolean
}

export function UsabilitySurveyView({
  open,
  onOpenChange,
  survey,
  preventClose,
  onSubmit,
  isSubmitting,
}: UsabilitySurveyViewProps) {
  const submitButton = (
    <Button
      variant="fill"
      color="primary"
      onClick={onSubmit}
      disabled={!survey.isStepComplete}
      isLoading={isSubmitting}
    >
      전달하기
    </Button>
  )

  const footer = (() => {
    const footerKind = survey.currentStep.footer
    if (footerKind === "next-only") {
      return (
        <Button
          variant="fill"
          color="primary"
          onClick={survey.goNext}
          disabled={!survey.isStepComplete}
        >
          다음
        </Button>
      )
    }
    if (footerKind === "back-submit") {
      return (
        <div className="flex gap-3">
          <Button variant="weak" color="neutral" onClick={survey.goPrev}>
            이전
          </Button>
          {submitButton}
        </div>
      )
    }
    return submitButton
  })()

  return (
    <UsabilitySurveyModal
      open={open}
      onOpenChange={onOpenChange}
      title={survey.currentStep.title}
      preventClose={preventClose}
      scrollRef={survey.scrollRef}
      footer={footer}
    >
      <SurveyQuestionList
        items={survey.currentStep.items}
        answers={survey.answers}
        onAnswer={survey.onAnswer}
        startNumber={survey.startNumber}
        reveal={survey.currentStep.reveal}
      />
    </UsabilitySurveyModal>
  )
}
