import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useBlocker } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  createMatchingRound,
  getMatchingRounds,
  updateMatchingRound,
} from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { useChapters } from "@/features/application/hooks/useApplicationPageData"
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
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"

export const Route = createFileRoute("/matching/rounds")({
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

function MatchingRoundsPage() {
  const [matchingType, setMatchingType] =
    useState<MatchingType>("Plan-Develop 매칭")
  const [selectedBranch, setSelectedBranch] = useState<Branch>("Chromium")
  const [rounds, setRounds] = useState<RoundSchedule[]>(
    emptyRoundSchedules(matchingType),
  )
  const [isDirty, setIsDirty] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "loading" | "completed">(
    "idle",
  )
  const [showSaveModal, setShowSaveModal] = useState(false)

  const queryClient = useQueryClient()

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
      setRounds(emptyRoundSchedules(matchingType))
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
            startTime: "00:00",
            endTime: "23:59",
          }
        )
      })
      setRounds(result)
    }
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

  // 모든 라운드의 날짜 범위를 합쳐서 하이라이트
  const highlightRanges = useMemo(() => {
    return rounds
      .map((r) => {
        const start = parseDate(r.startDate)
        const end = parseDate(r.endDate)
        if (!start || !end) return null
        return { start, end }
      })
      .filter(Boolean) as { start: Date; end: Date }[]
  }, [rounds])

  const updateRound = (
    idx: number,
    field: keyof RoundSchedule,
    value: string,
  ) => {
    setRounds((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    )
    setIsDirty(true)
    if (saveState === "completed") setSaveState("idle")
  }

  // 저장 mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (chapterId === undefined) throw new Error("지부를 선택해주세요.")
      const promises = rounds.map((round) => {
        // 날짜가 비어있으면 스킵
        if (!round.startDate || !round.endDate) return Promise.resolve()

        const startsAt = toISODatetime(round.startDate, round.startTime)
        const endsAt = toISODatetime(round.endDate, round.endTime)
        // decisionDeadline: endsAt 이후여야 하므로 +1초
        const dlDt = new Date(endsAt)
        dlDt.setSeconds(dlDt.getSeconds() + 1)
        const decisionDeadline = dlDt.toISOString()

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
          chapterId,
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
    onError: () => {
      setSaveState("idle")
    },
  })

  const handleSave = () => {
    setSaveState("loading")
    saveMutation.mutate()
  }

  const saveButtonText =
    saveState === "completed" ? "저장 완료" : isDirty ? "수정하기" : "저장하기"
  const saveButtonDisabled = !isDirty || saveState === "completed"

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
            className="w-[734px]"
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
                      highlightRanges={highlightRanges}
                      className="border-0 bg-transparent"
                    />

                    <div className="flex flex-col gap-2">
                      {rounds.map((round) => (
                        <CalendarScheduleList
                          key={round.roundLabel}
                          roundLabel={round.roundLabel}
                          title={round.title}
                          startDate={round.startDate}
                          startTime={round.startTime}
                          endTime={round.endTime}
                          state={round.startDate ? "default" : "disabled"}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 우측: 차수 폼 */}
                <div className="flex flex-1 flex-col gap-10 py-7 pl-8">
                  {rounds.map((round, idx) => (
                    <RoundForm
                      key={round.roundLabel}
                      title={round.title}
                      startDate={round.startDate}
                      endDate={round.endDate}
                      startTime={round.startTime}
                      endTime={round.endTime}
                      onStartDateChange={(v) =>
                        updateRound(idx, "startDate", v)
                      }
                      onEndDateChange={(v) => updateRound(idx, "endDate", v)}
                      onStartTimeChange={(v) =>
                        updateRound(idx, "startTime", v)
                      }
                      onEndTimeChange={(v) => updateRound(idx, "endTime", v)}
                    />
                  ))}
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
