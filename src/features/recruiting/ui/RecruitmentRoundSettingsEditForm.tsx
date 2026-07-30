import { useBlocker, useNavigate } from "@tanstack/react-router"
import { useRef, useState } from "react"

import { Button } from "@/shared/ui/Button"
import { CounterLabel } from "@/shared/ui/CounterLabel"
import { DateTextBox } from "@/shared/ui/date-text-box/DateTextBox"
import { TimeTextBox } from "@/shared/ui/date-text-box/TimeTextBox"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { InputBox } from "@/shared/ui/input/InputBox"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { useUpdateRecruitingRound } from "../hooks/useRecruitmentListMutations"
import { PART_KEY_TO_TRACK, PARTS } from "../model/parts"
import {
  periodFieldToInstant,
  type PeriodFieldValue,
} from "../model/recruitmentCreate"
import { RecruitmentSectionHeader } from "./RecruitmentSectionHeader"

import type {
  CreateRecruitingRoundInterviewFields,
  RecruitingRound,
  RecruitingTrack,
} from "../api/types"

const ANNOUNCEMENT_MAX_LENGTH = 10000
const TITLE_MAX_LENGTH = 100

function instantToPeriodField(iso: string | null): PeriodFieldValue {
  if (!iso) return { date: "", time: "" }
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function isPeriodFieldComplete(value: PeriodFieldValue): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) && /^\d{2}:\d{2}$/.test(value.time)
  )
}

// 면접 관련 값은 이 폼에서 편집하지 않는다(availability form 빌더 미구현이라
// 앱 전역에서 interviewRequired=false로 강제 중). 기존 값을 그대로 되돌려 보낸다.
// interviewRequired가 true인데 나머지 값이 비어있는 비정상 상태면, 그걸 조용히
// false로 낮춰버리지 않고 null을 반환해 저장 자체를 막는다.
function resolveInterviewFields(
  round: RecruitingRound,
): CreateRecruitingRoundInterviewFields | null {
  if (!round.interviewRequired) return { interviewRequired: false }
  if (
    round.interviewStartAt &&
    round.interviewEndAt &&
    round.availabilityFormId
  ) {
    return {
      interviewRequired: true,
      interviewStartAt: round.interviewStartAt,
      interviewEndAt: round.interviewEndAt,
      availabilityFormId: round.availabilityFormId,
    }
  }
  return null
}

interface RecruitmentRoundSettingsEditFormProps {
  seasonId: string
  roundId: string
  round: RecruitingRound
}

