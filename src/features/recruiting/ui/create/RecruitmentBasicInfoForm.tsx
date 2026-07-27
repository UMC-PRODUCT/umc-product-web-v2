import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { type Chapter, CHAPTERS } from "@/entities/organization/model/chapters"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { Calendar } from "@/shared/ui/calendar/Calendar"
import { DateTextBox } from "@/shared/ui/date-text-box/DateTextBox"
import { TimeTextBox } from "@/shared/ui/date-text-box/TimeTextBox"
import { Dropdown } from "@/shared/ui/Dropdown"
import { CheckboxIndicator } from "@/shared/ui/input/checkbox/CheckboxIndicator"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"
import { useToastStore } from "@/shared/ui/toast/useToastStore"
import { Tooltip } from "@/shared/ui/tooltip/Tooltip"

import {
  dayCountInclusive,
  dayGap,
  DOC_PERIOD_DAYS,
  MAX_INTERVIEW_RESULT_DELAY_DAYS,
  MAX_TOTAL_PERIOD_DAYS,
  resolveAvailableFooter,
} from "../../model/recruitmentCreate"
import { RECRUITMENT_LIST_MOCK } from "../../model/recruitmentList.mock"
import { RecruitmentPreviewCard } from "../RecruitmentPreviewCard"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

import type { RecruitmentRoundType } from "../../model/recruitmentList"

// TODO: 실제로는 백엔드에 제목 중복 여부를 조회해야 함
const EXISTING_RECRUITMENT_TITLES_MOCK = RECRUITMENT_LIST_MOCK.map(
  (post) => post.title,
)

// TODO: 로그인한 사용자의 실제 기수로 교체
const RECRUITING_GISU_MOCK = 11

const RECRUITMENT_TYPES: { value: RecruitmentRoundType; label: string }[] = [
  { value: "REGULAR", label: "정규 모집" },
  { value: "ADDITIONAL", label: "추가 모집" },
]

const RECRUITMENT_ROUNDS = [
  { value: "1", label: "1차" },
  { value: "2", label: "2차" },
  { value: "3", label: "3차" },
  { value: "4", label: "4차" },
  { value: "5", label: "5차" },
] as const

type PeriodFieldKey =
  | "documentStartAt"
  | "documentEndAt"
  | "documentResultPublishedAt"
  | "interviewStartAt"
  | "interviewEndAt"
  | "finalResultPublishedAt"

interface PeriodFieldValue {
  date: string
  time: string
}

const INITIAL_PERIOD_FORM: Record<PeriodFieldKey, PeriodFieldValue> = {
  documentStartAt: { date: "", time: "00:00" },
  documentEndAt: { date: "", time: "23:59" },
  documentResultPublishedAt: { date: "", time: "00:00" },
  interviewStartAt: { date: "", time: "00:00" },
  interviewEndAt: { date: "", time: "23:59" },
  finalResultPublishedAt: { date: "", time: "12:00" },
}

