import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect, useBlocker } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { Tooltip } from "@/components/tooltip/Tooltip"
import {
  createMatchingRound,
  getMatchingRounds,
  updateMatchingRound,
} from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { useChapters } from "@/features/application/hooks/useApplicationPageData"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isOperator } from "@/features/auth/model/identity"
import {
  type Branch,
  emptyRoundSchedules,
  MATCHING_TYPES,
  type MatchingType,
  PHASES,
  type RoundSchedule,
  toISODatetime,
  toRoundSchedule,
  toServerMatchingType,
} from "@/features/matching/model/matchingRoundMock"
import { BranchSelector } from "@/features/matching/ui/BranchSelector"
import { Calendar } from "@/features/matching/ui/Calendar"
import { CalendarScheduleList } from "@/features/matching/ui/CalendarScheduleList"
import { RoundForm } from "@/features/matching/ui/RoundForm"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

import type { AxiosError } from "axios"

export const Route = createFileRoute("/matching/rounds")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!isOperator(me)) throw redirect({ to: "/" })
  },
  component: MatchingRoundsPage,
})

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split("-")
  if (parts.length !== 3) return null
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return new Date(y, m - 1, d)
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const MAX_ROUND_DAYS = 3

function getRoundState(
  round: RoundSchedule,
): "active" | "default" | "disabled" {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!datePattern.test(round.startDate) || !datePattern.test(round.endDate))
    return "default"
  const now = new Date()
  const start = new Date(`${round.startDate}T${round.startTime}:00`)
  const end = new Date(`${round.endDate}T${round.endTime}:00`)
  if (end < now) return "disabled" // 완료
  if (start <= now) return "active" // 진행중
  return "default" // 예정
}

