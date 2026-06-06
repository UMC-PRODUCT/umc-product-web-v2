import { useEffect, useMemo, useRef, useState } from "react"

import { isItemAnswered } from "./types"

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyVariantConfig,
} from "./types"

interface UseMultistepSurveyOptions {
  onSubmit?: (answers: SurveyAnswers) => void
}

export function useMultistepSurvey(
  config: SurveyVariantConfig,
  options?: UseMultistepSurveyOptions,
) {
  const { steps } = config
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<SurveyAnswers>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  const configKey = steps
    .map(
      (step) => `${step.title}:${step.items.map((item) => item.id).join(",")}`,
    )
    .join("|")

  useEffect(() => {
    setStepIndex(0)
    setAnswers({})
  }, [configKey])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [stepIndex])

  const totalSteps = steps.length
  const safeStepIndex = Math.min(stepIndex, totalSteps - 1)
  const currentStep = steps[safeStepIndex] ?? steps[0]
  const isLastStep = safeStepIndex === totalSteps - 1

  const startNumber = useMemo(
    () =>
      steps
        .slice(0, safeStepIndex)
        .reduce(
          (count, step) =>
            count + step.items.filter((item) => item.kind !== "divider").length,
          1,
        ),
    [steps, safeStepIndex],
  )

  const isStepComplete = useMemo(
    () => currentStep.items.every((item) => isItemAnswered(item, answers)),
    [currentStep, answers],
  )

  const onAnswer = (id: string, value: SurveyAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const goNext = () => {
    if (isLastStep) return
    setStepIndex((index) => index + 1)
  }

  const submit = () => {
    options?.onSubmit?.(answers)
  }

  const reset = () => {
    setStepIndex(0)
    setAnswers({})
  }

  return {
    stepIndex: safeStepIndex,
    totalSteps,
    currentStep,
    isLastStep,
    startNumber,
    answers,
    isStepComplete,
    onAnswer,
    goNext,
    submit,
    reset,
    scrollRef,
  }
}
