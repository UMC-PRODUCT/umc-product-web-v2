import { useState } from "react"

import { cn } from "@/shared/lib/utils"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import {
  APPLICANT_ORDER_OPTIONS,
  APPLICANT_SORT_OPTIONS,
  type ApplicantListFilters,
  type ApplicantRow as ApplicantRowModel,
} from "../model/applicantListTypes"
import { ApplicantRow } from "./ApplicantRow"
import { ApplicantTableHead } from "./ApplicantTableHead"

import type { EvaluationStage } from "../model/evaluationStage"

type CardStatus = "beforeApply" | "evaluating"

const CARD_STATUS_STYLE: Record<
  CardStatus,
  { dot: string; text: string; label: string }
> = {
  beforeApply: {
    dot: "bg-teal-gray-400",
    text: "text-teal-gray-500",
    label: "지원 전",
  },
  evaluating: {
    dot: "bg-warning-500",
    text: "text-warning-500",
    label: "평가 진행 중",
  },
}

interface ApplicantTableCardProps {
  rows: ApplicantRowModel[]
  stage: EvaluationStage
  totalCount: number
  baseTime: string
  filters: ApplicantListFilters
  onFiltersChange: (partial: Partial<ApplicantListFilters>) => void
  className?: string
}

export function ApplicantTableCard({
  rows,
  stage,
  totalCount,
  baseTime,
  filters,
  onFiltersChange,
  className,
}: ApplicantTableCardProps) {
  const [openDropdown, setOpenDropdown] = useState<"sort" | "order" | null>(
    null,
  )
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const isEmpty = rows.length === 0
  const status: CardStatus = isEmpty ? "beforeApply" : "evaluating"
  const statusStyle = CARD_STATUS_STYLE[status]
  const hasExpanded = expandedIds.size > 0

  const toggleRow = (applicationId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(applicationId)) next.delete(applicationId)
      else next.add(applicationId)
      return next
    })
  }

  const toggleAll = () => {
    setExpandedIds((prev) =>
      prev.size > 0
        ? new Set<string>()
        : new Set(rows.map((row) => row.applicationId)),
    )
  }

  return (
    <section
      className={cn(
        "shadow-drop-neutral-3 flex w-full flex-col rounded-[20px] bg-white px-8 py-7",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between">
        <h3 className="text-heading-6-semibold text-teal-gray-700">
          전체 지원자
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={filters.includeRegular}
              onChange={(checked) =>
                onFiltersChange({ includeRegular: checked })
              }
              variant="primary"
              aria-label="정규 모집 포함"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              정규 모집
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={filters.includeAdditional}
              onChange={(checked) =>
                onFiltersChange({ includeAdditional: checked })
              }
              variant="primary"
              aria-label="추가 모집 포함"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              추가 모집
            </span>
          </label>
          <FilterDropdown
            label="최신 순"
            multiSelect={false}
            className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
            open={openDropdown === "sort"}
            onClick={() =>
              setOpenDropdown((prev) => (prev === "sort" ? null : "sort"))
            }
            onRequestClose={() => setOpenDropdown(null)}
            options={[...APPLICANT_SORT_OPTIONS]}
            selectedValue={filters.sort}
            selectedLabel={
              APPLICANT_SORT_OPTIONS.find(
                (option) => option.value === filters.sort,
              )?.label
            }
            onSelect={(value) =>
              onFiltersChange({
                sort: value === "registered" ? "registered" : "latest",
              })
            }
          />
          <FilterDropdown
            label="순서"
            multiSelect={false}
            className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
            open={openDropdown === "order"}
            onClick={() =>
              setOpenDropdown((prev) => (prev === "order" ? null : "order"))
            }
            onRequestClose={() => setOpenDropdown(null)}
            options={[...APPLICANT_ORDER_OPTIONS]}
            selectedValue={filters.order === "" ? undefined : filters.order}
            selectedLabel={
              APPLICANT_ORDER_OPTIONS.find(
                (option) => option.value === filters.order,
              )?.label
            }
            onSelect={(value) =>
              onFiltersChange({
                order:
                  filters.order === value
                    ? ""
                    : (APPLICANT_ORDER_OPTIONS.find(
                        (option) => option.value === value,
                      )?.value ?? ""),
              })
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <span className="text-body-1-regular text-teal-gray-400">
          {baseTime} 기준
        </span>
        <span className="bg-teal-gray-200 h-3 w-px" aria-hidden="true" />
        <span className="text-body-1-regular text-teal-gray-400">
          총 {totalCount.toLocaleString()} 명
        </span>
        <span className="ml-1 inline-flex h-6 items-center gap-1.5">
          <span
            className={cn("size-3 rounded-full", statusStyle.dot)}
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-label-2-medium whitespace-nowrap",
              statusStyle.text,
            )}
          >
            {statusStyle.label}
          </span>
        </span>
      </div>
      <div role="table" className="mt-8 flex flex-col">
        {isEmpty ? (
          <div className="flex min-h-75 items-center justify-center">
            <p className="text-body-2-regular text-teal-gray-400">
              현재 지원자가 없습니다.
            </p>
          </div>
        ) : (
          <>
            <ApplicantTableHead
              hasExpanded={hasExpanded}
              onToggleAll={toggleAll}
            />
            {rows.map((row) => (
              <ApplicantRow
                key={row.applicationId}
                row={row}
                stage={stage}
                expanded={expandedIds.has(row.applicationId)}
                onToggle={() => toggleRow(row.applicationId)}
              />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
