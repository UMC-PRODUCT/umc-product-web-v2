import { AxiosError } from "axios"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"

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

  const close = () => {
    setOpen(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!survey.isStepComplete || mutation.isPending) return

    let answers
    try {
      answers = toAnswerItems(config, form, survey.answers)
    } catch {
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
      survey={survey}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  )
}
