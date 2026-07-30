import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { getChaptersWithSchools } from "@/entities/organization/api/organization"
import {
  type Chapter,
  CHAPTERS,
  isChapter,
} from "@/entities/organization/model/chapters"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { Calendar } from "@/shared/ui/calendar/Calendar"
import { DateTextBox } from "@/shared/ui/date-text-box/DateTextBox"
import { TimeTextBox } from "@/shared/ui/date-text-box/TimeTextBox"
import { Dropdown } from "@/shared/ui/Dropdown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { CheckboxIndicator } from "@/shared/ui/input/checkbox/CheckboxIndicator"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"
import { useToastStore } from "@/shared/ui/toast/useToastStore"
import { Tooltip } from "@/shared/ui/tooltip/Tooltip"

import { checkRecruitingRoundTitleAvailability } from "../../api/recruitingApi"
import { useAdminRecruitingRounds } from "../../hooks/useAdminRecruitingRounds"
import {
  resolveRecruitingListRole,
  resolveViewerChapter,
  resolveViewerSchool,
} from "../../model/recruitingRole"
import {
  buildRecruitmentPreviewTitle,
  composeRecruitmentTitle,
  dayCountInclusive,
  dayGap,
  DOC_PERIOD_DAYS,
  INITIAL_PERIOD_FORM,
  MAX_INTERVIEW_RESULT_DELAY_DAYS,
  MAX_TITLE_LENGTH,
  MAX_TOTAL_PERIOD_DAYS,
  resolveAvailableFooter,
} from "../../model/recruitmentCreate"
import { findSeasonIdBySchool } from "../../model/recruitmentList"
import { useRecruitmentCreateStore } from "../../model/useRecruitmentCreateStore"
import { RecruitmentPreviewCard } from "../RecruitmentPreviewCard"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

import type {
  PeriodFieldKey,
  PeriodFieldValue,
} from "../../model/recruitmentCreate"
import type { RecruitmentRoundType } from "../../model/recruitmentList"

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

