import { Link } from "@tanstack/react-router"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import { Breadcrumb } from "@/shared/ui/breadcrumb/Breadcrumb"

import { useApplicationDetail } from "../../hooks/useApplicationDetail"
import { useStageEvaluations } from "../../hooks/useStageEvaluations"
import {
  EVALUATION_STAGE_LABEL,
  EVALUATION_STAGE_SHORT_LABEL,
  type EvaluationStage,
} from "../../model/evaluationStage"
import { ApplicationFormReadonly } from "./ApplicationFormReadonly"
import { EvaluationResultToggle } from "./EvaluationResultToggle"
import { EvaluationStepper } from "./EvaluationStepper"
import { MyStageEvaluationPanel } from "./MyStageEvaluationPanel"
import { OperatorEvaluationList } from "./OperatorEvaluationList"

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

function DetailSkeleton() {
  return (
    <div className="flex animate-pulse gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="bg-teal-gray-100 h-12 rounded-[10px]" />
        <div className="bg-teal-gray-100 h-40 rounded-[10px]" />
        <div className="bg-teal-gray-100 h-40 rounded-[10px]" />
      </div>
      <div className="flex w-115 shrink-0 flex-col gap-5">
        <div className="bg-teal-gray-100 h-12 rounded-[10px]" />
        <div className="bg-teal-gray-100 h-64 rounded-[16px]" />
      </div>
    </div>
  )
}

function DetailMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-60 items-center justify-center">
      <p className="text-body-1-regular text-teal-gray-500">{children}</p>
    </div>
  )
}

export function ApplicationEvaluationDetailPage({
  stage,
  applicationId,
  roundId,
}: ApplicationEvaluationDetailPageProps) {
  const { detail, isError } = useApplicationDetail(applicationId, roundId)
  const {
    evaluation,
    rosterKnown,
    isError: isEvaluationError,
  } = useStageEvaluations(applicationId, roundId, stage)

  const listPath = STAGE_LIST_PATH[stage]
  const showFinalResult = stage !== "document"
  const finalResultLabel =
    stage === "final" ? "지원자 최종 평가" : "지원자 최종 결과"

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
        {detail && (
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
        )}
      </div>

      {isError ? (
        <DetailMessage>
          지원서를 불러오지 못했습니다. 목록에서 다시 진입해주세요.
        </DetailMessage>
      ) : !detail ? (
        <DetailSkeleton />
      ) : (
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
            {isEvaluationError ? (
              <div className="border-teal-gray-100 flex min-h-30 items-center justify-center rounded-[16px] border bg-white p-6">
                <p className="text-body-2-regular text-teal-gray-500">
                  평가 정보를 불러오지 못했습니다.
                </p>
              </div>
            ) : (
              evaluation && (
                <>
                  {stage !== "final" && (
                    <MyStageEvaluationPanel
                      evaluation={evaluation}
                      stage={stage}
                      onComplete={() => {}}
                    />
                  )}
                  <OperatorEvaluationList
                    evaluation={evaluation}
                    viewerIsAdmin={rosterKnown}
                  />
                </>
              )
            )}
            {showFinalResult && (
              <div className="flex items-center justify-center gap-4 pt-2">
                <span className="text-heading-7-semibold text-teal-gray-800">
                  {finalResultLabel}
                </span>
                <EvaluationResultToggle
                  value={detail.finalResult}
                  onChange={() => {}}
                  disabled
                  variant="strong"
                  failLabel="최종 불합격"
                  passLabel="최종 합격"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
