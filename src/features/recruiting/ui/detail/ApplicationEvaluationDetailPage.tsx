import { Link } from "@tanstack/react-router"
import { useState } from "react"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import { Breadcrumb } from "@/shared/ui/breadcrumb/Breadcrumb"

import { getApplicationDetailMock } from "../../model/applicationDetail.mock"
import {
  EVALUATION_STAGE_LABEL,
  EVALUATION_STAGE_SHORT_LABEL,
  type EvaluationStage,
} from "../../model/evaluationStage"
import { ApplicationFormReadonly } from "./ApplicationFormReadonly"
import { EvaluationResultToggle } from "./EvaluationResultToggle"
import { EvaluationStepper } from "./EvaluationStepper"
import { InterviewAnswerCards } from "./InterviewAnswerCards"
import { MyStageEvaluationPanel } from "./MyStageEvaluationPanel"
import { OperatorEvaluationList } from "./OperatorEvaluationList"

import type { EvaluationResult } from "../../model/applicantListTypes"

const STAGE_LIST_PATH: Record<EvaluationStage, string> = {
  document: "/recruiting/evaluations/document",
  interview: "/recruiting/evaluations/interview",
  final: "/recruiting/evaluations/final",
}

interface ApplicationEvaluationDetailPageProps {
  stage: EvaluationStage
  applicationId: string
  roundId: string | undefined
}

export function ApplicationEvaluationDetailPage({
  stage,
  applicationId,
  roundId,
}: ApplicationEvaluationDetailPageProps) {
  const [detail, setDetail] = useState(() =>
    getApplicationDetailMock(applicationId),
  )
  const evaluation = detail.evaluations[stage]
  const listPath = STAGE_LIST_PATH[stage]
  const showFinalResult = stage !== "document"
  const finalResultLabel =
    stage === "final" ? "지원자 최종 평가" : "지원자 최종 결과"

  const handleComplete = (result: EvaluationResult, comment: string) => {
    setDetail((prev) => {
      const current = prev.evaluations[stage]
      if (!current) return prev
      return {
        ...prev,
        evaluations: {
          ...prev.evaluations,
          [stage]: {
            ...current,
            operators: current.operators.map((operator) =>
              operator.evaluatorId === current.myEvaluatorId
                ? { ...operator, progress: "done", result, comment }
                : operator,
            ),
          },
        },
      }
    })
  }

  return (
    <div className="flex w-full max-w-286.5 flex-col gap-8">
      <div className="flex flex-col gap-5 pl-3">
        <Breadcrumb
          items={[
            { id: "recruiting", label: "리크루팅" },
            { id: "evaluation-management", label: "평가 관리" },
            { id: stage, label: EVALUATION_STAGE_LABEL[stage], to: listPath },
            {
              id: "detail",
              label: `지원서 ${EVALUATION_STAGE_SHORT_LABEL[stage]} 평가`,
            },
          ]}
        />
        <Link
          to={listPath}
          className="text-body-2-medium text-teal-gray-500 hover:text-teal-gray-700 flex w-fit items-center gap-1"
        >
          <LeftChevronIcon width={16} height={16} />
          지원자 목록으로
        </Link>
        <div className="flex flex-col gap-1">
          <span className="text-body-2-semibold text-teal-600">
            {detail.chapter}
          </span>
          <h1 className="text-heading-4-semibold text-teal-gray-900">
            {detail.applicantName} 지원서
          </h1>
          <span className="text-body-2-regular text-teal-gray-500">
            {detail.recruitmentLabel}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <ApplicationFormReadonly sections={detail.sections} />
        </div>
        <div className="flex w-115 shrink-0 flex-col gap-5">
          <EvaluationStepper
            applicationId={applicationId}
            roundId={roundId}
            stage={stage}
            reachedStages={detail.reachedStages}
          />
          {stage === "interview" && detail.interview && (
            <InterviewAnswerCards content={detail.interview} />
          )}
          {evaluation && (
            <>
              {stage !== "final" && (
                <MyStageEvaluationPanel
                  evaluation={evaluation}
                  stage={stage}
                  onComplete={handleComplete}
                />
              )}
              <OperatorEvaluationList evaluation={evaluation} />
            </>
          )}
          {showFinalResult && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <span className="text-heading-7-semibold text-teal-gray-800">
                {finalResultLabel}
              </span>
              <EvaluationResultToggle
                value={detail.finalResult}
                onChange={(next) =>
                  setDetail((prev) => ({ ...prev, finalResult: next }))
                }
                variant="strong"
                failLabel="최종 불합격"
                passLabel="최종 합격"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
