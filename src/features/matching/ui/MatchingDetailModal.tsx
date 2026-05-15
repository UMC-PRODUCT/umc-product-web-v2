import { useState } from "react"

import { ModalFormPanel } from "@/features/application/ui/detail-modal/ModalFormPanel"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import {
  MOCK_MATCHING_APPLICANTS,
  MOCK_MATCHING_FORM_DATA,
} from "../model/matchingFormMock"

interface MatchingDetailModalProps {
  applicantId: string | null
  projectId?: number
  memberId?: number
  chapterName: string
  projectName: string
  challengerName: string
  challengerUniversity: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditable?: boolean
  onConfirmUnmatch?: () => void
}

export function MatchingDetailModal({
  applicantId,
  projectId: _projectId,
  memberId: _memberId,
  chapterName,
  projectName,
  challengerName,
  challengerUniversity,
  open,
  onOpenChange,
  isEditable = false,
  onConfirmUnmatch,
}: MatchingDetailModalProps) {
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false)

  const applicant = applicantId ? MOCK_MATCHING_APPLICANTS[applicantId] : null
  const formData = applicantId
    ? (MOCK_MATCHING_FORM_DATA[applicantId] ?? null)
    : null

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleUnmatch = () => {
    setShowUnmatchConfirm(true)
  }

  const handleConfirmUnmatch = () => {
    onConfirmUnmatch?.()
    setShowUnmatchConfirm(false)
    handleClose()
  }

  const handleCancelUnmatch = () => {
    setShowUnmatchConfirm(false)
  }

  if (!applicant) return null

  const processedAt = applicant.processedAt
  const dateStr = processedAt
    ? `${processedAt.date.split(".")[1] ?? ""}월 ${processedAt.date.split(".")[2] ?? ""}일 ${processedAt.time}`
    : ""

  return (
    <Modal.Root open={open} onOpenChange={(next) => !next && handleClose()}>
      <Modal.Portal>
        <Modal.Overlay tone="deep" />
        <Modal.Content className="flex max-h-[calc(100vh-60px)] items-start">
          <Modal.Title className="sr-only">
            {applicant.name} 지원서 상세
          </Modal.Title>
          <ModalFormPanel
            applicant={applicant}
            formData={formData}
            chapterName={chapterName}
            projectName={projectName}
            challengerName={challengerName}
            challengerUniversity={challengerUniversity}
            variant="matching"
            onUnmatch={isEditable ? handleUnmatch : undefined}
            onClose={handleClose}
            className="max-h-[calc(100vh-60px)] shadow-xl"
          />
        </Modal.Content>
      </Modal.Portal>

      <CtaModal
        open={showUnmatchConfirm}
        variant="error"
        overlayTone="light"
        title="매칭을 해제하시겠습니까?"
        content={
          <>
            {dateStr}에 매칭 완료된 챌린저입니다.
            <br />
            해제 시, 현재 매칭 상태가 취소되며
            <br />
            이후에 수동으로 다시 배정할 수 있습니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="매칭 해제"
        onOpenChange={() => handleCancelUnmatch()}
        onCancel={handleCancelUnmatch}
        onConfirm={handleConfirmUnmatch}
      />
    </Modal.Root>
  )
}