function MatchingRoundsPage() {
  const [matchingType, setMatchingType] =
    useState<MatchingType>("Plan-Develop 매칭")
  const [selectedBranch, setSelectedBranch] = useState<Branch>("Chromium")
  const [rounds, setRounds] = useState<RoundSchedule[]>(
    emptyRoundSchedules(matchingType),
  )
  // CalendarScheduleList용: POST/PATCH 완료 후에만 갱신
  const [committedRounds, setCommittedRounds] = useState<RoundSchedule[]>(
    emptyRoundSchedules(matchingType),
  )
  const [isDirty, setIsDirty] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "loading" | "completed">(
    "idle",
  )
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [roundErrors, setRoundErrors] = useState(() =>
    PHASES.map(() => ({ startDate: false, endDate: false })),
  )
  const roundFormRefs = useRef<(HTMLDivElement | null)[]>([])

  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)

  // 지부 목록 조회 -> branch name -> chapterId 매핑
  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  const chapterId = useMemo(() => {
    const found = chapters.find((c) => c.name === selectedBranch)
    return found ? Number(found.id) : undefined
  }, [selectedBranch, chapters])

  // 매칭 차수 목록 조회
  const roundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
    enabled: chapterId !== undefined,
  })

  // 서버 데이터 -> 선택된 매칭 타입 필터링 -> RoundSchedule 변환
  const serverType = toServerMatchingType(matchingType)

  const syncRoundsFromServer = useCallback(() => {
    const allRounds = roundsQuery.data ?? []
    const filtered = allRounds.filter((r) => r.type === serverType)
    if (filtered.length === 0) {
      const empty = emptyRoundSchedules(matchingType)
      setRounds(empty)
      setCommittedRounds(empty)
    } else {
      // phase 순서대로 정렬
      const phaseOrder = { FIRST: 0, SECOND: 1, THIRD: 2 }
      const sorted = [...filtered].sort(
        (a, b) => (phaseOrder[a.phase] ?? 0) - (phaseOrder[b.phase] ?? 0),
      )
      const mapped = sorted.map(toRoundSchedule)
      // 누락된 phase 채우기
      const result: RoundSchedule[] = PHASES.map((phase) => {
        const existing = mapped.find((r) => r.phase === phase)
        return (
          existing ?? {
            phase,
            roundLabel:
              phase === "FIRST" ? "1차" : phase === "SECOND" ? "2차" : "3차",
            title: matchingType,
            startDate: "",
            endDate: "",
            startTime: phase === "FIRST" ? "00:00" : "12:00",
            endTime: "23:59",
          }
        )
      })
      setRounds(result)
      setCommittedRounds(result)
    }
    setRoundErrors(PHASES.map(() => ({ startDate: false, endDate: false })))
    setIsDirty(false)
    setSaveState("idle")
  }, [roundsQuery.data, serverType, matchingType])

  // 서버 데이터 변경 시 로컬 동기화
  useEffect(() => {
    syncRoundsFromServer()
  }, [syncRoundsFromServer])

  // 매칭 타입 변경 시 dirty 초기화
  const handleMatchingTypeChange = (type: MatchingType) => {
    setMatchingType(type)
    setIsDirty(false)
    setSaveState("idle")
  }

  // 지부 변경 시 dirty 초기화
  const handleBranchChange = (branch: Branch) => {
    setSelectedBranch(branch)
    setIsDirty(false)
    setSaveState("idle")
  }

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveBlockStatus,
  } = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  })

  const isLeaveModalOpen = leaveBlockStatus === "blocked"

  // 1차 시작일 ~ 3차 종료일을 잇는 단일 하이라이트
  const highlightRange = useMemo(() => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    const starts = rounds
      .map((r) =>
        datePattern.test(r.startDate) ? parseDate(r.startDate) : null,
      )
      .filter(Boolean) as Date[]
    const ends = rounds
      .map((r) => (datePattern.test(r.endDate) ? parseDate(r.endDate) : null))
      .filter(Boolean) as Date[]
    if (starts.length === 0 || ends.length === 0) return null
    const minStart = new Date(Math.min(...starts.map((d) => d.getTime())))
    const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())))
    return { start: minStart, end: maxEnd }
  }, [rounds])

  // REVIEW: 1차 매칭 시작 후에는 차수 기간을 변경할 수 없음 - 서버 스펙 확정 후 재검토
  const isFirstRoundStarted = useMemo(() => {
    const first = rounds[0]
    if (!first) return false
    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(first.startDate)) return false
    const start = new Date(`${first.startDate}T${first.startTime}:00`)
    return start <= new Date()
  }, [rounds])

  const updateRound = (
    idx: number,
    field: keyof RoundSchedule,
    value: string,
  ) => {
    // Case 4: 클램프 여부 미리 계산 (state updater 밖에서 toast 호출)
    let willClamp = false
    if (field === "startDate" || field === "endDate") {
      const current = rounds[idx]
      if (!current) return
      const startDate = field === "startDate" ? value : current.startDate
      const endDate = field === "endDate" ? value : current.endDate
      const start = parseDate(startDate)
      const end = parseDate(endDate)
      if (start && end) {
        const diffDays =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays > MAX_ROUND_DAYS) willClamp = true
      }
    }

    setRounds((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r
        const updated = { ...r, [field]: value }
        // 단일 차수 최대 3일 제한: startDate 또는 endDate 변경 시 클램프
        if (field === "startDate" || field === "endDate") {
          const start = parseDate(updated.startDate)
          const end = parseDate(updated.endDate)
          if (start && end) {
            const diffDays =
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            if (diffDays > MAX_ROUND_DAYS) {
              const clamped = new Date(start)
              clamped.setDate(clamped.getDate() + MAX_ROUND_DAYS)
              updated.endDate = formatDate(clamped)
            }
          }
        }
        return updated
      }),
    )

    if (willClamp) {
      addToast({
        message: "하나의 매칭 기간은 3일을 넘어갈 수 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }

    if (field === "startDate" || field === "endDate") {
      setRoundErrors((prev) =>
        prev.map((e, i) => (i === idx ? { ...e, [field]: false } : e)),
      )
    }
    setIsDirty(true)
    if (saveState === "completed") setSaveState("idle")
  }

  // 저장 mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = rounds.map((round) => {
        // 날짜가 비어있으면 스킵
        if (!round.startDate || !round.endDate) return Promise.resolve()

        const startsAt = toISODatetime(round.startDate, round.startTime)
        const endsAt = toISODatetime(round.endDate, round.endTime)
        // decisionDeadline: endsAt 이후여야 하므로 +1ms
        const decisionDeadline = new Date(
          new Date(endsAt).getTime() + 1,
        ).toISOString()

        if (round.id) {
          // 기존 라운드 수정
          return updateMatchingRound(round.id, {
            startsAt,
            endsAt,
            decisionDeadline,
          })
        }
        // 신규 라운드 생성
        return createMatchingRound({
          name: `${round.roundLabel} ${matchingType}`,
          type: serverType,
          phase: round.phase,
          chapterId: chapterId!,
          startsAt,
          endsAt,
          decisionDeadline,
        })
      })
      await Promise.all(promises)
    },
    onSuccess: () => {
      setSaveState("completed")
      setIsDirty(false)
      setShowSaveModal(true)
      queryClient.invalidateQueries({
        queryKey: applicationKeys.matchingRounds(chapterId),
      })
    },
    onError: (error) => {
      setSaveState("idle")
      if ((error as AxiosError).response?.status === 401) {
        addToast({
          message: "권한이 없습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    },
  })

  const handleSave = () => {
    // Case 1: 지부 미선택
    if (chapterId === undefined) {
      addToast({
        message: "다른 지부의 매칭 일정은 설정할 수 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    const filledRounds = rounds.filter((r) => r.startDate || r.endDate)

    // Case 3: startDate/endDate 중 하나만 입력된 경우 → 인라인 에러 + 스크롤
    const errors = rounds.map((r) => ({
      startDate: !r.startDate && !!r.endDate,
      endDate: !!r.startDate && !r.endDate,
    }))
    const firstErrorIdx = errors.findIndex((e) => e.startDate || e.endDate)
    if (firstErrorIdx !== -1) {
      setRoundErrors(errors)
      roundFormRefs.current[firstErrorIdx]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
      addToast({
        message: "모든 일정을 입력해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    // Case 2: 종료 일시 < 시작 일시
    const hasInvalidRange = filledRounds.some((r) => {
      if (!r.startDate || !r.endDate) return false
      const start = new Date(`${r.startDate}T${r.startTime}:00`)
      const end = new Date(`${r.endDate}T${r.endTime}:00`)
      return end < start
    })
    if (hasInvalidRange) {
      addToast({
        message: "종료 일시는 시작 일시 이후로 설정해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    // Case 5: n+1차 시작일이 n차 시작일보다 앞서는 경우
    // TODO: 서버 수정되면 로직 보고 수정해야 함
    const filledWithStart = rounds.filter((r) => r.startDate)
    for (let i = 1; i < filledWithStart.length; i++) {
      const prev = parseDate(filledWithStart[i - 1]!.startDate)
      const curr = parseDate(filledWithStart[i]!.startDate)
      if (prev && curr && curr < prev) {
        addToast({
          message: "매칭 차수 순서에 맞게 일정을 설정해 주세요.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
    }

    setSaveState("loading")
    saveMutation.mutate()
  }

  const saveButtonText =
    saveState === "completed" ? "저장 완료" : isDirty ? "수정하기" : "저장하기"
  const saveButtonDisabled =
    !isDirty || saveState === "completed" || isFirstRoundStarted

  return (
    <section className="flex w-full flex-col gap-6 pt-10">
      {/* 화이트 카드 */}
      <div className="border-teal-gray-100 flex w-272.5 flex-col gap-6 rounded-xl border bg-white p-8">
        {/* 타이틀 */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            매칭 차수 설정
          </h1>
          <p className="text-body-2-regular text-teal-gray-600">
            지부별 세부 매칭 기간을 설정합니다.
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-col gap-11.5">
          {/* 매칭 타입 선택 */}
          <SegmentButton
            items={MATCHING_TYPES.map((t) => ({
              value: t,
              label: t,
              disabled: t === "Plan-Design 매칭",
            }))}
            value={matchingType}
            onValueChange={(v) => handleMatchingTypeChange(v as MatchingType)}
            className="w-183.5"
            itemClassName="flex-1"
          />

          {/* 01 매칭 기간 설정 */}
          <div className="flex flex-col gap-8">
            {/* 섹션 콘텐츠 */}
            <div className="flex flex-col gap-8.5 pl-4">
              {/* 헤딩 + 지부 선택 */}
              <div className="flex flex-col gap-4">
                <h2 className="text-heading-6-semibold text-teal-700">
                  <span className="text-teal-600">01</span> 매칭 기간 설정
                </h2>
                <div className="pl-8.5">
                  <div className="flex items-center gap-6">
                    <span className="text-label-1-semibold text-teal-gray-700">
                      지부 선택
                    </span>
                    <BranchSelector
                      selected={selectedBranch}
                      onChange={handleBranchChange}
                    />
                  </div>
                </div>
              </div>

              {/* 캘린더 + 차수 폼 2단 */}
              <div className="flex">
                {/* 좌측: 캘린더 + 스케줄 리스트 */}
                <div className="ml-4 w-101 shrink-0">
                  <div className="border-teal-gray-100 flex flex-col gap-5 rounded-2xl border bg-white px-3 pt-2 pb-3 drop-shadow-[0px_4px_8px_rgba(239,240,240,0.3)]">
                    <Calendar
                      highlightRange={highlightRange}
                      className="border-0 bg-transparent"
                    />

                    <div className="flex flex-col gap-2">
                      {committedRounds.map((round) => (
                        <CalendarScheduleList
                          key={round.roundLabel}
                          roundLabel={round.roundLabel}
                          title={round.title}
                          startDate={round.startDate}
                          startTime={round.startTime}
                          endTime={round.endTime}
                          state={getRoundState(round)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 우측: 차수 폼 */}
                <div className="flex flex-1 flex-col gap-10 py-7 pl-8">
                  {rounds.map((round, idx) => (
                    <div
                      key={round.roundLabel}
                      ref={(el) => {
                        roundFormRefs.current[idx] = el
                      }}
                    >
                      <RoundForm
                        title={`${round.roundLabel} 매칭`}
                        startDate={round.startDate}
                        endDate={round.endDate}
                        startTime={round.startTime}
                        endTime={round.endTime}
                        disabled={isFirstRoundStarted}
                        startDateError={roundErrors[idx]?.startDate}
                        endDateError={roundErrors[idx]?.endDate}
                        onStartDateChange={(v) =>
                          updateRound(idx, "startDate", v)
                        }
                        onEndDateChange={(v) => updateRound(idx, "endDate", v)}
                        onStartTimeChange={(v) =>
                          updateRound(idx, "startTime", v)
                        }
                        onEndTimeChange={(v) => updateRound(idx, "endTime", v)}
                      />
                    </div>
                  ))}

                  {/* 툴팁: 매칭 차수 기간 설정 안내 */}
                  <Tooltip
                    content={
                      <div className="text-left">
                        <p className="text-caption-2-medium font-bold text-teal-600">
                          매칭 차수 기간 설정
                        </p>
                        <p className="text-caption-2-regular text-teal-gray-600">
                          1차 매칭 시작 후에는 차수 기간을 변경할 수 없습니다.
                        </p>
                      </div>
                    }
                    size="big"
                    dark={false}
                    side="right"
                    sideOffset={8}
                    className="h-13! w-69!"
                    triggerClassName="self-start -mt-6"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-center p-0.75"
                      aria-label="매칭 차수 기간 설정 안내"
                    >
                      <InfoCircleIcon className="text-teal-gray-400 h-5 w-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="weak"
                color="neutral"
                size="lg"
                onClick={() => window.history.back()}
              >
                취소하기
              </Button>
              <Button
                variant="fill"
                color="primary"
                size="lg"
                disabled={saveButtonDisabled}
                isLoading={saveState === "loading"}
                onClick={handleSave}
              >
                {saveButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 완료 모달 */}
      <CtaModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        variant="success"
        title="저장 완료"
        content="매칭 설정이 완료되었습니다."
        confirmText="확인"
        onConfirm={() => setShowSaveModal(false)}
      />

      {/* 페이지 이탈 모달 */}
      <CtaModal
        open={isLeaveModalOpen}
        onOpenChange={(open) => {
          if (!open) resetLeave?.()
        }}
        variant="warning"
        title="페이지 이탈"
        content={
          <>
            작성 중인 내용이 저장되지 않습니다.
            <br />
            나가시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="나가기"
        onCancel={() => resetLeave?.()}
        onConfirm={() => proceedLeave?.()}
      />
    </section>
  )
}
