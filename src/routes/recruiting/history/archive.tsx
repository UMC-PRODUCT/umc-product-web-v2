import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import {
  getServerErrorMessage,
  getServerErrorMessageFromBlob,
} from "@/features/recruiting/api/errors"
import { downloadDecisionHistoriesCsv } from "@/features/recruiting/api/recruitingApi"
import { useEvaluationHistory } from "@/features/recruiting/hooks/useEvaluationHistory"
import { formatBaseTime } from "@/features/recruiting/model/applicantListTypes"
import {
  applyEvaluationHistoryFilters,
  DEFAULT_EVALUATION_HISTORY_FILTERS,
  EVALUATION_HISTORY_CHAPTER_TAB_ALL,
  type EvaluationHistoryFilters,
  type EvaluationHistorySort,
  orderEvaluationHistoryRows,
  toDecisionHistoriesQuery,
} from "@/features/recruiting/model/evaluationHistory"
import { formatGisuLabel } from "@/features/recruiting/model/recruitingRole"
import { ChapterTabs } from "@/features/recruiting/ui/ChapterTabs"
import { EvaluationHistoryCard } from "@/features/recruiting/ui/history/EvaluationHistoryCard"
import { EvaluationHistoryFilterBar } from "@/features/recruiting/ui/history/EvaluationHistoryFilterBar"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

export const Route = createFileRoute("/recruiting/history/archive")({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    rows,
    progress,
    asOf,
    gisuId,
    generation,
    isLoading,
    isError,
    error,
    hasActiveGisu,
  } = useEvaluationHistory()
  const addToast = useToastStore((state) => state.addToast)
  const [filters, setFilters] = useState<EvaluationHistoryFilters>(
    DEFAULT_EVALUATION_HISTORY_FILTERS,
  )
  // 카드의 정렬/담당자별 상태를 여기서 갖고 있어야 CSV 다운로드가 화면과 같은 순서를 쓸 수 있다.
  const [sort, setSort] = useState<EvaluationHistorySort>("latest")
  const [byEvaluator, setByEvaluator] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleFiltersChange = (partial: Partial<EvaluationHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }))
  }

  // 지부 탭이 "전체"가 아니면 그 지부로 좁혀진 상태다. 상수 목록과 대조하지 않고
  // 탭 값을 그대로 쓴다 - 지부 목록이 서버 데이터로 바뀌어도 동작한다.
  const chapterScope =
    filters.chapterTab === EVALUATION_HISTORY_CHAPTER_TAB_ALL
      ? undefined
      : filters.chapterTab

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

  // 서버가 만든 CSV 를 그대로 내려받는다. 실명·원문 이메일을 제외하는 개인정보 처리를
  // 서버가 담당하므로 클라이언트에서 CSV 를 만들지 않는다.
  const handleDownload = async () => {
    if (gisuId == null) return
    setIsDownloading(true)
    try {
      const blob = await downloadDecisionHistoriesCsv({
        gisuId,
        ...toDecisionHistoriesQuery(filters, sort, byEvaluator, rows),
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `평가이력_${sectionTitle}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      addToast({
        message:
          (await getServerErrorMessageFromBlob(error)) ??
          "평가 이력을 다운로드하지 못했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsDownloading(false)
    }
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
        rows={rows}
        chapterScope={chapterScope}
        onDownload={handleDownload}
        // 화면에 아무것도 없으면 내려받을 것도 없다. rows(전체) 기준으로 두면
        // 지부 탭에 이력이 없을 때도 버튼이 열리는데, 그 지부의 ID 를 행에서 찾지
        // 못해 필터가 빠지면서 전 범위 CSV 가 내려온다.
        downloadDisabled={visibleRows.length === 0}
        downloadLoading={isDownloading}
        className="mt-6"
      />

      <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
        {sectionTitle}
      </h2>

      {isLoading ? (
        <EmptyNotice message="평가 이력을 불러오는 중입니다." />
      ) : !hasActiveGisu ? (
        <EmptyNotice message="진행 중인 기수가 없어 평가 이력을 표시할 수 없습니다." />
      ) : isError ? (
        // 이 화면은 중앙 운영진만 조회할 수 있고 학교·지부 운영진은 403 을 받는다.
        // 기다려도 안 풀리는 실패라 서버가 주는 사유를 그대로 보여준다.
        <EmptyNotice
          message={
            getServerErrorMessage(error) ??
            "평가 이력을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
          }
        />
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
