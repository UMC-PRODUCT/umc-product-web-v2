import { createFileRoute, useBlocker } from "@tanstack/react-router"
import { useState } from "react"

import {
  type Branch,
  type MatchingType,
  MOCK_ROUND_SCHEDULES,
  type RoundSchedule,
} from "@/features/matching/model/matchingRoundMock"
import { BranchSelector } from "@/features/matching/ui/BranchSelector"
import { Calendar } from "@/features/matching/ui/Calendar"
import { CalendarScheduleList } from "@/features/matching/ui/CalendarScheduleList"
import { MatchingTypeSelector } from "@/features/matching/ui/MatchingTypeSelector"
import { RoundForm } from "@/features/matching/ui/RoundForm"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

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

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function MatchingRoundsPage() {
  const [matchingType, setMatchingType] =
    useState<MatchingType>("Plan-Design 매칭")
  const [selectedBranch, setSelectedBranch] = useState<Branch>("Chromium")
  const [rounds, setRounds] = useState<RoundSchedule[]>(MOCK_ROUND_SCHEDULES)

  const isRoundExpired = (round: RoundSchedule) => {
    const end = parseDate(round.endDate)
    if (!end) return false
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return end < now
  }

  const firstActiveIdx = rounds.findIndex((r) => !isRoundExpired(r))
  const selectedRoundIdx =
    firstActiveIdx === -1 ? rounds.length - 1 : firstActiveIdx
  const [pickingEnd, setPickingEnd] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "loading" | "completed">(
    "idle",
  )
  const [showSaveModal, setShowSaveModal] = useState(false)

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

  const selectedRound = rounds[selectedRoundIdx]!

  const highlightRange = (() => {
    const start = parseDate(selectedRound.startDate)
    const end = parseDate(selectedRound.endDate)
    if (!start || !end) return null
    return { start, end }
  })()

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

  const handleSave = () => {
    setSaveState("loading")
    // TODO: API 호출
    setTimeout(() => {
      setSaveState("completed")
      setIsDirty(false)
      setShowSaveModal(true)
    }, 1500)
  }

  const saveButtonText =
    saveState === "completed" ? "저장 완료" : isDirty ? "수정하기" : "저장하기"
  const saveButtonDisabled = !isDirty || saveState === "completed"

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateStr(date)
    if (!pickingEnd) {
      updateRound(selectedRoundIdx, "startDate", dateStr)
      updateRound(selectedRoundIdx, "endDate", dateStr)
      setPickingEnd(true)
    } else {
      const startDate = parseDate(selectedRound.startDate)
      if (startDate && date >= startDate) {
        updateRound(selectedRoundIdx, "endDate", dateStr)
      } else {
        updateRound(selectedRoundIdx, "startDate", dateStr)
        updateRound(selectedRoundIdx, "endDate", dateStr)
      }
      setPickingEnd(false)
    }
  }

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
          <MatchingTypeSelector
            selected={matchingType}
            onChange={setMatchingType}
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
                      onChange={setSelectedBranch}
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
                      onDateClick={handleDateClick}
                      className="border-0 bg-transparent"
                    />

                    <div className="flex flex-col gap-2">
                      {rounds.map((round, idx) => (
                        <CalendarScheduleList
                          key={round.roundLabel}
                          roundLabel={round.roundLabel}
                          title={round.title}
                          startDate={round.startDate}
                          startTime={round.startTime}
                          endTime={round.endTime}
                          state={
                            isRoundExpired(round)
                              ? "disabled"
                              : idx === firstActiveIdx
                                ? "active"
                                : "default"
                          }
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
