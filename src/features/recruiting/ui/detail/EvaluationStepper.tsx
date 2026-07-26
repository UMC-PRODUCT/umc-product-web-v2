import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

import {
  EVALUATION_STAGE_LABEL,
  type EvaluationStage,
} from "../../model/evaluationStage"

interface EvaluationStepperProps {
  applicationId: string
  roundId: string | undefined
  stage: EvaluationStage
  reachedStages: EvaluationStage[]
  className?: string
}

const NAVIGABLE_STAGES: EvaluationStage[] = ["document", "interview"]

export function EvaluationStepper({
  applicationId,
  roundId,
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
        const params = { applicationId }
        const search = { roundId }
        if (next === "document") {
          navigate({
            to: "/recruiting/evaluations/document/$applicationId",
            params,
            search,
          })
        } else if (next === "interview") {
          navigate({
            to: "/recruiting/evaluations/interview/$applicationId",
            params,
            search,
          })
        }
      }}
      itemClassName="flex-1"
      className={cn("w-full", className)}
    />
  )
}