function parsePeriodDate(value: PeriodFieldValue): Date | null {
  const parts = value.date.split("-")
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// 일정 상태 판별용: 날짜뿐 아니라 시각까지 포함해 지금 시각과 비교한다.
function parsePeriodDateTime(value: PeriodFieldValue): Date | null {
  const date = parsePeriodDate(value)
  if (!date) return null
  const timeParts = value.time.split(":")
  const hour = Number(timeParts[0])
  const minute = Number(timeParts[1])
  if (Number.isNaN(hour) || Number.isNaN(minute)) return date
  date.setHours(hour, minute, 0, 0)
  return date
}

// 시작/종료(또는 발표 시점 하나)를 지금 시각과 비교해 완료/진행중/예정을 판별한다.
function getScheduleStatus(
  start: Date | null,
  end: Date | null,
  now: Date,
): ScheduleItemStatus {
  if (!start) return "upcoming"
  const rangeEnd = end ?? start
  if (now > rangeEnd) return "completed"
  if (now >= start) return "active"
  return "upcoming"
}

// 일정 요약 리스트 표시용: "2026-08-01" -> "08월 01일" (저장 형식은 그대로 둠)
function formatMonthDay(dateStr: string): string {
  const [, month, day] = dateStr.split("-")
  return `${month}월 ${day}일`
}

// 이미 완료된 일정(수정 불가) / 진행 중인 일정 / 예정된 일정
type ScheduleItemStatus = "completed" | "active" | "upcoming"

// 서류 접수 기간 검증. 필드 변경 시(handleDocumentEndAtChange)와 다음 단계 진입 시(handleNext) 공용으로 쓴다.
function validateDocumentPeriod(
  recruitmentType: RecruitmentRoundType | undefined,
  start: Date | null,
  end: Date | null,
): string | null {
  if (!recruitmentType || !start || !end) return null
  const { min, max } = DOC_PERIOD_DAYS[recruitmentType]
  const days = dayCountInclusive(start, end)
  if (days < min || days > max) {
    return recruitmentType === "ADDITIONAL"
      ? `추가 모집 서류 접수 기간은 최소 ${min}일, 최대 ${max}일까지 설정할 수 있습니다.`
      : `정규 모집 서류 접수 기간은 최소 ${min}일, 최대 ${max}일까지 설정할 수 있습니다.`
  }
  return null
}

// 면접 결과 발표 지연 검증. 위와 동일하게 필드 변경 시·다음 단계 진입 시 공용으로 쓴다.
function validateInterviewResultDelay(
  interviewEnd: Date | null,
  finalResult: Date | null,
): string | null {
  if (!interviewEnd || !finalResult) return null
  const gap = dayGap(interviewEnd, finalResult)
  if (gap < 0 || gap > MAX_INTERVIEW_RESULT_DELAY_DAYS) {
    return `면접 결과 발표는 면접 종료 후부터 최대 ${MAX_INTERVIEW_RESULT_DELAY_DAYS}일까지 설정할 수 있습니다.`
  }
  return null
}

// 모집 생성 화면을 보는 사람의 권한.
// - central: 지부·학교를 자유롭게 선택 (지부 선택 시 첫번째 지부가 기본 선택됨)
// - chapterAdmin: 지부는 텍스트로 고정, 학교는 진입 지점에 따라 선택 가능하거나 고정
// - schoolStaff: 지부·학교 둘 다 텍스트로 고정, 선택 불가
type RecruitmentViewerRole = "central" | "chapterAdmin" | "schoolStaff"

// TODO: 실제로는 목록 페이지(지부/학교별 진입 경로)에서 라우팅으로 role·지부·학교를 내려받아야 함.
// 아직 그 라우팅이 없어서 지금은 central 기본값 + 이 목업으로만 미리보기 가능.
const VIEWER_CHAPTER_MOCK: Chapter = CHAPTERS[0]
const VIEWER_SCHOOL_MOCK = SCHOOLS_BY_BRANCH[VIEWER_CHAPTER_MOCK]?.[0]

interface RecruitmentBasicInfoFormProps {
  onNext: () => void
  onDirtyChange?: (dirty: boolean) => void
  role?: RecruitmentViewerRole
  // chapterAdmin·schoolStaff일 때 고정 표시할 지부. central은 무시(자유 선택).
  initialChapter?: Chapter
  // 진입 지점에 따른 고정 학교.
  // - chapterAdmin: 값이 있으면(학교 페이지에서 진입) 학교도 텍스트로 고정, 없으면(지부 페이지에서 진입) 드롭다운으로 선택 가능
  // - schoolStaff: 항상 고정
  initialSchool?: string
}

export function RecruitmentBasicInfoForm({
  onNext,
  onDirtyChange,
  role = "central",
  initialChapter,
  initialSchool,
}: RecruitmentBasicInfoFormProps) {
  const addToast = useToastStore((state) => state.addToast)
  const navigate = useNavigate()
  const [showTempSaveModal, setShowTempSaveModal] = useState(false)
  const [chapter, setChapter] = useState<Chapter | undefined>(
    initialChapter ?? (role === "central" ? CHAPTERS[0] : VIEWER_CHAPTER_MOCK),
  )
  const [school, setSchool] = useState<string | undefined>(
    initialSchool ?? (role === "schoolStaff" ? VIEWER_SCHOOL_MOCK : undefined),
  )
  // 공통 디폴트: 정규 모집·1차가 항상 기본 선택되어 있어야 한다.
  const [recruitmentType, setRecruitmentType] = useState<
    RecruitmentRoundType | undefined
  >("REGULAR")
  const [roundNo, setRoundNo] = useState<string | undefined>("1")
  // 지부는 central만 자유 선택. 학교는 central이거나(지부 선택 후),
  // chapterAdmin이 지부 페이지(학교 미고정)에서 들어왔을 때만 선택 가능.
  const isChapterEditable = role === "central"
  const isSchoolEditable =
    role === "central" || (role === "chapterAdmin" && !initialSchool)
  const [footer, setFooter] = useState("")
  const [periodForm, setPeriodForm] = useState(INITIAL_PERIOD_FORM)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() + 1 }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const savedSnapshotRef = useRef(
    JSON.stringify({
      chapter,
      school,
      recruitmentType,
      roundNo,
      footer,
      periodForm,
    }),
  )

  // 정규 모집은 항상 1차 고정이라 제목엔 차수 표기 안 함
  // (다른 화면에서도 정규 모집은 차수 없이 '정규'로만 노출)
  const previewTitle = `${school ?? "전체 학교"} UMC ${RECRUITING_GISU_MOCK}기 ${
    recruitmentType === "ADDITIONAL" && roundNo ? `${roundNo}차 ` : ""
  }${
    recruitmentType === "ADDITIONAL"
      ? "추가 모집"
      : recruitmentType === "REGULAR"
        ? "정규 모집"
        : "모집"
  }`

  const handleRecruitmentTypeChange = (
    value: RecruitmentRoundType | undefined,
  ) => {
    setRecruitmentType(value)
    // 정규 모집은 항상 1차로 고정, 추가 모집은 사용자가 다시 고르게 초기화
    setRoundNo(value === "REGULAR" ? "1" : undefined)
  }

  const updatePeriodField = (
    key: PeriodFieldKey,
    patch: Partial<PeriodFieldValue>,
  ) => {
    setPeriodForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  const documentStartAtDate = parsePeriodDate(periodForm.documentStartAt)
  const documentEndAtDate = parsePeriodDate(periodForm.documentEndAt)
  const interviewStartAtDate = parsePeriodDate(periodForm.interviewStartAt)
  const interviewEndAtDate = parsePeriodDate(periodForm.interviewEndAt)

  const highlightRanges = [
    documentStartAtDate && documentEndAtDate
      ? { start: documentStartAtDate, end: documentEndAtDate }
      : null,
    interviewStartAtDate && interviewEndAtDate
      ? { start: interviewStartAtDate, end: interviewEndAtDate }
      : null,
  ].filter((range): range is { start: Date; end: Date } => range !== null)

  const markedDates = [
    parsePeriodDate(periodForm.documentResultPublishedAt),
    parsePeriodDate(periodForm.finalResultPublishedAt),
  ].filter((date): date is Date => date !== null)

  // 캘린더 밑 일정 요약 리스트: 날짜가 입력된 항목만 보여준다.
  const recruitmentTypeLabel =
    recruitmentType === "ADDITIONAL" ? "추가" : "정규"
  const now = new Date()
  const scheduleItems = [
    {
      key: "documentPeriod",
      title: "서류 모집기간",
      status: getScheduleStatus(
        parsePeriodDateTime(periodForm.documentStartAt),
        parsePeriodDateTime(periodForm.documentEndAt),
        now,
      ),
      text:
        periodForm.documentStartAt.date && periodForm.documentEndAt.date
          ? `${formatMonthDay(periodForm.documentStartAt.date)} ${periodForm.documentStartAt.time} ~ ${formatMonthDay(periodForm.documentEndAt.date)} ${periodForm.documentEndAt.time}`
          : null,
    },
    {
      key: "documentResult",
      title: "서류 결과 발표",
      status: getScheduleStatus(
        parsePeriodDateTime(periodForm.documentResultPublishedAt),
        null,
        now,
      ),
      text: periodForm.documentResultPublishedAt.date
        ? `${formatMonthDay(periodForm.documentResultPublishedAt.date)} ${periodForm.documentResultPublishedAt.time}`
        : null,
    },
    {
      key: "interviewPeriod",
      title: "면접 진행기간",
      status: getScheduleStatus(
        parsePeriodDateTime(periodForm.interviewStartAt),
        parsePeriodDateTime(periodForm.interviewEndAt),
        now,
      ),
      text:
        periodForm.interviewStartAt.date && periodForm.interviewEndAt.date
          ? `${formatMonthDay(periodForm.interviewStartAt.date)} ${periodForm.interviewStartAt.time} ~ ${formatMonthDay(periodForm.interviewEndAt.date)} ${periodForm.interviewEndAt.time}`
          : null,
    },
    {
      key: "interviewResult",
      title: "면접 결과 발표",
      status: getScheduleStatus(
        parsePeriodDateTime(periodForm.finalResultPublishedAt),
        null,
        now,
      ),
      text: periodForm.finalResultPublishedAt.date
        ? `${formatMonthDay(periodForm.finalResultPublishedAt.date)} ${periodForm.finalResultPublishedAt.time}`
        : null,
    },
  ].filter(
    (
      item,
    ): item is {
      key: string
      title: string
      status: ScheduleItemStatus
      text: string
    } => item.text !== null,
  )

  const currentSnapshot = JSON.stringify({
    chapter,
    school,
    recruitmentType,
    roundNo,
    footer,
    periodForm,
  })
  const hasUnsavedChanges = savedSnapshotRef.current !== currentSnapshot
  const canTempSave = hasUnsavedChanges && !isSaving

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  const handleTempSave = () => {
    const { footer: resolvedFooter, wasAdjusted } = resolveAvailableFooter(
      previewTitle,
      footer,
      EXISTING_RECRUITMENT_TITLES_MOCK,
    )

    if (wasAdjusted) {
      setFooter(resolvedFooter)
      addToast({
        message: "같은 공고 제목이 있어 숫자가 자동 +1 되었습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    setIsSaving(true)
    // TODO: 실제 임시 저장 API 호출로 교체 (지금은 로딩 상태만 흉내)
    setTimeout(() => {
      savedSnapshotRef.current = currentSnapshot
      setIsSaving(false)
      setShowTempSaveModal(true)
    }, 600)
  }

  const showPeriodErrorToast = (message: string) => {
    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  const handleDocumentEndAtChange = (date: string) => {
    updatePeriodField("documentEndAt", { date })
    if (!periodForm.documentStartAt.date || !date) return

    const start = parsePeriodDate(periodForm.documentStartAt)
    const end = parsePeriodDate({ date, time: periodForm.documentEndAt.time })
    const message = validateDocumentPeriod(recruitmentType, start, end)
    if (message) showPeriodErrorToast(message)
  }

  const handleFinalResultPublishedAtChange = (date: string) => {
    updatePeriodField("finalResultPublishedAt", { date })
    if (!periodForm.interviewEndAt.date || !date) return

    const interviewEnd = parsePeriodDate(periodForm.interviewEndAt)
    const result = parsePeriodDate({
      date,
      time: periodForm.finalResultPublishedAt.time,
    })
    const message = validateInterviewResultDelay(interviewEnd, result)
    if (message) showPeriodErrorToast(message)
  }

  // 필수 항목 적용
  const canProceedToNext =
    !!chapter &&
    !!school &&
    !!recruitmentType &&
    (recruitmentType !== "ADDITIONAL" || !!roundNo) &&
    !!periodForm.documentStartAt.date &&
    !!periodForm.documentEndAt.date &&
    !!periodForm.documentResultPublishedAt.date &&
    !!periodForm.interviewStartAt.date &&
    !!periodForm.interviewEndAt.date &&
    !!periodForm.finalResultPublishedAt.date

  const handleNext = () => {
    const { footer: resolvedFooter, wasAdjusted } = resolveAvailableFooter(
      previewTitle,
      footer,
      EXISTING_RECRUITMENT_TITLES_MOCK,
    )
    if (wasAdjusted) {
      setFooter(resolvedFooter)
      showPeriodErrorToast("같은 공고 제목이 있어 숫자가 자동 +1 되었습니다.")
      return
    }

    const documentStart = parsePeriodDate(periodForm.documentStartAt)
    const documentEnd = parsePeriodDate(periodForm.documentEndAt)
    const documentPeriodError = validateDocumentPeriod(
      recruitmentType,
      documentStart,
      documentEnd,
    )
    if (documentPeriodError) {
      showPeriodErrorToast(documentPeriodError)
      return
    }

    const interviewEnd = parsePeriodDate(periodForm.interviewEndAt)
    const finalResult = parsePeriodDate(periodForm.finalResultPublishedAt)
    const interviewDelayError = validateInterviewResultDelay(
      interviewEnd,
      finalResult,
    )
    if (interviewDelayError) {
      showPeriodErrorToast(interviewDelayError)
      return
    }

    if (documentStart && finalResult) {
      const totalDays = dayCountInclusive(documentStart, finalResult)
      if (totalDays > MAX_TOTAL_PERIOD_DAYS) {
        showPeriodErrorToast(
          `전체 모집 기간이 ${MAX_TOTAL_PERIOD_DAYS}일을 넘을 수 없습니다.`,
        )
        return
      }
    }

    setIsAdvancing(true)
    // TODO: 실제로는 1단계 데이터 저장 API 호출 후 다음 단계로 이동
    setTimeout(() => {
      setIsAdvancing(false)
      onNext()
    }, 600)
  }

  return (
    <>
      <div className="border-teal-gray-150 mt-6 flex flex-col items-end gap-6 rounded-2xl border bg-white px-8 py-8.5">
        <div className="flex w-full flex-col gap-14">
          <div className="flex flex-col gap-8">
            <RecruitmentSectionHeader index={1} title="모집 정보" />

            <div className="flex flex-col gap-8 px-8.5">
              {isChapterEditable ? (
                <div className="flex items-center gap-6">
                  <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                    지부 선택
                  </span>
                  <OptionButtonGroup
                    variant="segmented"
                    value={chapter}
                    onValueChange={(value) => {
                      setChapter(value as Chapter | undefined)
                      setSchool(undefined)
                    }}
                  >
                    {CHAPTERS.map((value) => (
                      <OptionButton key={value} value={value}>
                        {value}
                      </OptionButton>
                    ))}
                  </OptionButtonGroup>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <span className="text-body-1-medium text-teal-gray-600 w-16 shrink-0">
                    지부 정보
                  </span>
                  <span className="text-body-1-medium text-teal-500">
                    {chapter}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-6">
                <span
                  className={cn(
                    "w-16 shrink-0",
                    isSchoolEditable
                      ? "text-body-1-regular text-teal-gray-700"
                      : "text-body-1-medium text-teal-gray-600",
                  )}
                >
                  모집 학교
                </span>
                {isSchoolEditable ? (
                  <Dropdown
                    value={school}
                    onChange={setSchool}
                    options={(chapter ? SCHOOLS_BY_BRANCH[chapter] : []).map(
                      (value) => ({ value, label: value }),
                    )}
                    placeholder="학교 선택"
                    disabled={!chapter}
                    className="w-52.5"
                  />
                ) : (
                  <span className="text-body-1-medium text-teal-500">
                    {school}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-6">
                  <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                    모집 유형
                  </span>
                  <OptionButtonGroup
                    variant="segmented"
                    value={recruitmentType}
                    onValueChange={(value) =>
                      handleRecruitmentTypeChange(
                        value as RecruitmentRoundType | undefined,
                      )
                    }
                  >
                    {RECRUITMENT_TYPES.map(({ value, label }) => (
                      <OptionButton key={value} value={value}>
                        {label}
                      </OptionButton>
                    ))}
                  </OptionButtonGroup>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-body-1-regular text-teal-gray-700 shrink-0">
                    차수
                  </span>
                  <OptionButtonGroup
                    variant="segmented"
                    value={roundNo}
                    onValueChange={setRoundNo}
                  >
                    {RECRUITMENT_ROUNDS.map(({ value, label }) => (
                      <OptionButton
                        key={value}
                        value={value}
                        disabled={
                          recruitmentType === "REGULAR" && value !== roundNo
                        }
                      >
                        {label}
                      </OptionButton>
                    ))}
                  </OptionButtonGroup>
                </div>
              </div>

              <div className="flex flex-col gap-2 pr-22.5">
                <div className="flex items-center gap-6">
                  <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                    공고 제목
                  </span>
                  <RecruitmentPreviewCard
                    title={previewTitle}
                    footer={footer}
                    emptyFooterPlaceholder="꼬릿말을 필요 시 작성하세요 (선택)"
                    onFooterChange={setFooter}
                    startLabel={
                      periodForm.documentStartAt.date
                        ? `${periodForm.documentStartAt.date} ${periodForm.documentStartAt.time}`
                        : "2000-00-00 00:00"
                    }
                    endLabel={
                      periodForm.documentEndAt.date
                        ? `${periodForm.documentEndAt.date.slice(5)} ${periodForm.documentEndAt.time}`
                        : "00-00 23:59"
                    }
                    className="flex-1"
                  />
                </div>
                <p className="text-body-2-medium text-teal-gray-400 pl-22">
                  * 꼬릿말 예시: 사본 1, 테스트 1, 디자인 파트
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <RecruitmentSectionHeader index={2} title="기간 설정" />

            <div className="flex items-start gap-10 pl-5.5">
              <div className="border-teal-gray-100 flex w-95 flex-col gap-5 rounded-2xl border bg-white pt-2 pb-3">
                <Calendar
                  year={calendarMonth.year}
                  month={calendarMonth.month}
                  onMonthChange={(year, month) =>
                    setCalendarMonth({ year, month })
                  }
                  highlightRanges={highlightRanges}
                  markedDates={markedDates}
                  className="w-full border-none"
                />

                {scheduleItems.length > 0 && (
                  <div className="flex flex-col items-start gap-[0.4375rem] px-3">
                    {scheduleItems.map((item) => {
                      const isCompleted = item.status === "completed"
                      const isActive = item.status === "active"
                      const labelWeightClass = isActive
                        ? "text-sm leading-[1.5] tracking-[-0.01em] font-semibold"
                        : "text-body-2-medium"
                      return (
                        <div
                          key={item.key}
                          className={cn(
                            "flex w-full flex-col items-start rounded-lg border-l-8 border-l-teal-500 pl-2",
                            isActive ? "bg-teal-100/50" : "bg-teal-gray-50",
                          )}
                        >
                          <div
                            className={cn(
                              "flex w-full items-center justify-between gap-2.5 rounded-tr-lg rounded-br-lg border-t border-r border-b px-3 py-[0.5625rem]",
                              isActive
                                ? "border-teal-100"
                                : "border-teal-gray-100",
                            )}
                          >
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    labelWeightClass,
                                    "w-7 shrink-0 text-teal-600",
                                  )}
                                >
                                  {recruitmentTypeLabel}
                                </span>
                                <span
                                  className={cn(
                                    labelWeightClass,
                                    isActive
                                      ? "text-teal-600"
                                      : isCompleted
                                        ? "text-teal-gray-500"
                                        : "text-teal-gray-900",
                                  )}
                                >
                                  {item.title}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "text-body-3-regular",
                                  isCompleted
                                    ? "text-teal-gray-400/80"
                                    : "text-teal-gray-500/80",
                                )}
                              >
                                {item.text}
                              </span>
                            </div>
                            {isCompleted && (
                              <CheckboxIndicator
                                checked
                                variant="primary"
                                disabled
                                size="lg"
                              />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5 py-7">
                <div className="flex flex-col gap-14">
                  <div className="flex flex-col gap-7">
                    <div className="flex flex-col gap-2">
                      <span className="text-subtitle-3-semibold text-teal-600">
                        서류 모집 기간
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <DateTextBox
                            label="시작"
                            value={periodForm.documentStartAt.date}
                            onChange={(date) =>
                              updatePeriodField("documentStartAt", { date })
                            }
                          />
                          <TimeTextBox
                            value={periodForm.documentStartAt.time}
                            onChange={(time) =>
                              updatePeriodField("documentStartAt", { time })
                            }
                          />
                        </div>
                        <span className="text-teal-gray-400">~</span>
                        <div className="flex items-center gap-1.5">
                          <DateTextBox
                            label="종료"
                            value={periodForm.documentEndAt.date}
                            onChange={handleDocumentEndAtChange}
                          />
                          <TimeTextBox
                            value={periodForm.documentEndAt.time}
                            onChange={(time) =>
                              updatePeriodField("documentEndAt", { time })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-subtitle-3-semibold text-teal-600">
                        서류 결과 발표
                      </span>
                      <div className="flex items-center gap-1.5">
                        <DateTextBox
                          label="시작"
                          value={periodForm.documentResultPublishedAt.date}
                          onChange={(date) =>
                            updatePeriodField("documentResultPublishedAt", {
                              date,
                            })
                          }
                        />
                        <TimeTextBox
                          value={periodForm.documentResultPublishedAt.time}
                          onChange={(time) =>
                            updatePeriodField("documentResultPublishedAt", {
                              time,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-7">
                    <div className="flex flex-col gap-2">
                      <span className="text-subtitle-3-semibold text-teal-600">
                        면접 진행 기간
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <DateTextBox
                            label="시작"
                            value={periodForm.interviewStartAt.date}
                            onChange={(date) =>
                              updatePeriodField("interviewStartAt", { date })
                            }
                          />
                          <TimeTextBox
                            value={periodForm.interviewStartAt.time}
                            onChange={(time) =>
                              updatePeriodField("interviewStartAt", { time })
                            }
                          />
                        </div>
                        <span className="text-teal-gray-400">~</span>
                        <div className="flex items-center gap-1.5">
                          <DateTextBox
                            label="종료"
                            value={periodForm.interviewEndAt.date}
                            onChange={(date) =>
                              updatePeriodField("interviewEndAt", { date })
                            }
                          />
                          <TimeTextBox
                            value={periodForm.interviewEndAt.time}
                            onChange={(time) =>
                              updatePeriodField("interviewEndAt", { time })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-subtitle-3-semibold text-teal-600">
                        면접 결과 발표
                      </span>
                      <div className="flex items-center gap-1.5">
                        <DateTextBox
                          label="시작"
                          value={periodForm.finalResultPublishedAt.date}
                          onChange={handleFinalResultPublishedAtChange}
                        />
                        <TimeTextBox
                          value={periodForm.finalResultPublishedAt.time}
                          onChange={(time) =>
                            updatePeriodField("finalResultPublishedAt", {
                              time,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Tooltip
                  label="모집 기간 설정"
                  content={
                    <>
                      단일 모집의 최대 기간은 {MAX_TOTAL_PERIOD_DAYS}일 입니다.
                      <br />
                      전체 모집이 종료된 이후에는 모집 기간을 변경 할 수
                      없습니다.
                    </>
                  }
                  side="right"
                  dark={false}
                  className="w-max"
                  triggerClassName="self-start"
                >
                  <button
                    type="button"
                    aria-label="기간 설정 안내"
                    className="text-teal-gray-200 flex h-6.5 w-6.5 items-center justify-center"
                  >
                    <InfoCircleIcon className="h-6 w-6" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="weak"
            color="primary"
            disabled={!canTempSave}
            isLoading={isSaving}
            onClick={handleTempSave}
          >
            임시 저장
          </Button>
          <Button
            type="button"
            variant="fill"
            color="primary"
            disabled={!canProceedToNext}
            isLoading={isAdvancing}
            onClick={handleNext}
          >
            다음
          </Button>
        </div>
      </div>

      <CtaModal
        open={showTempSaveModal}
        onOpenChange={setShowTempSaveModal}
        variant="success"
        title="임시 저장 완료"
        content="임시저장이 완료되었습니다."
        confirmText="확인"
        onConfirm={() => navigate({ to: "/recruiting/recruitments" })}
      />
    </>
  )
}
