import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

import {
  EVALUATION_STAGE_LABEL,
  type EvaluationStage,
} from "../../model/evaluationStage"

interface EvaluationStepperProps {
  applicationId: string
  stage: EvaluationStage
  reachedStages: EvaluationStage[]
  className?: string
}

const NAVIGABLE_STAGES: EvaluationStage[] = ["document"]

export function EvaluationStepper({
  applicationId,
  stage,
  reachedStages,
  className,
}: EvaluationStepperProps) {
  const navigate = useNavigate()

  const items = reachedStages.map((reached) => ({
    value: reached,
    label: EVALUATION_STAGE_LABEL[reached],
    disabled: !NAVIGABLE_STAGES.includes(reached),
  }))

  return (
    <SegmentButton
      type="number"
      items={items}
      value={stage}
      onValueChange={(next) => {
        if (next === "document") {
          navigate({
            to: "/recruiting/evaluations/document/$applicationId",
            params: { applicationId },
          })
        }
      }}
      itemClassName="flex-1"
      className={cn("w-full", className)}
    />
  )
}