export function RecruitmentRoundSettingsEditForm({
  seasonId,
  roundId,
  round,
}: RecruitmentRoundSettingsEditFormProps) {
  const navigate = useNavigate()
  const addToast = useToastStore((state) => state.addToast)
  const updateRound = useUpdateRecruitingRound()
  const interviewFields = resolveInterviewFields(round)

  const [title, setTitle] = useState(round.title)
  const [enabledTracks, setEnabledTracks] = useState<Set<RecruitingTrack>>(
    () => new Set(round.recruitableTracks),
  )
  const [secondChoiceEnabled, setSecondChoiceEnabled] = useState(
    round.secondChoiceEnabled,
  )
  const [documentStartAt, setDocumentStartAt] = useState(
    instantToPeriodField(round.documentStartAt),
  )
  const [documentEndAt, setDocumentEndAt] = useState(
    instantToPeriodField(round.documentEndAt),
  )
  const [documentResultPublishedAt, setDocumentResultPublishedAt] = useState(
    instantToPeriodField(round.documentResultPublishedAt),
  )
  const [finalResultPublishedAt, setFinalResultPublishedAt] = useState(
    instantToPeriodField(round.finalResultPublishedAt),
  )
  const [announcement, setAnnouncement] = useState(round.announcement ?? "")
  const [contactText, setContactText] = useState(round.contactText ?? "")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const savedSnapshotRef = useRef(
    JSON.stringify({
      title,
      enabledTracks: [...enabledTracks].sort(),
      secondChoiceEnabled,
      documentStartAt,
      documentEndAt,
      documentResultPublishedAt,
      finalResultPublishedAt,
      announcement,
      contactText,
    }),
  )
  const currentSnapshot = JSON.stringify({
    title,
    enabledTracks: [...enabledTracks].sort(),
    secondChoiceEnabled,
    documentStartAt,
    documentEndAt,
    documentResultPublishedAt,
    finalResultPublishedAt,
    announcement,
    contactText,
  })
  const isDirty = !isSaved && savedSnapshotRef.current !== currentSnapshot

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

  const canSubmit =
    title.trim() !== "" &&
    title.length <= TITLE_MAX_LENGTH &&
    enabledTracks.size > 0 &&
    interviewFields !== null &&
    isPeriodFieldComplete(documentStartAt) &&
    isPeriodFieldComplete(documentEndAt) &&
    isPeriodFieldComplete(documentResultPublishedAt) &&
    isPeriodFieldComplete(finalResultPublishedAt)

  const toggleTrack = (track: RecruitingTrack, checked: boolean) => {
    setEnabledTracks((prev) => {
      const next = new Set(prev)
      if (checked) next.add(track)
      else next.delete(track)
      return next
    })
  }

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting || !interviewFields) return
    setIsSubmitting(true)
    try {
      await updateRound.mutateAsync({
        seasonId,
        roundId,
        payload: {
          title,
          recruitableTracks: [...enabledTracks],
          secondChoiceEnabled,
          documentStartAt: periodFieldToInstant(documentStartAt),
          documentEndAt: periodFieldToInstant(documentEndAt),
          documentResultPublishedAt: periodFieldToInstant(
            documentResultPublishedAt,
          ),
          finalResultPublishedAt: periodFieldToInstant(finalResultPublishedAt),
          announcement,
          contactText,
          ...interviewFields,
        },
      })
      addToast({
        message: "모집 설정이 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      setIsSaved(true)
      void navigate({ to: "/recruiting/recruitments" })
    } catch {
      // 실패 토스트는 useUpdateRecruitingRound의 onError가 표시한다.
    } finally {
      setIsSubmitting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="border-teal-gray-150 mt-6 flex flex-col gap-10 rounded-2xl border bg-white px-8 py-8.5">
      <div className="flex flex-col gap-6">
        <RecruitmentSectionHeader index={1} title="공고 제목" required />
        <InputBox
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX_LENGTH}
          placeholder="모집 제목을 입력하세요"
          className="w-full max-w-160"
        />
      </div>

      <div className="flex flex-col gap-6">
        <RecruitmentSectionHeader index={2} title="모집 대상 트랙" required />
        <div className="flex flex-wrap items-center gap-6 pl-8.5">
          {PARTS.map((part) => {
            const track = PART_KEY_TO_TRACK[part.key]
            return (
              <label
                key={part.key}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={enabledTracks.has(track)}
                  onChange={(checked) => toggleTrack(track, checked)}
                  variant="primary"
                  aria-label={`${part.label} 모집`}
                />
                <span className="text-body-1-medium text-teal-gray-700">
                  {part.label}
                </span>
              </label>
            )
          })}
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={secondChoiceEnabled}
              onChange={setSecondChoiceEnabled}
              variant="primary"
              aria-label="2지망 지원 허용"
            />
            <span className="text-body-1-medium text-teal-gray-700">
              2지망 지원 허용
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <RecruitmentSectionHeader index={3} title="모집 기간" required />
        <div className="flex flex-col gap-7 pl-8.5">
          <div className="flex flex-col gap-2">
            <span className="text-subtitle-3-semibold text-teal-600">
              서류 접수 기간
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <DateTextBox
                  label="시작"
                  value={documentStartAt.date}
                  onChange={(date) =>
                    setDocumentStartAt((prev) => ({ ...prev, date }))
                  }
                />
                <TimeTextBox
                  value={documentStartAt.time}
                  onChange={(time) =>
                    setDocumentStartAt((prev) => ({ ...prev, time }))
                  }
                />
              </div>
              <span className="text-teal-gray-400">~</span>
              <div className="flex items-center gap-1.5">
                <DateTextBox
                  label="종료"
                  value={documentEndAt.date}
                  onChange={(date) =>
                    setDocumentEndAt((prev) => ({ ...prev, date }))
                  }
                />
                <TimeTextBox
                  value={documentEndAt.time}
                  onChange={(time) =>
                    setDocumentEndAt((prev) => ({ ...prev, time }))
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
                value={documentResultPublishedAt.date}
                onChange={(date) =>
                  setDocumentResultPublishedAt((prev) => ({ ...prev, date }))
                }
              />
              <TimeTextBox
                value={documentResultPublishedAt.time}
                onChange={(time) =>
                  setDocumentResultPublishedAt((prev) => ({ ...prev, time }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-subtitle-3-semibold text-teal-600">
              최종 결과 발표
            </span>
            <div className="flex items-center gap-1.5">
              <DateTextBox
                label="시작"
                value={finalResultPublishedAt.date}
                onChange={(date) =>
                  setFinalResultPublishedAt((prev) => ({ ...prev, date }))
                }
              />
              <TimeTextBox
                value={finalResultPublishedAt.time}
                onChange={(time) =>
                  setFinalResultPublishedAt((prev) => ({ ...prev, time }))
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <RecruitmentSectionHeader index={4} title="모집 공고" />
        <div className="bg-teal-gray-50 flex flex-col items-end gap-4 rounded-xl px-8 pt-6 pb-7.5">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            maxLength={ANNOUNCEMENT_MAX_LENGTH}
            placeholder="지원자들에게 안내될 공지글을 작성해주세요."
            className="text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 min-h-40 w-full resize-none self-stretch bg-transparent outline-none"
          />
          <CounterLabel
            current={announcement.length}
            total={ANNOUNCEMENT_MAX_LENGTH}
            size="sm"
            className="text-teal-gray-400"
          />
        </div>
        <InputBox
          value={contactText}
          onChange={(e) => setContactText(e.target.value)}
          placeholder="문의 연락처를 입력하세요 (선택)"
          className="w-full max-w-160"
        />
      </div>

      {interviewFields === null && (
        <p className="text-body-2-medium text-red-500">
          이 모집의 면접 설정 값이 올바르지 않아 저장할 수 없습니다. 운영진에게
          문의해 주세요.
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          onClick={() => navigate({ to: "/recruiting/recruitments" })}
        >
          취소
        </Button>
        <Button
          type="button"
          variant="fill"
          color="primary"
          disabled={!canSubmit}
          isLoading={isSubmitting}
          onClick={() => setConfirmOpen(true)}
        >
          저장하기
        </Button>
      </div>

      <CtaModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="success"
        title="변경 사항을 저장할까요?"
        content="이미 공개된 모집 공고의 설정이 변경됩니다."
        cancelText="돌아가기"
        confirmText="저장하기"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
      />

      <CtaModal
        open={isLeaveModalOpen}
        onOpenChange={(open) => {
          if (!open) resetLeave?.()
        }}
        variant="warning"
        title="페이지 이탈"
        content={
          <>
            변경한 내용이 저장되지 않습니다.
            <br />
            나가시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="나가기"
        onCancel={() => resetLeave?.()}
        onConfirm={() => proceedLeave?.()}
      />
    </div>
  )
}
