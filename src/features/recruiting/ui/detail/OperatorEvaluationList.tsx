import { cn } from "@/shared/lib/utils"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"

import {
  countOperatorProgress,
  getMyEvaluation,
  type StageEvaluationDetail,
} from "../../model/applicationDetail"
import { EVALUATION_STAGE_LABEL } from "../../model/evaluationStage"

interface OperatorEvaluationListProps {
  evaluation: StageEvaluationDetail
}

function OperatorStatusChip({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "text-label-2-medium inline-flex h-6 items-center justify-center rounded-[6px] px-2 py-0.5 whitespace-nowrap",
        done
          ? "bg-teal-100 text-teal-600"
          : "bg-teal-gray-150 text-teal-gray-600",
      )}
    >
      {done ? "평가 완료" : "평가 전"}
    </span>
  )
}

function EmptyMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center">
      <p className="text-body-2-regular text-teal-gray-400">{children}</p>
    </div>
  )
}

function SortIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="text-teal-gray-400"
    >
      <path
        d="M6 3.5v11M6 14.5 3.5 12M12 14.5v-11M12 3.5 14.5 6"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function OperatorEvaluationList({
  evaluation,
}: OperatorEvaluationListProps) {
  const { done, total } = countOperatorProgress(evaluation.operators)
  const myEvaluation = getMyEvaluation(evaluation)
  const revealed = myEvaluation?.progress === "done"
  const othersDone = evaluation.operators.filter(
    (operator) =>
      operator.evaluatorId !== evaluation.myEvaluatorId &&
      operator.progress === "done",
  ).length

  return (
    <section className="border-teal-gray-100 flex flex-col gap-4 rounded-[16px] border bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-heading-6-semibold text-teal-gray-800">
          운영진 평가 <span className="text-teal-500">{done}</span>
          <span className="text-teal-gray-400">/{total}</span>
        </h3>
        {revealed && <SortIcon />}
      </div>

      {!revealed ? (
        <EmptyMessage>나의 평가를 등록 후에 확인할 수 있습니다.</EmptyMessage>
      ) : othersDone === 0 ? (
        <EmptyMessage>현재 완료된 평가가 없습니다.</EmptyMessage>
      ) : (
        <ul className="flex flex-col">
          {evaluation.operators.map((operator) => {
            const operatorDone = operator.progress === "done"
            return (
              <li
                key={operator.evaluatorId}
                className="border-teal-gray-100/60 flex flex-col gap-2 border-b py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-body-2-medium text-teal-gray-900 w-28 shrink-0 truncate">
                    {operator.evaluatorName}
                  </span>
                  <span className="text-body-2-regular text-teal-gray-500 w-20 shrink-0">
                    {EVALUATION_STAGE_LABEL[operator.stage]}
                  </span>
                  <OperatorStatusChip done={operatorDone} />
                  <span className="flex-1" />
                  {operator.result && (
                    <StatusChipTag type="tag" value={operator.result} />
                  )}
                </div>
                {operatorDone && (
                  <p className="text-body-2-regular text-teal-gray-600 pl-28 whitespace-pre-wrap">
                    {operator.comment || "작성된 코멘트가 없습니다"}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
