import { useMemo, useState } from "react"

import FilterIcon from "@/shared/assets/icon/filter/FilterIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { segmentTriggerVariants } from "@/shared/ui/segment/segment.config"

import { formatNoticePeriod } from "../model/recruitmentNotice"
import { RECRUITMENT_NOTICE_ITEMS_MOCK } from "../model/recruitmentNotice.mock"
import { RecruitmentApplyConfirmModal } from "./RecruitmentApplyConfirmModal"
import { RecruitmentNoticeCard } from "./RecruitmentNoticeCard"
import { RecruitmentNoticePreviewModal } from "./RecruitmentNoticePreviewModal"
import { RecruitmentNoticeSchoolSearchField } from "./RecruitmentNoticeSchoolSearchField"

import type { PartTag } from "@/shared/model/domain"

import type { RecruitmentNoticeItem } from "../model/recruitmentNotice"

type NoticeTab = "recruiting" | "past"

const NOTICE_TABS: { id: NoticeTab; label: string }[] = [
  { id: "recruiting", label: "진행 중인 모집" },
  { id: "past", label: "이미 지난 모집" },
]

// 검색 자동완성은 지부 상관없이 전체 학교를 대상으로 한다.
const ALL_SCHOOLS = Object.values(SCHOOLS_BY_BRANCH).flat()

const NOTICE_FILTER_PARTS: PartTag[] = ["pm", "design", "web-pe", "mobile-pe"]
const PART_FILTER_OPTIONS = NOTICE_FILTER_PARTS.map((part) => ({
  value: part,
  label: PART_TAG_LABEL[part],
}))

export function RecruitmentNoticePage() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<NoticeTab>("recruiting")
  const [schoolFilterOpen, setSchoolFilterOpen] = useState(false)
  const [schoolFilters, setSchoolFilters] = useState<string[]>([])
  const [partFilterOpen, setPartFilterOpen] = useState(false)
  const [partFilters, setPartFilters] = useState<string[]>([])
  const [selectedItem, setSelectedItem] =
    useState<RecruitmentNoticeItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false)

  // TODO: API 연동 시 RECRUITMENT_NOTICE_ITEMS_MOCK 대신 실제 응답으로 교체
  const allItems = RECRUITMENT_NOTICE_ITEMS_MOCK

  const schoolFilterOptions = useMemo(
    () =>
      Array.from(new Set(allItems.map((item) => item.schoolName))).map(
        (school) => ({ value: school, label: school }),
      ),
    [allItems],
  )

  const items = allItems.filter((item) => {
    if (tab === "recruiting" && item.isClosed) return false
    if (tab === "past" && !item.isClosed) return false
    if (search && !item.schoolName.includes(search)) return false
    if (schoolFilters.length > 0 && !schoolFilters.includes(item.schoolName))
      return false
    if (
      partFilters.length > 0 &&
      !item.parts.some((part) => partFilters.includes(part))
    )
      return false
    return true
  })

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex w-full items-start justify-between">
        <RecruitmentNoticeSchoolSearchField
          value={search}
          onChange={(value) => {
            setSearch(value)
            setSchoolFilters([])
          }}
          schools={ALL_SCHOOLS}
          className="w-80"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FilterIcon className="text-teal-gray-500 size-4" />
            <span className="text-body-1-medium text-teal-gray-600">필터</span>
          </div>
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="학교"
              multiSelect
              open={schoolFilterOpen}
              onClick={() => setSchoolFilterOpen((prev) => !prev)}
              onRequestClose={() => setSchoolFilterOpen(false)}
              options={schoolFilterOptions}
              selectedValues={schoolFilters}
              onSelectedValuesChange={setSchoolFilters}
            />
            <FilterDropdown
              label="모집 파트"
              multiSelect
              open={partFilterOpen}
              onClick={() => setPartFilterOpen((prev) => !prev)}
              onRequestClose={() => setPartFilterOpen(false)}
              options={PART_FILTER_OPTIONS}
              selectedValues={partFilters}
              onSelectedValuesChange={setPartFilters}
            />
          </div>
        </div>
      </div>

      <div role="tablist" className="flex w-full items-center">
        {NOTICE_TABS.map((item) => {
          const selected = item.id === tab
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={cn(segmentTriggerVariants({ selected }))}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {items.length === 0 ? (
        <p className="text-body-2-medium text-teal-gray-400 flex w-full items-center justify-center py-30">
          등록된 모집 공고가 없습니다.
        </p>
      ) : (
        <div className="flex w-full flex-col items-start gap-0.5">
          {items.map((item) => (
            <RecruitmentNoticeCard
              key={item.id}
              title={item.title}
              period={formatNoticePeriod(
                item.documentStartAt,
                item.documentEndAt,
              )}
              parts={item.parts}
              isClosed={item.isClosed}
              dDay={item.dDay}
              logoUrl={item.logoUrl}
              onClick={() => {
                setSelectedItem(item)
                setPreviewOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <RecruitmentNoticePreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={selectedItem?.title ?? ""}
        content={selectedItem?.announcement}
        onApply={() => {
          setPreviewOpen(false)
          setApplyConfirmOpen(true)
        }}
      />

      {selectedItem && (
        <RecruitmentApplyConfirmModal
          open={applyConfirmOpen}
          onOpenChange={setApplyConfirmOpen}
          // TODO: 로그인/지원 이력 조회 API 연동 시 실제 상태로 교체
          status="confirm"
          recruitmentTitle={selectedItem.title}
          // TODO: 지원 폼 라우트 연결 (routes/projects/ 지원 방법 미구현 상태)
          onConfirm={() => setApplyConfirmOpen(false)}
        />
      )}
    </div>
  )
}
