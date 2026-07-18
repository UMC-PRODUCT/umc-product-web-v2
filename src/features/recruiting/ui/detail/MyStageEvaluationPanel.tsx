import { useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { CounterLabel } from "@/shared/ui/CounterLabel"

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
  onComplete: (result: EvaluationResult, comment: string) => void
}

export function MyStageEvaluationPanel({
  evaluation,
  stage,
  onComplete,
}: MyStageEvaluationPanelProps) {
  const myEvaluation = getMyEvaluation(evaluation)
  const [result, setResult] = useState<EvaluationResult | null>(
    myEvaluation?.result ?? null,
  )
  const [comment, setComment] = useState(myEvaluation?.comment ?? "")

  const shortLabel = EVALUATION_STAGE_SHORT_LABEL[stage]
  const locked = evaluation.locked

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
        <div className="border-teal-gray-100 flex min-h-30 w-full flex-col gap-1.5 rounded-[12px] border bg-white px-5 py-4">
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={COMMENT_MAX_LENGTH}
            disabled={locked}
            placeholder="코멘트를 작성해주세요."
            className={cn(
              "text-body-1-regular text-teal-gray-900 placeholder:text-teal-gray-400",
              "w-full flex-1 resize-none border-none bg-transparent outline-none",
              "disabled:cursor-not-allowed",
            )}
          />
          <CounterLabel
            current={comment.length}
            total={COMMENT_MAX_LENGTH}
            size="sm"
            className="self-end"
          />
        </div>
      </div>

      {!locked && (
        <div className="flex justify-end">
          <Button
            size="m"
            disabled={result === null}
            onClick={() => {
              if (result !== null) onComplete(result, comment)
            }}
          >
            평가 완료
          </Button>
        </div>
      )}
    </section>
  )
}
