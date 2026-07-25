import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/shared/ui/Button"
import { CounterLabel } from "@/shared/ui/CounterLabel"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { RecruitmentSectionHeader } from "../.."

const ANNOUNCEMENT_MAX_LENGTH = 10000

// TODO: 1단계(기본 정보)에서 선택한 학교·기수·모집 유형을 상위에서 내려받아 채우기.
// 지금은 단계 간 상태 공유가 아직 없어 예시 값으로 대신한다.
const PREVIEW_TITLE_MOCK = "한양대학교 ERICA UMC 11기 정규 모집"
// TODO: 1단계에서 입력한 서류 접수 시작일시로 교체.
const DOCUMENT_START_AT_MOCK = "10월 20일 07:25"

type AnnouncementModalKind = "publishConfirm" | "complete"

interface RecruitmentAnnouncementFormProps {
  onPrev: () => void
  onDirtyChange?: (dirty: boolean) => void
}

export function RecruitmentAnnouncementForm({
  onPrev,
  onDirtyChange,
}: RecruitmentAnnouncementFormProps) {
  const navigate = useNavigate()
  const [announcement, setAnnouncement] = useState("")
  const [openModal, setOpenModal] = useState<AnnouncementModalKind | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showTempSaveModal, setShowTempSaveModal] = useState(false)
  const savedSnapshotRef = useRef(announcement)

  // TODO: 1단계에서 제목(학교·기수·모집 유형)까지 완성됐는지도 함께 검사해야 함.
  // 지금은 이 화면이 아는 값이 공지글 본문뿐이라 본문 작성 여부만으로 판단
  const isSubmittable = announcement.trim() !== ""
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
          {PREVIEW_TITLE_MOCK}
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
        <Button type="button" variant="weak" color="neutral" onClick={onPrev}>
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
            <span className="text-teal-600">{DOCUMENT_START_AT_MOCK}</span>
            부터 모든 지원자에게 공개됩니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="게시하기"
        onCancel={() => setOpenModal(null)}
        onConfirm={() => {
          setOpenModal(null)
          setIsPublishing(true)
          // TODO: 실제 등록 API 연동
          setTimeout(() => {
            setIsPublishing(false)
            setIsPublished(true)
            setOpenModal("complete")
          }, 600)
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
