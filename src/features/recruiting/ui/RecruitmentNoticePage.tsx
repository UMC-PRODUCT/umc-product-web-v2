import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import FilterIcon from "@/shared/assets/icon/filter/FilterIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { Segment } from "@/shared/ui/segment/Segment"

import { usePublicRecruitmentNotices } from "../hooks/usePublicRecruitmentNotices"
import { formatNoticePeriod } from "../model/recruitmentNotice"
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
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<NoticeTab>("recruiting")
  const [openFilterKey, setOpenFilterKey] = useState<"school" | "part" | null>(
    null,
  )
  const [schoolFilters, setSchoolFilters] = useState<string[]>([])
  const [partFilters, setPartFilters] = useState<string[]>([])
  const [selectedItem, setSelectedItem] =
    useState<RecruitmentNoticeItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [applyConfirmOpen, setApplyConfirmOpen] = useState(false)

  const { items: allItems, isLoading, isError } = usePublicRecruitmentNotices()

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
          <span className="text-body-1-medium text-teal-gray-600 flex items-center gap-1">
            <FilterIcon className="text-teal-gray-600 size-4" />
            필터
          </span>
          <div className="flex items-center gap-2">
            <FilterDropdown
              label="학교"
              multiSelect
              open={openFilterKey === "school"}
              onClick={() =>
                setOpenFilterKey((prev) =>
                  prev === "school" ? null : "school",
                )
              }
              onRequestClose={() => setOpenFilterKey(null)}
              options={schoolFilterOptions}
              selectedValues={schoolFilters}
              onSelectedValuesChange={(values) => {
                setSchoolFilters(values)
                setSearch("")
              }}
            />
            <FilterDropdown
              label="모집 파트"
              multiSelect
              open={openFilterKey === "part"}
              onClick={() =>
                setOpenFilterKey((prev) => (prev === "part" ? null : "part"))
              }
              onRequestClose={() => setOpenFilterKey(null)}
              options={PART_FILTER_OPTIONS}
              selectedValues={partFilters}
              onSelectedValuesChange={setPartFilters}
            />
          </div>
        </div>
      </div>

      <Segment
        items={NOTICE_TABS.map(({ id, label }) => ({ id, label }))}
        value={tab}
        onValueChange={(id) => setTab(id as NoticeTab)}
      />

      {isLoading ? (
        <p className="text-body-2-medium text-teal-gray-400 flex w-full items-center justify-center py-30">
          모집 공고를 불러오는 중입니다.
        </p>
      ) : isError ? (
        <p className="text-body-2-medium text-teal-gray-400 flex w-full items-center justify-center py-30">
          모집 공고를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : items.length === 0 ? (
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
        isClosed={selectedItem?.isClosed ?? false}
        onApply={() => {
          setPreviewOpen(false)
          setApplyConfirmOpen(true)
        }}
      />

      {selectedItem && (
        <RecruitmentApplyConfirmModal
          open={applyConfirmOpen}
          onOpenChange={setApplyConfirmOpen}
          status={selectedItem.appliedStatus ?? "confirm"}
          recruitmentTitle={selectedItem.title}
          onConfirm={() => {
            setApplyConfirmOpen(false)
            // 아직 지원 전이면 지원서를 새로 쓰고, 이미 쓴 지원서가 있으면
            // 내 지원서로 보낸다. 수정은 지원 폼이 아니라 그쪽 경로다.
            if (selectedItem.appliedStatus == null) {
              void navigate({
                to: "/projects/apply/$roundId",
                params: { roundId: selectedItem.roundId },
              })
              return
            }
            void navigate({ to: "/projects/application/list" })
          }}
        />
      )}
    </div>
  )
}
