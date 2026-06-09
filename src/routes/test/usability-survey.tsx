import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  SURVEY_VARIANTS,
  SurveyQuestionList,
  UsabilitySurveyModal,
  useMultistepSurvey,
} from "@/features/usability-survey"
import { Button } from "@/shared/ui/Button"

import type {
  SurveyAnswers,
  SurveyVariantKey,
} from "@/features/usability-survey"

export const Route = createFileRoute("/test/usability-survey")({
  component: UsabilitySurveyTestPage,
})

const VARIANT_LABELS: Record<SurveyVariantKey, string> = {
  "prev-gisu-general-apply": "이전기수·지원",
  "new-gisu-general-apply": "새기수·지원",
  "prev-gisu-general-matching": "이전기수·매칭",
  "new-gisu-general-matching": "새기수·매칭",
  "admin-matching": "운영진·매칭(멀티스텝)",
}

function UsabilitySurveyTestPage() {
  const [open, setOpen] = useState(false)
  const [variant, setVariant] = useState<SurveyVariantKey>(
    "prev-gisu-general-apply",
  )
  const config = SURVEY_VARIANTS[variant]
  const survey = useMultistepSurvey(config, {
    onSubmit: (answers: SurveyAnswers) =>
      console.log("[usability-survey] submit", { variant, answers }),
  })
  const addToast = useToastStore((s) => s.addToast)
  const surveyToast = (message: string) =>
    addToast({
      message,
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3000,
    })

  const handleOpen = () => {
    survey.reset()
    setOpen(true)
    surveyToast("운영진 여러분들의 소중한 의견을 부탁드립니다 !")
  }

  const handleSubmit = () => {
    survey.submit()
    setOpen(false)
    surveyToast("소중한 의견 감사합니다!")
  }

  const submitButton = (
    <Button
      variant="fill"
      color="primary"
      onClick={handleSubmit}
      disabled={!survey.isStepComplete}
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
    if (footerKind === "close-submit") {
      return (
        <>
          <Button variant="weak" color="neutral" onClick={() => setOpen(false)}>
            닫기
          </Button>
          {submitButton}
        </>
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
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col items-center gap-6 p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900">
        Usability Survey Test Page
      </h1>

      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(SURVEY_VARIANTS) as SurveyVariantKey[]).map((key) => (
          <Button
            key={key}
            variant={variant === key ? "fill" : "weak"}
            color={variant === key ? "primary" : "neutral"}
            onClick={() => setVariant(key)}
          >
            {VARIANT_LABELS[key]}
          </Button>
        ))}
      </div>

      <Button onClick={handleOpen}>모달 열기</Button>

      <UsabilitySurveyModal
        open={open}
        onOpenChange={config.preventClose ? undefined : setOpen}
        title={survey.currentStep.title}
        preventClose={config.preventClose}
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
    </main>
  )
}
