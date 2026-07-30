import { useNavigate } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/shared/ui/Button"
import { CounterLabel } from "@/shared/ui/CounterLabel"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  updateRecruitingRound,
  updateRecruitingRoundStatus,
} from "../../api/recruitingApi"
import { getRecruitableTracks } from "../../model/parts"
import {
  buildRecruitmentPreviewTitle,
  composeRecruitmentTitle,
  periodFieldToInstant,
} from "../../model/recruitmentCreate"
import { useRecruitmentCreateStore } from "../../model/useRecruitmentCreateStore"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

const ANNOUNCEMENT_MAX_LENGTH = 10000

type AnnouncementModalKind = "publishConfirm" | "complete"

function formatDocumentStartAtLabel(
  periodForm: { documentStartAt: { date: string; time: string } } | undefined,
): string {
  const { date, time } = periodForm?.documentStartAt ?? { date: "", time: "" }
  const [, month, day] = date.split("-")
  if (!month || !day) return "0월 0일 00:00"
  return `${Number(month)}월 ${Number(day)}일 ${time}`
}

interface RecruitmentAnnouncementFormProps {
  onPrev: () => void
  onDirtyChange?: (dirty: boolean) => void
}

export function RecruitmentAnnouncementForm({
  onPrev,
  onDirtyChange,
}: RecruitmentAnnouncementFormProps) {
  const navigate = useNavigate()
  const addToast = useToastStore((state) => state.addToast)
  const announcement = useRecruitmentCreateStore((s) => s.announcement)
  const setAnnouncement = useRecruitmentCreateStore((s) => s.setAnnouncement)
  const contactText = useRecruitmentCreateStore((s) => s.contactText)
  const basicInfo = useRecruitmentCreateStore((s) => s.basicInfo)
  const gisuGeneration = useRecruitmentCreateStore((s) => s.gisuGeneration)
  const enabledParts = useRecruitmentCreateStore((s) => s.enabledParts)
  const secondChoiceEnabled = useRecruitmentCreateStore(
    (s) => s.secondChoiceEnabled,
  )
  const seasonId = useRecruitmentCreateStore((s) => s.seasonId)
  const roundId = useRecruitmentCreateStore((s) => s.roundId)
  const previewTitle = buildRecruitmentPreviewTitle({
    ...basicInfo,
    gisuGeneration,
  })
  const documentStartAtLabel = formatDocumentStartAtLabel(basicInfo.periodForm)
  const [openModal, setOpenModal] = useState<AnnouncementModalKind | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showTempSaveModal, setShowTempSaveModal] = useState(false)
  const savedSnapshotRef = useRef(announcement)

  // 1단계(기본 정보)까지 완성됐는지는 chapter/school 여부로 판단한다.
  // roundId는 2단계(모집 문항)에서 Round 생성이 끝나야 채워지므로, 게시 전 필수 전제조건이다.
  const isSubmittable =
    announcement.trim() !== "" &&
    !!basicInfo.chapter &&
    !!basicInfo.school &&
    !!seasonId &&
    !!roundId
  const hasUnsavedChanges = savedSnapshotRef.current !== announcement
  const canTempSave = hasUnsavedChanges && !isSaving

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  const handleTempSave = () => {
    setIsSaving(true)
    // TODO: 실제 임시 저장 API 호출로 교체 (지금은 로딩 상태만 흉내)
    setTimeout(() => {
      savedSnapshotRef.current = announcement
      setIsSaving(false)
      setShowTempSaveModal(true)
    }, 600)
  }

  return (
    <div className="border-teal-gray-150 mt-6 flex flex-col gap-6 rounded-2xl border bg-white px-8 py-8.5">
      <RecruitmentSectionHeader index={4} title="모집 공고 작성" />

      <div className="flex flex-col items-start gap-4 self-stretch">
        <div className="text-heading-7-semibold flex items-start gap-2.5 self-stretch overflow-hidden px-4 py-1 text-teal-600">
          {previewTitle}
        </div>
        <div className="bg-teal-gray-50 flex flex-col items-end gap-4 self-stretch rounded-xl px-8 pt-6 pb-7.5">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            maxLength={ANNOUNCEMENT_MAX_LENGTH}
            placeholder="지원자들에게 안내될 공지글을 작성해주세요."
            className="text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 min-h-90 w-full resize-none self-stretch bg-transparent outline-none"
          />
          <CounterLabel
            current={announcement.length}
            total={ANNOUNCEMENT_MAX_LENGTH}
            size="sm"
            className="text-teal-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="weak"
          color="neutral"
          disabled={isPublished}
          onClick={onPrev}
        >
          이전
        </Button>
        <div className="flex items-center gap-3">
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
            disabled={!isSubmittable || isPublished}
            isLoading={isPublishing}
            onClick={() => setOpenModal("publishConfirm")}
          >
            {isPublished ? "모집 공고 완료" : "모집 공고 올리기"}
          </Button>
        </div>
      </div>

      <CtaModal
        open={openModal === "publishConfirm"}
        onOpenChange={(open) => {
          if (!open) setOpenModal(null)
        }}
        variant="success"
        title="모집 공고를 게시하겠습니까?"
        content={
          <>
            <span className="text-teal-600">{documentStartAtLabel}</span>
            부터 모든 지원자에게 공개됩니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="게시하기"
        onCancel={() => setOpenModal(null)}
        onConfirm={async () => {
          if (!seasonId || !roundId) return
          setOpenModal(null)
          setIsPublishing(true)
          try {
            // interviewRequired는 2단계 진입 시점에 이미 false로 고정된 상태로만
            // Round가 만들어졌으므로(면접 있는 모집은 그 전에 막힘) 여기서도 동일하게
            // false로 보낸다 — Round 생성(createRecruitingRound)과 대칭.
            await updateRecruitingRound(seasonId, roundId, {
              title: composeRecruitmentTitle(
                buildRecruitmentPreviewTitle({ ...basicInfo, gisuGeneration }),
                basicInfo.footer,
              ),
              recruitableTracks: getRecruitableTracks(enabledParts),
              secondChoiceEnabled,
              documentStartAt: periodFieldToInstant(
                basicInfo.periodForm.documentStartAt,
              ),
              documentEndAt: periodFieldToInstant(
                basicInfo.periodForm.documentEndAt,
              ),
              documentResultPublishedAt: periodFieldToInstant(
                basicInfo.periodForm.documentResultPublishedAt,
              ),
              finalResultPublishedAt: periodFieldToInstant(
                basicInfo.periodForm.finalResultPublishedAt,
              ),
              interviewRequired: false,
              announcement,
              contactText,
            })
            await updateRecruitingRoundStatus(seasonId, roundId, {
              status: "OPEN",
            })
            setIsPublished(true)
            savedSnapshotRef.current = announcement
            setOpenModal("complete")
          } catch (error) {
            const message = isAxiosError(error)
              ? (error.response?.data as { message?: string } | undefined)
                  ?.message
              : undefined
            addToast({
              message: message ?? "모집 공고 게시에 실패했습니다.",
              color: "red",
              variant: "deep",
              type: "default",
              duration: 3000,
            })
          } finally {
            setIsPublishing(false)
          }
        }}
      />

      <CtaModal
        open={openModal === "complete"}
        variant="success"
        title="모집 공고 게시 완료"
        content="지원자들에게 모집 공고 게시가 완료되었습니다."
        cancelText="돌아가기"
        confirmText="보러가기"
        cancelOnDismiss={false}
        onOpenChange={(open) => {
          if (!open) setOpenModal(null)
        }}
        onCancel={() => setOpenModal(null)}
        onConfirm={() => navigate({ to: "/recruiting/recruitments" })}
      />

      <CtaModal
        open={showTempSaveModal}
        onOpenChange={setShowTempSaveModal}
        variant="success"
        title="임시 저장 완료"
        content="임시저장이 완료되었습니다."
        confirmText="확인"
        onConfirm={() => navigate({ to: "/recruiting/recruitments" })}
      />
    </div>
  )
}
