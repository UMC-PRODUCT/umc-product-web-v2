import { useState } from "react"

import { type Chapter, CHAPTERS } from "@/entities/organization/model/chapters"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { Button } from "@/shared/ui/Button"
import { Calendar } from "@/shared/ui/calendar/Calendar"
import { DateTextBox } from "@/shared/ui/date-text-box/DateTextBox"
import { TimeTextBox } from "@/shared/ui/date-text-box/TimeTextBox"
import { Dropdown } from "@/shared/ui/Dropdown"
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
  documentEndAt: { date: "", time: "11:59" },
  documentResultPublishedAt: { date: "", time: "00:00" },
  interviewStartAt: { date: "", time: "00:00" },
  interviewEndAt: { date: "", time: "11:59" },
  finalResultPublishedAt: { date: "", time: "12:00" },
}

function parsePeriodDate(value: PeriodFieldValue): Date | null {
  const parts = value.date.split("-")
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

interface RecruitmentBasicInfoFormProps {
  onNext: () => void
}

export function RecruitmentBasicInfoForm({
  onNext,
}: RecruitmentBasicInfoFormProps) {
  const addToast = useToastStore((state) => state.addToast)
  const [chapter, setChapter] = useState<Chapter | undefined>(undefined)
  const [school, setSchool] = useState<string | undefined>(undefined)
  const [recruitmentType, setRecruitmentType] = useState<
    RecruitmentRoundType | undefined
  >(undefined)
  const [roundNo, setRoundNo] = useState<string | undefined>(undefined)
  const [footer, setFooter] = useState("")
  const [periodForm, setPeriodForm] = useState(INITIAL_PERIOD_FORM)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() + 1 }
  })

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

    // TODO: 실제 임시 저장 API 호출
    addToast({
      message: "작성한 내용이 임시 저장되었습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  const handleDocumentEndAtChange = (date: string) => {
    updatePeriodField("documentEndAt", { date })
    if (!recruitmentType || !periodForm.documentStartAt.date || !date) return

    const start = parsePeriodDate(periodForm.documentStartAt)
    const end = parsePeriodDate({ date, time: periodForm.documentEndAt.time })
    if (!start || !end) return

    const { min, max } = DOC_PERIOD_DAYS[recruitmentType]
    const days = dayCountInclusive(start, end)
    if (days < min || days > max) {
      addToast({
        message:
          recruitmentType === "ADDITIONAL"
            ? `추가 모집 서류 접수 기간은 최소 ${min}일, 최대 ${max}일까지 설정할 수 있습니다.`
            : `정규 모집 서류 접수 기간은 최소 ${min}일, 최대 ${max}일까지 설정할 수 있습니다.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const handleFinalResultPublishedAtChange = (date: string) => {
    updatePeriodField("finalResultPublishedAt", { date })
    if (!periodForm.interviewEndAt.date || !date) return

    const interviewEnd = parsePeriodDate(periodForm.interviewEndAt)
    const result = parsePeriodDate({
      date,
      time: periodForm.finalResultPublishedAt.time,
    })
    if (!interviewEnd || !result) return

    const gap = dayGap(interviewEnd, result)
    if (gap < 0 || gap > MAX_INTERVIEW_RESULT_DELAY_DAYS) {
      addToast({
        message: `면접 결과 발표는 면접 종료 후부터 최대 ${MAX_INTERVIEW_RESULT_DELAY_DAYS}일까지 설정할 수 있습니다.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  const handleNext = () => {
    const start = parsePeriodDate(periodForm.documentStartAt)
    const end = parsePeriodDate(periodForm.finalResultPublishedAt)
    if (start && end) {
      const totalDays = dayCountInclusive(start, end)
      if (totalDays > MAX_TOTAL_PERIOD_DAYS) {
        addToast({
          message: `전체 모집 기간이 ${MAX_TOTAL_PERIOD_DAYS}일을 넘을 수 없습니다.`,
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
    }
    onNext()
  }

  return (
    <div className="border-teal-gray-150 mt-6 flex flex-col items-end gap-6 rounded-2xl border bg-white px-8 py-8.5">
      <div className="flex w-full flex-col gap-14">
        <div className="flex flex-col gap-8">
          <RecruitmentSectionHeader index={1} title="모집 정보" />

          <div className="flex flex-col gap-8 px-8.5">
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

            <div className="flex items-center gap-6">
              <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                모집 학교
              </span>
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
                      disabled={recruitmentType === "REGULAR"}
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
            <Calendar
              year={calendarMonth.year}
              month={calendarMonth.month}
              onMonthChange={(year, month) => setCalendarMonth({ year, month })}
              highlightRanges={highlightRanges}
            />

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
                          updatePeriodField("finalResultPublishedAt", { time })
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
                    전체 모집이 종료된 이후에는 모집 기간을 변경 할 수 없습니다.
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
          onClick={handleTempSave}
        >
          임시 저장
        </Button>
        <Button
          type="button"
          variant="fill"
          color="primary"
          onClick={handleNext}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
