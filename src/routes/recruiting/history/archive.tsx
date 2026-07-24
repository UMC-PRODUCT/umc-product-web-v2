import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { isChapter } from "@/entities/organization/model/chapters"
import { RECRUITING_TARGET_GISU_LABEL_MOCK } from "@/features/recruiting/model/applicantList.mock"
import {
  applyEvaluationHistoryFilters,
  DEFAULT_EVALUATION_HISTORY_FILTERS,
  type EvaluationHistoryFilters,
  toEvaluationHistoryCsv,
} from "@/features/recruiting/model/evaluationHistory"
import { EVALUATION_HISTORY_MOCK } from "@/features/recruiting/model/evaluationHistory.mock"
import { ChapterTabs } from "@/features/recruiting/ui/ChapterTabs"
import { EvaluationHistoryCard } from "@/features/recruiting/ui/history/EvaluationHistoryCard"
import { EvaluationHistoryFilterBar } from "@/features/recruiting/ui/history/EvaluationHistoryFilterBar"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/history/archive")({
  component: RouteComponent,
})

// TODO: 실제 기준 시각으로 교체(baseTime 만드는 방식은 applicantListTypes.ts의
// formatBaseTime(new Date()) 참고). 지금은 목업 고정값 사용.
const BASE_TIME_MOCK = "26-07-04 02:48"

function RouteComponent() {
  const [filters, setFilters] = useState<EvaluationHistoryFilters>(
    DEFAULT_EVALUATION_HISTORY_FILTERS,
  )

  const handleFiltersChange = (partial: Partial<EvaluationHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  const chapterScope = isChapter(filters.chapterTab)
    ? filters.chapterTab
    : undefined

  const visibleRows = useMemo(
    () => applyEvaluationHistoryFilters(EVALUATION_HISTORY_MOCK, filters),
    [filters],
  )

  const sectionTitle = chapterScope ?? RECRUITING_TARGET_GISU_LABEL_MOCK

  const handleDownload = () => {
    const csv = toEvaluationHistoryCsv(visibleRows)
    // 맨 앞 BOM: 엑셀에서 한글 CSV 깨짐 방지
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `평가이력_${sectionTitle}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "history", label: "히스토리" },
          { id: "archive", label: "평가 이력" },
        ]}
        title="평가 이력"
        description="교내 회장단의 최종 평가 이력을 확인합니다."
      />

      <ChapterTabs
        value={filters.chapterTab}
        onValueChange={(chapterTab) =>
          // "지부" 드롭다운 선택값(chapters)은 유지한다. 특정 지부 탭으로 이동했다가
          // "전체" 탭으로 돌아왔을 때 이전에 고른 지부 필터가 그대로 남아있어야 하기 때문.
          handleFiltersChange({ chapterTab, schools: [] })
        }
        className="mt-8"
      />

      <EvaluationHistoryFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        chapterScope={chapterScope}
        onDownload={handleDownload}
        downloadDisabled={visibleRows.length === 0}
        className="mt-6"
      />

      <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
        {sectionTitle}
      </h2>

      <EvaluationHistoryCard
        rows={visibleRows}
        baseTime={BASE_TIME_MOCK}
        // TODO: 실제로는 서버가 내려주는 진행 상태를 써야 함. 지금은 row 유무로만 임시 판단
        progress={visibleRows.length === 0 ? "before" : "done"}
        bySchool={filters.bySchool}
        className="mt-4"
      />
    </div>
  )
}
