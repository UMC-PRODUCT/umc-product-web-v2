import { Link } from "@tanstack/react-router"

import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import { Breadcrumb } from "@/shared/ui/breadcrumb/Breadcrumb"

import { useApplicationDetail } from "../../hooks/useApplicationDetail"
import { useSubmitEvaluation } from "../../hooks/useEvaluationMutations"
import { useInterviewQuestions } from "../../hooks/useInterviewQuestions"
import { useStageEvaluations } from "../../hooks/useStageEvaluations"
import { canDecideFinal } from "../../model/evaluationRules"
import {
  EVALUATION_STAGE_LABEL,
  EVALUATION_STAGE_SHORT_LABEL,
  type EvaluationStage,
} from "../../model/evaluationStage"
import { ApplicationFormReadonly } from "./ApplicationFormReadonly"
import { EvaluationStepper } from "./EvaluationStepper"
import { FinalDecisionSection } from "./FinalDecisionSection"
import { InterviewAnswerCards } from "./InterviewAnswerCards"
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
  const { detail, application, isError } = useApplicationDetail(
    applicationId,
    roundId,
  )
  const {
    evaluation,
    rosterKnown,
    rosterUnavailable,
    isError: isEvaluationError,
  } = useStageEvaluations(applicationId, roundId, stage, application?.status)
  const submitEvaluation = useSubmitEvaluation(applicationId, roundId, stage)
  const { interview, isError: isInterviewError } = useInterviewQuestions(
    applicationId,
    roundId,
    stage === "interview",
  )

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
            {stage === "interview" &&
              (isInterviewError ? (
                <div className="border-teal-gray-100 flex min-h-20 items-center justify-center rounded-[16px] border bg-white p-6">
                  <p className="text-body-2-regular text-teal-gray-500">
                    면접 질문을 불러오지 못했습니다.
                  </p>
                </div>
              ) : (
                interview && <InterviewAnswerCards content={interview} />
              ))}
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
                      onComplete={(result, comment) =>
                        submitEvaluation.mutateAsync({
                          decision: result === "pass" ? "APPROVED" : "REJECTED",
                          comment: comment || undefined,
                        })
                      }
                    />
                  )}
                  <OperatorEvaluationList
                    evaluation={evaluation}
                    viewerIsAdmin={rosterKnown}
                  />
                </>
              )
            )}
            {showFinalResult && application && (
              <>
                <FinalDecisionSection
                  label={finalResultLabel}
                  application={application}
                  currentResult={detail.finalResult}
                  canDecide={canDecideFinal(application.status, rosterKnown)}
                />
                {rosterUnavailable && (
                  <p className="text-body-2-regular text-teal-gray-500 text-center">
                    권한 정보를 불러오지 못해 합불 처리를 열지 못했습니다.
                    새로고침 후 다시 시도해주세요.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
