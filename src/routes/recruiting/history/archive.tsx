import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { isChapter } from "@/entities/organization/model/chapters"
import { useEvaluationHistory } from "@/features/recruiting/hooks/useEvaluationHistory"
import { formatBaseTime } from "@/features/recruiting/model/applicantListTypes"
import {
  applyEvaluationHistoryFilters,
  DEFAULT_EVALUATION_HISTORY_FILTERS,
  type EvaluationHistoryFilters,
  type EvaluationHistorySort,
  orderEvaluationHistoryRows,
  toEvaluationHistoryCsv,
} from "@/features/recruiting/model/evaluationHistory"
import { formatGisuLabel } from "@/features/recruiting/model/recruitingRole"
import { ChapterTabs } from "@/features/recruiting/ui/ChapterTabs"
import { EvaluationHistoryCard } from "@/features/recruiting/ui/history/EvaluationHistoryCard"
import { EvaluationHistoryFilterBar } from "@/features/recruiting/ui/history/EvaluationHistoryFilterBar"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/history/archive")({
  component: RouteComponent,
})

function RouteComponent() {
  const { rows, progress, asOf, generation, isLoading, isError } =
    useEvaluationHistory()
  const [filters, setFilters] = useState<EvaluationHistoryFilters>(
    DEFAULT_EVALUATION_HISTORY_FILTERS,
  )
  // 카드의 정렬/담당자별 상태를 여기서 갖고 있어야 CSV 다운로드가 화면과 같은 순서를 쓸 수 있다.
  const [sort, setSort] = useState<EvaluationHistorySort>("latest")
  const [byEvaluator, setByEvaluator] = useState(false)

  const handleFiltersChange = (partial: Partial<EvaluationHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  const chapterScope = isChapter(filters.chapterTab)
    ? filters.chapterTab
    : undefined

  const visibleRows = useMemo(
    () => applyEvaluationHistoryFilters(rows, filters),
    [rows, filters],
  )

  const orderedRows = useMemo(
    () =>
      orderEvaluationHistoryRows(visibleRows, {
        sort,
        byEvaluator,
        bySchool: filters.bySchool,
      }),
    [visibleRows, sort, byEvaluator, filters.bySchool],
  )

  const sectionTitle = chapterScope ?? formatGisuLabel(generation)
  // 서버가 집계 기준 시각(asOf)을 준다. 없을 때만 조회 시각으로 대체한다.
  const baseTime = formatBaseTime(asOf ? new Date(asOf) : new Date())

  const handleDownload = () => {
    const csv = toEvaluationHistoryCsv(orderedRows)
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

      {isLoading ? (
        <EmptyNotice message="평가 이력을 불러오는 중입니다." />
      ) : isError ? (
        <EmptyNotice message="평가 이력을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />
      ) : (
        <EvaluationHistoryCard
          rows={orderedRows}
          baseTime={baseTime}
          progress={progress}
          sort={sort}
          onSortChange={setSort}
          byEvaluator={byEvaluator}
          onByEvaluatorChange={setByEvaluator}
          className="mt-4"
        />
      )}
    </div>
  )
}

function EmptyNotice({ message }: { message: string }) {
  return (
    <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-4 flex min-h-50 items-center justify-center rounded-[12px] border bg-white">
      {message}
    </div>
  )
}
