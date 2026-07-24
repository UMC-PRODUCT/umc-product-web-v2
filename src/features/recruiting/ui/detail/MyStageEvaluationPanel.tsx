import { useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import {
  getMyEvaluation,
  type StageEvaluationDetail,
} from "../../model/applicationDetail"
import {
  EVALUATION_STAGE_SHORT_LABEL,
  type EvaluationStage,
} from "../../model/evaluationStage"
import { EvaluationResultToggle } from "./EvaluationResultToggle"

import type { EvaluationResult } from "../../model/applicantListTypes"

const COMMENT_MAX_LENGTH = 500

interface MyStageEvaluationPanelProps {
  evaluation: StageEvaluationDetail
  stage: EvaluationStage
  onComplete: (
    result: EvaluationResult,
    comment: string,
  ) => void | Promise<void>
}

export function MyStageEvaluationPanel({
  evaluation,
  stage,
  onComplete,
}: MyStageEvaluationPanelProps) {
  const myEvaluation = getMyEvaluation(evaluation)
  const savedResult = myEvaluation?.result ?? null
  const savedComment = myEvaluation?.comment ?? ""
  const savedKey = `${savedResult ?? ""}|${savedComment}`

  const [syncKey, setSyncKey] = useState(savedKey)
  const [result, setResult] = useState<EvaluationResult | null>(savedResult)
  const [comment, setComment] = useState(savedComment)
  const [submitting, setSubmitting] = useState(false)

  if (syncKey !== savedKey) {
    setSyncKey(savedKey)
    setResult(savedResult)
    setComment(savedComment)
  }

  const shortLabel = EVALUATION_STAGE_SHORT_LABEL[stage]
  const locked = evaluation.locked
  const submitted = myEvaluation?.progress === "done"
  const dirty = result !== savedResult || comment !== savedComment

  const handleSubmit = async () => {
    if (result === null || submitting) return
    setSubmitting(true)
    try {
      await onComplete(result, comment)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="border-teal-gray-100 flex flex-col gap-5 rounded-[16px] border bg-white p-6">
      <h3 className="text-heading-6-semibold text-teal-gray-800">
        내 {shortLabel} 평가
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-body-2-medium text-teal-gray-700">
          평가 결과 <span className="text-error-600">*</span>
        </span>
        <EvaluationResultToggle
          value={result}
          onChange={setResult}
          disabled={locked}
        />
        {locked && evaluation.lockReason && (
          <p className="text-body-2-regular text-teal-gray-500 mt-1 flex items-center gap-1.5">
            <CheckIcon className="text-teal-gray-400 size-4 shrink-0" />
            {evaluation.lockReason}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-body-2-medium text-teal-gray-700">코멘트</span>
        <TextQuestionField
          value={comment}
          onChange={setComment}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="코멘트를 작성해주세요."
          ariaLabel="코멘트"
          disabled={locked}
          className="min-h-30"
        />
      </div>

      {!locked && (
        <div className="flex justify-end">
          <Button
            size="m"
            isLoading={submitting}
            disabled={result === null || (submitted && !dirty)}
            onClick={handleSubmit}
          >
            평가 완료
          </Button>
        </div>
      )}
    </section>
  )
}
