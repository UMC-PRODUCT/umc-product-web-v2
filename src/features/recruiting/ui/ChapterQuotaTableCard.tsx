import { useEffect, useRef, useState } from "react"

import { cn } from "@/shared/lib/utils"

import { QuotaEditableCell } from "./QuotaEditableCell"

import type {
  ChapterQuotaData,
  SchoolQuotaRow,
} from "../model/recruitmentQuota"

export type AllocationStatus = "TO 설정 전" | "자동 배정 중" | "임의 배정 중"

interface ChapterQuotaTableCardProps {
  data: ChapterQuotaData
  status: AllocationStatus
  onDirtyChange?: (dirty: boolean) => void
  onManualEdit?: () => void
  onErrorExceeded?: (partName: string, maxAllowed: number) => void
  onSchoolsDataChange?: (schools: SchoolQuotaRow[]) => void
  autoAllocateTrigger?: number
  className?: string
}

export function ChapterQuotaTableCard({
  data,
  status,
  onDirtyChange,
  onManualEdit,
  onErrorExceeded,
  onSchoolsDataChange,
  autoAllocateTrigger,
  className,
}: ChapterQuotaTableCardProps) {
  const [schoolsData, setSchoolsData] = useState<SchoolQuotaRow[]>(data.schools)
  const [chapterTotals, setChapterTotals] = useState(data.totals)
  const [lastValidSchoolsData, setLastValidSchoolsData] = useState<
    SchoolQuotaRow[]
  >(data.schools)

  const isTotalsEditedRef = useRef(false)
  const prevSchoolsRef = useRef(data.schools)

  const onSchoolsDataChangeRef = useRef(onSchoolsDataChange)
  useEffect(() => {
    onSchoolsDataChangeRef.current = onSchoolsDataChange
  }, [onSchoolsDataChange])

  useEffect(() => {
    if (prevSchoolsRef.current !== data.schools) {
      prevSchoolsRef.current = data.schools
      isTotalsEditedRef.current = false
      setSchoolsData(data.schools)
      setLastValidSchoolsData(data.schools)
      setChapterTotals(data.totals)
    } else if (!isTotalsEditedRef.current) {
      setChapterTotals(data.totals)
    }
  }, [data.schools, data.totals])

  // Execute Auto Allocation when triggered
  useEffect(() => {
    if (!autoAllocateTrigger || data.schools.length === 0) return

    const N = data.schools.length
    const tPM = chapterTotals.pm
    const tDesign = chapterTotals.design
    const tWebPe = chapterTotals.webPe
    const tMobilePe = chapterTotals.mobilePe

    const maxPM = Math.floor(tPM / N)
    const maxDesign = Math.floor(tDesign / N)
    const maxWebPe = Math.floor(tWebPe / (2.5 * N))
    const maxMobilePe = Math.floor(tMobilePe / (2.5 * N))

    const u = Math.max(0, Math.min(maxPM, maxDesign, maxWebPe, maxMobilePe))

    const allocPM = u
    const allocDesign = u
    const allocWebPe = Math.floor(u * 2.5)
    const allocMobilePe = Math.floor(u * 2.5)

    const updatedSchools = data.schools.map((school) => {
      const total = allocPM + allocDesign + allocWebPe + allocMobilePe
      return {
        ...school,
        pm: allocPM,
        design: allocDesign,
        webPe: allocWebPe,
        mobilePe: allocMobilePe,
        total,
      }
    })

    setSchoolsData(updatedSchools)
    setLastValidSchoolsData(updatedSchools)
    onSchoolsDataChangeRef.current?.(updatedSchools)
  }, [autoAllocateTrigger, data.schools, chapterTotals])

  const checkIsAllValid = (schools: SchoolQuotaRow[]) => {
    const pmSum = schools.reduce((acc, s) => acc + s.pm, 0)
    const designSum = schools.reduce((acc, s) => acc + s.design, 0)
    const webPeSum = schools.reduce((acc, s) => acc + s.webPe, 0)
    const mobilePeSum = schools.reduce((acc, s) => acc + s.mobilePe, 0)

    return (
      pmSum <= chapterTotals.pm &&
      designSum <= chapterTotals.design &&
      webPeSum <= chapterTotals.webPe &&
      mobilePeSum <= chapterTotals.mobilePe
    )
  }

  const handleChapterTotalChange = (
    partKey: "pm" | "design" | "webPe" | "mobilePe",
    newTotal: number,
  ) => {
    isTotalsEditedRef.current = true
    const updatedTotals = { ...chapterTotals, [partKey]: newTotal }
    updatedTotals.total =
      updatedTotals.pm +
      updatedTotals.design +
      updatedTotals.webPe +
      updatedTotals.mobilePe

    setChapterTotals(updatedTotals)
    onDirtyChange?.(true)
    onManualEdit?.()
    onSchoolsDataChange?.(schoolsData)
  }

  const handleCellChange = (
    schoolName: string,
    partKey: "pm" | "design" | "webPe" | "mobilePe",
    newValue: number,
  ) => {
    const nextSchoolsData = schoolsData.map((school) => {
      if (school.schoolName !== schoolName) return school
      const updated = { ...school, [partKey]: newValue }
      const total =
        updated.pm + updated.design + updated.webPe + updated.mobilePe
      return { ...updated, total }
    })

    prevSchoolsRef.current = nextSchoolsData
    setSchoolsData(nextSchoolsData)

    const newSum = nextSchoolsData.reduce((acc, s) => acc + s[partKey], 0)
    if (newSum > chapterTotals[partKey]) {
      setChapterTotals((prev) => {
        const next = { ...prev, [partKey]: newSum }
        next.total = next.pm + next.design + next.webPe + next.mobilePe
        return next
      })
    }

    if (checkIsAllValid(nextSchoolsData)) {
      setLastValidSchoolsData(nextSchoolsData)
    }

    onDirtyChange?.(true)
    onManualEdit?.()
    onSchoolsDataChange?.(nextSchoolsData)
  }

  const currentPMTotal = schoolsData.reduce((acc, s) => acc + s.pm, 0)
  const currentWebPeTotal = schoolsData.reduce((acc, s) => acc + s.webPe, 0)
  const currentDesignTotal = schoolsData.reduce((acc, s) => acc + s.design, 0)
  const currentMobilePeTotal = schoolsData.reduce(
    (acc, s) => acc + s.mobilePe,
    0,
  )

  const fixedTotals = chapterTotals

  const remainingPM = fixedTotals.pm - currentPMTotal
  const remainingDesign = fixedTotals.design - currentDesignTotal
  const remainingWebPe = fixedTotals.webPe - currentWebPeTotal
  const remainingMobilePe = fixedTotals.mobilePe - currentMobilePeTotal

  const remainingTotal =
    Math.max(0, remainingPM) +
    Math.max(0, remainingDesign) +
    Math.max(0, remainingWebPe) +
    Math.max(0, remainingMobilePe)

  const getMaxAllowedForSchool = (
    partKey: "pm" | "design" | "webPe" | "mobilePe",
    schoolName: string,
  ) => {
    const fixedTotal = fixedTotals[partKey]
    const otherSchoolsSum = lastValidSchoolsData
      .filter((s) => s.schoolName !== schoolName)
      .reduce((acc, s) => acc + s[partKey], 0)

    return Math.max(0, fixedTotal - otherSchoolsSum)
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex w-full justify-between">
        <div />
        <div className="flex items-center gap-3 px-1">
          {data.updatedDate && data.updatedTime && (
            <p className="text-body-1-regular text-teal-gray-400">
              <span>{data.updatedDate}</span>
              <span className="pl-1">{data.updatedTime}</span>
              <span className="pl-0.5">기준</span>
            </p>
          )}

          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-teal-500" />
            <span className="text-label-2-medium text-teal-500">{status}</span>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="border-teal-gray-200 divide-teal-gray-300 box-border flex w-full flex-col divide-y overflow-hidden rounded-[8px] border">
        {/* row - 제목 */}
        <div className="divide-teal-gray-300 flex h-22 w-full divide-x">
          <div className="flex w-42.5 flex-col items-center justify-center bg-teal-50">
            <p>
              <span className="text-heading-6-semibold text-teal-500">
                {data.chapter}
              </span>
              <span className="text-subtitle-1-medium text-teal-gray-400 pl-1">
                지부
              </span>
            </p>
            <p className="text-body-1-medium text-teal-gray-400">
              총 {data.schoolCount}개 학교
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">PM</p>
            <p className="text-subtitle-2-medium text-teal-700">
              {fixedTotals.pm}명
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">Design</p>
            <p className="text-subtitle-2-medium text-teal-700">
              {fixedTotals.design}명
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">Web PE</p>
            <p className="text-subtitle-2-medium text-teal-700">
              {fixedTotals.webPe}명
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">
              Mobile PE
            </p>
            <p className="text-subtitle-2-medium text-teal-700">
              {fixedTotals.mobilePe}명
            </p>
          </div>
          <div className="bg-teal-gray-150 flex w-35 items-center justify-center">
            <p className="text-heading-6-semibold text-teal-gray-800">
              합계 인원
            </p>
          </div>
        </div>

        {/* School rows */}
        {schoolsData.map((school) => {
          return (
            <div
              key={school.schoolName}
              className="divide-teal-gray-300 flex h-14 w-full divide-x"
            >
              <div className="bg-teal-gray-50 flex w-42.5 items-center justify-center">
                <p className="text-heading-7-semibold text-teal-gray-700">
                  {school.schoolName}
                </p>
              </div>
              <QuotaEditableCell
                partName="PM"
                value={school.pm}
                maxAllowed={getMaxAllowedForSchool("pm", school.schoolName)}
                onChange={(val) =>
                  handleCellChange(school.schoolName, "pm", val)
                }
                onErrorExceeded={onErrorExceeded}
              />
              <QuotaEditableCell
                partName="Design"
                value={school.design}
                maxAllowed={getMaxAllowedForSchool("design", school.schoolName)}
                onChange={(val) =>
                  handleCellChange(school.schoolName, "design", val)
                }
                onErrorExceeded={onErrorExceeded}
              />
              <QuotaEditableCell
                partName="Web PE"
                value={school.webPe}
                maxAllowed={getMaxAllowedForSchool("webPe", school.schoolName)}
                onChange={(val) =>
                  handleCellChange(school.schoolName, "webPe", val)
                }
                onErrorExceeded={onErrorExceeded}
              />
              <QuotaEditableCell
                partName="Mobile PE"
                value={school.mobilePe}
                maxAllowed={getMaxAllowedForSchool(
                  "mobilePe",
                  school.schoolName,
                )}
                onChange={(val) =>
                  handleCellChange(school.schoolName, "mobilePe", val)
                }
                onErrorExceeded={onErrorExceeded}
              />
              <div className="bg-teal-gray-100 relative w-35">
                <p className="text-body-2-medium text-teal-gray-400 absolute inset-x-0 top-[3.5px] text-center">
                  {school.schoolName}
                </p>
                <p className="absolute inset-x-0 bottom-[3.5px] text-center">
                  <span className="text-heading-6-semibold text-teal-500">
                    {school.total}
                  </span>
                  <span className="text-subtitle-1-medium text-teal-gray-400 pl-px">
                    명
                  </span>
                </p>
              </div>
            </div>
          )
        })}

        {/* Remaining row */}
        <div className="divide-teal-gray-300 flex h-11 w-full divide-x">
          <div className="bg-warning-50 flex w-42.5 items-center justify-center">
            <p className="text-subtitle-1-medium text-warning-500">잔여</p>
          </div>
          <div className="flex flex-1 items-center justify-center bg-white">
            {remainingPM > 0 ? (
              <p>
                <span className="text-subtitle-1-medium text-warning-500">
                  {remainingPM}
                </span>
                <span className="text-subtitle-1-medium text-warning-500 pl-px">
                  명
                </span>
              </p>
            ) : (
              <p className="text-subtitle-1-medium text-teal-gray-700">-</p>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center bg-white">
            {remainingDesign > 0 ? (
              <p>
                <span className="text-subtitle-1-medium text-warning-500">
                  {remainingDesign}
                </span>
                <span className="text-subtitle-1-medium text-warning-500 pl-px">
                  명
                </span>
              </p>
            ) : (
              <p className="text-subtitle-1-medium text-teal-gray-700">-</p>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center bg-white">
            {remainingWebPe > 0 ? (
              <p>
                <span className="text-subtitle-1-medium text-warning-500">
                  {remainingWebPe}
                </span>
                <span className="text-subtitle-1-medium text-warning-500 pl-px">
                  명
                </span>
              </p>
            ) : (
              <p className="text-subtitle-1-medium text-teal-gray-700">-</p>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center bg-white">
            {remainingMobilePe > 0 ? (
              <p>
                <span className="text-subtitle-1-medium text-warning-500">
                  {remainingMobilePe}
                </span>
                <span className="text-subtitle-1-medium text-warning-500 pl-px">
                  명
                </span>
              </p>
            ) : (
              <p className="text-subtitle-1-medium text-teal-gray-700">-</p>
            )}
          </div>
          <div className="bg-warning-50 text-subtitle-1-medium text-warning-500 flex w-35 items-center justify-center gap-1">
            <p>총</p>
            <p>{remainingTotal}</p>
            <p>명</p>
          </div>
        </div>

        {/* Totals row */}
        <div className="divide-teal-gray-300 flex h-14 w-full divide-x">
          <div className="bg-teal-gray-50 flex w-42.5 items-center justify-center">
            <p className="text-subtitle-1-medium text-teal-gray-900">
              지부 전체
            </p>
          </div>
          <QuotaEditableCell
            partName="지부 전체 PM"
            value={chapterTotals.pm}
            onChange={(val) => handleChapterTotalChange("pm", val)}
            className="bg-teal-100"
          />
          <QuotaEditableCell
            partName="지부 전체 Design"
            value={chapterTotals.design}
            onChange={(val) => handleChapterTotalChange("design", val)}
            className="bg-teal-100"
          />
          <QuotaEditableCell
            partName="지부 전체 Web PE"
            value={chapterTotals.webPe}
            onChange={(val) => handleChapterTotalChange("webPe", val)}
            className="bg-teal-100"
          />
          <QuotaEditableCell
            partName="지부 전체 Mobile PE"
            value={chapterTotals.mobilePe}
            onChange={(val) => handleChapterTotalChange("mobilePe", val)}
            className="bg-teal-100"
          />

          <div
            className="flex h-14 w-35 shrink-0 items-center justify-center gap-1"
            style={{
              background:
                "linear-gradient(0deg, rgba(199, 235, 230, 0.4), rgba(199, 235, 230, 0.4)), #E5F5F2",
            }}
          >
            <p className="text-heading-6-semibold text-teal-600">총</p>
            <p className="text-heading-6-semibold text-teal-600">
              {chapterTotals.total}
            </p>
            <p className="text-subtitle-1-medium text-teal-gray-400">명</p>
          </div>
        </div>
      </div>
    </div>
  )
}
