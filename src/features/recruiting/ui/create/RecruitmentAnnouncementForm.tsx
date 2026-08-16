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
  buildRoundConfigurationPayload,
  composeRecruitmentTitle,
} from "../../model/recruitmentCreate"
import { useRecruitmentCreateStore } from "../../model/useRecruitmentCreateStore"
import { RecruitmentSectionHeader } from "../RecruitmentSectionHeader"

const ANNOUNCEMENT_MAX_LENGTH = 10000

type AnnouncementModalKind = "publishConfirm" | "complete"

// 게시 확인 모달 안내용. 게시 버튼을 누르면 서류 접수 시작일과 무관하게
// updateRecruitingRoundStatus로 즉시 OPEN 처리되므로, "지금부터 공개됩니다"를
// 뜻하는 현재 시각을 보여준다.
function formatNowLabel(now: Date = new Date()): string {
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${month}월 ${day}일 ${hours}:${minutes}`
}

interface RecruitmentAnnouncementFormProps {
  onPrev: () => void
  onDirtyChange?: (dirty: boolean) => void
  // 게시가 끝나면 상위(RecruitmentCreatePage)가 페이지 이탈 확인 모달을 더 이상
  // 띄우지 않도록 알려준다. dirty 상태만으로는 막을 수 없다 — 1·2단계에서
  // "다음"으로 넘어온 스냅샷이 남아있으면 게시 후에도 여전히 dirty로 보인다.
  onPublished?: () => void
  // 이미 OPEN인 라운드를 이 마법사로 불러와 수정하는 경우. "게시하겠습니까?"
  // 확인 절차는 아직 공개 안 된 라운드에만 의미가 있으므로, 이미 공개된
  // 라운드는 게시 버튼을 숨기고 "임시 저장" 버튼 하나만으로 그 자리에서 갱신한다.
  isAlreadyPublished?: boolean
}

export function RecruitmentAnnouncementForm({
  onPrev,
  onDirtyChange,
  onPublished,
  isAlreadyPublished = false,
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
  const canTempSave = hasUnsavedChanges && !isSaving && !!seasonId && !!roundId

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges)
  }, [hasUnsavedChanges, onDirtyChange])

  // Round PUT은 완전 교체라 recruitableTracks/기간 등 필수 필드를 스토어의
  // 최신 값으로 매번 전부 채워 보내야 한다(announcement만 담아 보내면 400).
  // interviewRequired도 1단계에서 고른 값을 그대로 보내야 한다 — 여기서 false로
  // 고정하면 1·2단계에서 설정한 면접 여부·기간이 게시 시점에 사라진다.
  const buildRoundUpdatePayload = () =>
    buildRoundConfigurationPayload({
      title: composeRecruitmentTitle(previewTitle, basicInfo.footer),
      recruitableTracks: getRecruitableTracks(enabledParts),
      secondChoiceEnabled,
      periodForm: basicInfo.periodForm,
      interviewRequired: basicInfo.interviewRequired,
      announcement,
      contactText,
    })

  const handleTempSave = async () => {
    if (isSaving || !seasonId || !roundId) return
    setIsSaving(true)
    try {
      await updateRecruitingRound(seasonId, roundId, buildRoundUpdatePayload())
      savedSnapshotRef.current = announcement
      // 수정(OPEN 라운드) 경로는 "저장하기"가 이 화면에서의 마지막 동작이라 —
      // DRAFT 이어쓰기의 "임시 저장"과 달리 계속 편집을 이어갈 필요가 없다.
      // onPublished로 이탈 차단부터 풀어야, 뒤이은 navigate가 페이지 이탈
      // 확인 모달에 가로막히지 않는다.
      if (isAlreadyPublished) {
        onPublished?.()
        addToast({
          message: "모집 공고가 수정되었습니다.",
          color: "primary",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        navigate({ to: "/recruiting/recruitments" })
        return
      }
      setShowTempSaveModal(true)
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined
      addToast({
        message: message ?? "임시 저장에 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
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
            variant={isAlreadyPublished ? "fill" : "weak"}
            color="primary"
            disabled={!canTempSave}
            isLoading={isSaving}
            onClick={handleTempSave}
          >
            {isAlreadyPublished ? "저장하기" : "임시 저장"}
          </Button>
          {!isAlreadyPublished && (
            <Button
              type="button"
              variant="fill"
              color="primary"
              disabled={!isSubmittable || isPublished}
              isLoading={isPublishing}
              onClick={() => setOpenModal("publishConfirm")}
            >
              {isPublished ? "모집 공고 완료" : "모집 공고 게시"}
            </Button>
          )}
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
            <span className="text-teal-600">{formatNowLabel()}</span>
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
            await updateRecruitingRound(
              seasonId,
              roundId,
              buildRoundUpdatePayload(),
            )
            await updateRecruitingRoundStatus(seasonId, roundId, {
              status: "OPEN",
            })
            setIsPublished(true)
            savedSnapshotRef.current = announcement
            setOpenModal("complete")
            onPublished?.()
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
        onConfirm={() => setShowTempSaveModal(false)}
      />
    </div>
  )
}
