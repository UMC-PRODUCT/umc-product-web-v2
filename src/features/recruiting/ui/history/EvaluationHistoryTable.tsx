import { cn } from "@/shared/lib/utils"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"

import { formatHistoryProcessedAt } from "../../model/evaluationHistory"

import type { EvaluationHistoryEntry } from "../../model/evaluationHistory"

function HeadCell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-label-1-medium flex items-center justify-center text-teal-900",
        className,
      )}
    >
      {children}
    </div>
  )
}

function TableHead() {
  return (
    <div className="flex h-10 items-center rounded-t-xl bg-teal-100 px-7.5">
      <HeadCell className="min-w-42.5 pr-6">처리 일시</HeadCell>
      <div className="h-4 w-px shrink-0 bg-teal-300" />
      <HeadCell className="min-w-95 px-6">지원자 정보</HeadCell>
      <div className="h-4 w-px shrink-0 bg-teal-300" />
      <HeadCell className="min-w-100.5 px-4">담당자 정보</HeadCell>
    </div>
  )
}

function TableRow({
  row,
  zebra,
}: {
  row: EvaluationHistoryEntry
  zebra: boolean
}) {
  const { date, time } = formatHistoryProcessedAt(row.processedAt)

  return (
    <div
      className={cn(
        "flex h-11.5 items-center px-7.5",
        // Figma: teal-gray-50(#fbfcfc) 위에 teal-gray-100(#f6f7f7) 40% 오버레이 = 불투명한 겹행 배경.
        // /40으로 반투명 처리하면 카드 흰 배경과 섞여 훨씬 옅어지므로 solid로 근사한다.
        zebra && "bg-teal-gray-50",
      )}
    >
      <div className="text-body-2-regular text-teal-gray-900 flex min-w-42.5 items-center gap-1.5 pr-7">
        <span>{date}</span>
        <span>{time}</span>
        <span className="text-teal-gray-600">처리</span>
      </div>

      <div className="bg-teal-gray-100 h-full w-px shrink-0" />

      <div className="flex min-w-95 items-center gap-3.5 px-7">
        <span className="text-body-2-medium text-teal-gray-900 w-18">
          {row.applicant.chapter}
        </span>
        <span className="text-body-2-medium text-teal-gray-900 w-20 truncate">
          {row.applicant.school}
        </span>
        <span className="text-body-2-medium text-teal-gray-900 w-15 truncate">
          {row.applicant.name}
        </span>
        {/* 판정 결과가 없으면 태그를 그리지 않는다. 행 자체는 남겨야 이력이
            유실되지 않는다. */}
        {row.applicant.result && (
          <StatusChipTag value={row.applicant.result} type="tag" />
        )}
      </div>

      <div className="bg-teal-gray-100 h-full w-px shrink-0" />

      <div className="flex items-center gap-4 px-4">
        <span className="text-body-2-medium text-teal-gray-900 w-18">
          {row.evaluator.chapter}
        </span>
        <span className="text-body-2-medium text-teal-gray-900 w-20 truncate">
          {row.evaluator.school}
        </span>
        <span className="text-body-2-medium text-teal-gray-900 w-10">
          {row.evaluator.position}
        </span>
        <span className="text-body-2-medium text-teal-gray-900">
          {row.evaluator.nickname}/{row.evaluator.name}
        </span>
      </div>
    </div>
  )
}

interface EvaluationHistoryTableProps {
  rows: EvaluationHistoryEntry[]
  className?: string
}

// "담당자별" 정렬은 행 순서만 바꾼다(담당자 그룹별로 뭉쳐서 정렬). 그룹을 구분하는
// 별도 헤더 행은 추가하지 않는다.
export function EvaluationHistoryTable({
  rows,
  className,
}: EvaluationHistoryTableProps) {
  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "border-teal-gray-100 flex h-60 items-center justify-center rounded-xl border",
          className,
        )}
      >
        <span className="text-body-2-medium text-teal-gray-400">
          현재 등록된 최종 평가가 없습니다
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <TableHead />
      <div className="border-teal-gray-100 flex flex-col overflow-clip rounded-b-xl border-x border-b">
        {rows.map((row, index) => (
          <TableRow key={row.id} row={row} zebra={index % 2 === 1} />
        ))}
      </div>
    </div>
  )
}