function parsePeriodDate(value: PeriodFieldValue): Date | null {
  const parts = value.date.split("-")
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// 일정 상태 판별용: 날짜뿐 아니라 시각까지 포함해 지금 시각과 비교
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

const FULL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// 아직 다 입력되지 않은 날짜는 요약 리스트에 반영하지 않는다.
function isCompleteDate(dateStr: string): boolean {
  return FULL_DATE_PATTERN.test(dateStr)
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
  if (end < start) {
    return "종료 날짜는 시작 날짜 이후로 설정해 주세요."
  }
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
  role: roleProp,
  initialChapter,
  initialSchool,
}: RecruitmentBasicInfoFormProps) {
  const addToast = useToastStore((state) => state.addToast)
  const navigate = useNavigate()
  const [showTempSaveModal, setShowTempSaveModal] = useState(false)
  const chapter = useRecruitmentCreateStore((s) => s.basicInfo.chapter)
  const school = useRecruitmentCreateStore((s) => s.basicInfo.school)
  const recruitmentType = useRecruitmentCreateStore(
    (s) => s.basicInfo.recruitmentType,
  )
  const roundNo = useRecruitmentCreateStore((s) => s.basicInfo.roundNo)
  const interviewRequired = useRecruitmentCreateStore(
    (s) => s.basicInfo.interviewRequired,
  )
  const footer = useRecruitmentCreateStore((s) => s.basicInfo.footer)
  const periodForm = useRecruitmentCreateStore((s) => s.basicInfo.periodForm)
  const patchBasicInfo = useRecruitmentCreateStore((s) => s.patchBasicInfo)
  const seasonId = useRecruitmentCreateStore((s) => s.seasonId)
  const setSeasonId = useRecruitmentCreateStore((s) => s.setSeasonId)
  const {
    groups: seasonGroups,
    isLoading: isSeasonGroupsLoading,
    isForbidden: isAdminRoundsForbidden,
  } = useAdminRecruitingRounds()
  const { data: me } = useMe()
  // role은 목록 화면(또는 사이드바 직접 진입)에서 넘어온 값이 있으면 그걸 우선
  // 쓰고(진입 지점에 따른 고정 문맥), 없으면 실제 로그인 사용자의 권한으로 판단한다.
  // me.roles(RoleType)가 정상적으로 채워져 있으면 그걸 신뢰하지만, 계정에 따라
  // roles가 빈 배열로 내려오는 데이터 결손이 실제로 확인됐다(#657 평가 화면에서도
  // 같은 이유로 RoleType 대신 실제 권한 걸린 엔드포인트의 성공/403 응답으로 판단하는
  // 패턴을 씀). roles가 비어있을 때만 그 패턴을 빌려, admin 전용 조회(GET /admin/rounds)가
  // 403이면 schoolStaff로, 성공(또는 아직 로딩 중)이면 central로 대체 판단한다 —
  // chapterAdmin까지는 이 신호만으로 구분할 수 없어 더 넓은 central 쪽으로 폴백한다.
  const hasRoleTypeData = !!me?.roles?.length
  const role =
    roleProp ??
    (hasRoleTypeData
      ? resolveRecruitingListRole(me)
      : isAdminRoundsForbidden
        ? "schoolStaff"
        : "central")
  const viewerChapterName = resolveViewerChapter(me)
  const viewerChapter = isChapter(viewerChapterName)
    ? viewerChapterName
    : CHAPTERS[0]
  const viewerSchool = resolveViewerSchool(me)

  // 지부·학교 선택지는 실제 기수 기준 조직 데이터(GISU-201: 다른 화면들도 쓰는 getChaptersWithSchools)에서 가져온다.
  const gisuQuery = useActiveGisu()
  const gisuId = gisuQuery.data?.gisuId
    ? Number(gisuQuery.data.gisuId)
    : undefined
  const chaptersQuery = useQuery({
    queryKey: ["chapters", "with-schools", gisuId],
    queryFn: () => getChaptersWithSchools(String(gisuId!)),
    enabled: gisuId != null,
    staleTime: 5 * 60 * 1000,
  })
  const chapterEntries = chaptersQuery.data?.chapters ?? []
  const chapterOptions = chapterEntries
    .map((entry) => entry.chapterName)
    .filter(isChapter)
  const schoolOptions =
    chapterEntries
      .find((entry) => entry.chapterName === chapter)
      ?.schools.map((school) => school.schoolName) ?? []

  // seasonId는 URL param(목록 화면에서 넘어온 값)에 의존하지 않고, 학교가
  // 정해질 때마다 여기서 직접 조회해 스토어에 반영한다. 사이드바에서 이
  // 화면으로 바로 들어와 seasonId가 아예 없이 시작해도 동작하게 하기 위함.
  useEffect(() => {
    setSeasonId(findSeasonIdBySchool(seasonGroups, school) ?? null)
  }, [school, seasonGroups, setSeasonId])

  // 시즌은 기수 시작 시 학교당 1회 백오피스에서 미리 만들어두는 자원이라 프론트에
  // 만드는 화면이 없다. 학교를 골랐는데도 시즌이 안 잡히면 그건 아직 해당 학교의
  // 시즌이 세팅되지 않은 것이므로, 2단계까지 다 채운 뒤 생성 시점에야 막히지 않도록
  // 여기서 바로 안내하고 다음 단계 진행 자체를 막는다.
  const isSeasonMissing = !!school && !isSeasonGroupsLoading && !seasonId

  // 진입 지점(role·initialChapter·initialSchool)이 바뀌면 상위(RecruitmentCreatePage)가
  // key를 바꿔 이 컴포넌트를 통째로 리마운트시킨다. 그때마다 지부·학교 초기값을 새로 채운다.
  // role/viewerChapter/viewerSchool은 useMe 조회가 끝나야 채워지므로 의존성에 넣어
  // 로그인 정보가 늦게 도착해도 다시 채운다.
  useEffect(() => {
    patchBasicInfo({
      chapter:
        initialChapter ?? (role === "central" ? CHAPTERS[0] : viewerChapter),
      school:
        initialSchool ?? (role === "schoolStaff" ? viewerSchool : undefined),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, viewerChapter, viewerSchool])

  // 지부는 central만 자유 선택. 학교는 central이거나(지부 선택 후),
  // chapterAdmin이 지부 페이지(학교 미고정)에서 들어왔을 때만 선택 가능.
  const isChapterEditable = role === "central"
  const isSchoolEditable =
    role === "central" || (role === "chapterAdmin" && !initialSchool)
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
      interviewRequired,
      footer,
      periodForm,
    }),
  )

  const previewTitle = buildRecruitmentPreviewTitle({
    school,
    recruitmentType,
    roundNo,
  })
  const isTitleTooLong =
    composeRecruitmentTitle(previewTitle, footer).length > MAX_TITLE_LENGTH

  const handleRecruitmentTypeChange = (
    value: RecruitmentRoundType | undefined,
  ) => {
    // 정규 모집은 항상 1차로 고정, 추가 모집은 사용자가 다시 고르게 초기화
    patchBasicInfo({
      recruitmentType: value,
      roundNo: value === "REGULAR" ? "1" : undefined,
    })
  }

  const updatePeriodField = (
    key: PeriodFieldKey,
    patch: Partial<PeriodFieldValue>,
  ) => {
    patchBasicInfo({
      periodForm: { ...periodForm, [key]: { ...periodForm[key], ...patch } },
    })
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
        isCompleteDate(periodForm.documentStartAt.date) &&
        isCompleteDate(periodForm.documentEndAt.date)
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
      text: isCompleteDate(periodForm.documentResultPublishedAt.date)
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
        isCompleteDate(periodForm.interviewStartAt.date) &&
        isCompleteDate(periodForm.interviewEndAt.date)
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
      text: isCompleteDate(periodForm.finalResultPublishedAt.date)
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
    interviewRequired,
    footer,
    periodForm,
  })
  const hasUnsavedChanges = savedSnapshotRef.current !== currentSnapshot
  const canTempSave = hasUnsavedChanges && !isSaving && !isTitleTooLong

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  // seasonId가 아직 없으면(시즌 없는 학교) 중복 체크를 할 대상 자체가 없으니
  // 통과시킨다 — 실제 생성 시점엔 시즌 가드가 별도로 막는다. 조회 실패도
  // 마찬가지로 진행을 막지 않는다: 최종 중복은 생성 시 DB unique index/409가 방어한다.
  const checkTitleAvailable = async (title: string): Promise<boolean> => {
    if (!seasonId) return true
    try {
      return await checkRecruitingRoundTitleAvailability(seasonId, title)
    } catch {
      return true
    }
  }

  const handleTempSave = async () => {
    const { footer: resolvedFooter, wasAdjusted } =
      await resolveAvailableFooter(previewTitle, footer, checkTitleAvailable)

    if (wasAdjusted) {
      patchBasicInfo({ footer: resolvedFooter })
      showTitleAdjustedToast()
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

  // 제목 중복 시 꼬릿말 숫자를 자동으로 보정한 것을 알리는 안내
  // 등록 자체를 막는 에러가 아니므로 저장/다음 진행은 계속
  const showTitleAdjustedToast = () => {
    addToast({
      message: "같은 공고 제목이 있어 꼬릿말에 숫자가 표기 되었습니다.",
      color: "primary",
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
    !isSeasonMissing &&
    !isTitleTooLong &&
    !!recruitmentType &&
    (recruitmentType !== "ADDITIONAL" || !!roundNo) &&
    !!periodForm.documentStartAt.date &&
    !!periodForm.documentEndAt.date &&
    !!periodForm.documentResultPublishedAt.date &&
    (!interviewRequired ||
      (!!periodForm.interviewStartAt.date &&
        !!periodForm.interviewEndAt.date)) &&
    !!periodForm.finalResultPublishedAt.date

  const handleNext = async () => {
    const { footer: resolvedFooter, wasAdjusted } =
      await resolveAvailableFooter(previewTitle, footer, checkTitleAvailable)
    if (wasAdjusted) {
      patchBasicInfo({ footer: resolvedFooter })
      showTitleAdjustedToast()
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
    const interviewDelayError = interviewRequired
      ? validateInterviewResultDelay(interviewEnd, finalResult)
      : null
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
                      patchBasicInfo({
                        chapter: value as Chapter | undefined,
                        school: undefined,
                      })
                    }}
                  >
                    {chapterOptions.map((value) => (
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

              <div className="flex flex-col gap-2">
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
                      onChange={(value) => patchBasicInfo({ school: value })}
                      options={schoolOptions.map((value) => ({
                        value,
                        label: value,
                      }))}
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
                {/* 임시 메시지(시즌 미생성시)*/}
                {isSeasonMissing && (
                  <p className="text-body-2-medium pl-22 text-red-500">
                    모집 시즌 생성 전입니다.
                  </p>
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
                    onValueChange={(value) =>
                      patchBasicInfo({ roundNo: value })
                    }
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
                <div className="flex items-center gap-2">
                  <span className="text-body-1-medium text-teal-gray-600">
                    면접 진행
                  </span>
                  <Checkbox
                    checked={interviewRequired}
                    onChange={(checked) => {
                      patchBasicInfo({
                        interviewRequired: checked,
                        periodForm: checked
                          ? periodForm
                          : {
                              ...periodForm,
                              interviewStartAt:
                                INITIAL_PERIOD_FORM.interviewStartAt,
                              interviewEndAt:
                                INITIAL_PERIOD_FORM.interviewEndAt,
                            },
                      })
                    }}
                    variant="primary"
                    size="lg"
                    aria-label="면접 진행 여부"
                  />
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
                    onFooterChange={(value) =>
                      patchBasicInfo({ footer: value })
                    }
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
                {isTitleTooLong && (
                  <p className="text-body-2-medium pl-22 text-red-500">
                    공고 제목은 {MAX_TITLE_LENGTH}자를 넘을 수 없습니다.
                    꼬릿말을 줄여주세요.
                  </p>
                )}
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
                      <span
                        className={cn(
                          "text-subtitle-3-semibold",
                          interviewRequired
                            ? "text-teal-600"
                            : "text-teal-gray-300",
                        )}
                      >
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
                            disabled={!interviewRequired}
                          />
                          <TimeTextBox
                            value={periodForm.interviewStartAt.time}
                            onChange={(time) =>
                              updatePeriodField("interviewStartAt", { time })
                            }
                            disabled={!interviewRequired}
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
                            disabled={!interviewRequired}
                          />
                          <TimeTextBox
                            value={periodForm.interviewEndAt.time}
                            onChange={(time) =>
                              updatePeriodField("interviewEndAt", { time })
                            }
                            disabled={!interviewRequired}
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
