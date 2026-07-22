import { createFileRoute } from "@tanstack/react-router"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/evaluations/")({
  component: EvaluatorAllocationPage,
})

function EvaluatorAllocationPage() {
  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "evaluation-management", label: "평가 관리" },
          { id: "evaluator-assignment", label: "평가 담당자 배정" },
        ]}
        title="평가 담당자 배정"
        description="교내 운영진을 각 모집의 평가 담당자로 배정합니다."
        className="pl-3"
      />
    </div>
  )
}
