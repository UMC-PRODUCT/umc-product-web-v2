import { AxiosError } from "axios"
import { useEffect, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { trackEvent } from "@/shared/analytics"

import {
  useFeedbackTemplate,
  useSubmitFeedback,
} from "../hooks/useUserFeedback"
import {
  hasSubmittedTemplate,
  markTemplateSubmitted,
} from "../lib/submittedStore"
import { resolveVariantKey, toAnswerItems } from "../model/mappers"
import { useMultistepSurvey } from "../model/useMultistepSurvey"
import { SURVEY_VARIANTS } from "../model/variants"
import { UsabilitySurveyView } from "./UsabilitySurveyView"

import type { FeedbackContext, FeedbackForm } from "../api/types"
import type { SurveyVariantKey } from "../model/variants"

const DUPLICATE_RESPONSE_CODE = "SURVEY-0027"

interface UsabilitySurveyProps {
  context: FeedbackContext
  active: boolean
}

export function UsabilitySurvey({ context, active }: UsabilitySurveyProps) {
  const [dismissed, setDismissed] = useState(false)

  const { data: template } = useFeedbackTemplate(context, {
    enabled: active && !dismissed,
  })

  if (!active || dismissed) return null
  if (!template?.form || template.templateId == null) return null
  if (hasSubmittedTemplate(Number(template.templateId))) return null

  const variantKey = resolveVariantKey(template.context, template.targetType)
  if (!variantKey) return null

  return (
    <UsabilitySurveyRunner
      variantKey={variantKey}
      form={template.form}
      templateId={Number(template.templateId)}
      onClose={() => setDismissed(true)}
    />
  )
}

interface UsabilitySurveyRunnerProps {
  variantKey: SurveyVariantKey
  form: FeedbackForm
  templateId: number
  onClose: () => void
}

function UsabilitySurveyRunner({
  variantKey,
  form,
  templateId,
  onClose,
}: UsabilitySurveyRunnerProps) {
  const config = SURVEY_VARIANTS[variantKey]
  const addToast = useToastStore((s) => s.addToast)
  const mutation = useSubmitFeedback()
  const survey = useMultistepSurvey(config)
  const [open, setOpen] = useState(true)
  const didStartAnswerRef = useRef(false)
  const previousStepIndexRef = useRef(survey.stepIndex)

  useEffect(() => {
    trackEvent("survey_modal_view", {
      template_id: templateId,
      variant_key: variantKey,
      total_steps: survey.totalSteps,
    })
  }, [templateId, variantKey, survey.totalSteps])

  useEffect(() => {
    if (didStartAnswerRef.current) return
    if (Object.keys(survey.answers).length === 0) return
    didStartAnswerRef.current = true
    trackEvent("survey_answer_start", {
      template_id: templateId,
      variant_key: variantKey,
      step_index: survey.stepIndex,
    })
  }, [survey.answers, survey.stepIndex, templateId, variantKey])

  useEffect(() => {
    if (previousStepIndexRef.current === survey.stepIndex) return
    trackEvent("survey_step_change", {
      template_id: templateId,
      variant_key: variantKey,
      from_step_index: previousStepIndexRef.current,
      to_step_index: survey.stepIndex,
      total_steps: survey.totalSteps,
    })
    previousStepIndexRef.current = survey.stepIndex
  }, [survey.stepIndex, survey.totalSteps, templateId, variantKey])

  const close = () => {
    trackEvent("survey_modal_close", {
      template_id: templateId,
      variant_key: variantKey,
      step_index: survey.stepIndex,
      answered_count: Object.keys(survey.answers).length,
    })
    setOpen(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!survey.isStepComplete || mutation.isPending) return

    let answers
    try {
      answers = toAnswerItems(config, form, survey.answers)
    } catch {
      trackEvent("survey_submit_error", {
        template_id: templateId,
        variant_key: variantKey,
        reason: "mapping_failed",
      })
      addToast({
        message: "제출 중 문제가 발생했어요. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    mutation.mutate(
      { templateId, answers },
      {
        onSuccess: () => {
          markTemplateSubmitted(templateId)
          trackEvent("survey_submit_success", {
            template_id: templateId,
            variant_key: variantKey,
            answered_count: Object.keys(survey.answers).length,
          })
          addToast({
            message: "소중한 의견 감사합니다!",
            color: "primary",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
          close()
        },
        onError: (error) => {
          const data =
            error instanceof AxiosError
              ? (error.response?.data as
                  | { code?: string; message?: string }
                  | undefined)
              : undefined

          if (data?.code === DUPLICATE_RESPONSE_CODE) {
            markTemplateSubmitted(templateId)
            trackEvent("survey_submit_error", {
              template_id: templateId,
              variant_key: variantKey,
              reason: "duplicate_response",
              code: data.code,
            })
            addToast({
              message: data.message ?? "이미 제출한 응답이 있어요.",
              color: "primary",
              variant: "deep",
              type: "default",
              duration: 3000,
            })
            close()
            return
          }

          trackEvent("survey_submit_error", {
            template_id: templateId,
            variant_key: variantKey,
            reason: "request_failed",
            code: data?.code,
          })
          addToast({
            message: "제출에 실패했어요. 다시 시도해주세요.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        },
      },
    )
  }

  return (
    <UsabilitySurveyView
      open={open}
      preventClose={config.preventClose}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close()
      }}
      survey={survey}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  )
}
