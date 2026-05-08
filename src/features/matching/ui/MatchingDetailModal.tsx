import { useState } from "react"

import { ModalFormPanel } from "@/features/application/ui/detail-modal/ModalFormPanel"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import {
  MOCK_MATCHING_APPLICANTS,
  MOCK_MATCHING_FORM_DATA,
} from "../model/matchingFormMock"

import type { StatusValue } from "@/features/application/model/types"

const STATUS_LABEL: Record<StatusValue, string> = {
  pass: "합격",
  fail: "불합격",
  pending: "대기",
}

interface MatchingDetailModalProps {
  applicantId: string | null
  chapterName: string
  projectName: string
  challengerName: string
  challengerUniversity: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MatchingDetailModal({
  applicantId,
  chapterName,
  projectName,
  challengerName,
  challengerUniversity,
  open,
  onOpenChange,
}: MatchingDetailModalProps) {
  const [statusOverride, setStatusOverride] = useState<StatusValue | null>(null)
  const [pendingStatus, setPendingStatus] = useState<StatusValue | null>(null)

  const applicant = applicantId ? MOCK_MATCHING_APPLICANTS[applicantId] : null
  const formData = applicantId
    ? (MOCK_MATCHING_FORM_DATA[applicantId] ?? null)
    : null

  const displayApplicant = applicant
    ? { ...applicant, status: statusOverride ?? applicant.status }
    : null

  const handleClose = () => {
    onOpenChange(false)
    setStatusOverride(null)
  }

  const handleStatusChange = (status: StatusValue) => {
    if (status === displayApplicant?.status) return
    setPendingStatus(status)
  }

  const handleConfirmStatus = () => {
    if (pendingStatus) {
      setStatusOverride(pendingStatus)
      setPendingStatus(null)
    }
  }

  const handleCancelStatus = () => {
    setPendingStatus(null)
  }

  if (!displayApplicant) return null

  const currentLabel = STATUS_LABEL[displayApplicant.status]
  const pendingLabel = pendingStatus ? STATUS_LABEL[pendingStatus] : ""
  const processedAt = displayApplicant.processedAt
  const dateStr = processedAt
    ? `${processedAt.date.split(".")[1] ?? ""}월 ${processedAt.date.split(".")[2] ?? ""}일 ${processedAt.time}`
    : ""

  return (
    <Modal.Root open={open} onOpenChange={(next) => !next && handleClose()}>
      <Modal.Portal>
        <Modal.Overlay tone="light" />
        <Modal.Content className="flex max-h-[calc(100vh-60px)] items-start">
          <Modal.Title className="sr-only">
            {displayApplicant.name} 지원서 상세
          </Modal.Title>
          <ModalFormPanel
            applicant={displayApplicant}
            formData={formData}
            chapterName={chapterName}
            projectName={projectName}
            challengerName={challengerName}
            challengerUniversity={challengerUniversity}
            onStatusChange={handleStatusChange}
            onClose={handleClose}
            className="max-h-[calc(100vh-60px)] shadow-xl"
          />
        </Modal.Content>
      </Modal.Portal>

      <CtaModal
        open={pendingStatus !== null}
        variant="error"
        overlayTone="deep"
        title={`${pendingLabel} 상태로 변경할까요?`}
        content={
          <>
            {dateStr}에 상태가 등록된 챌린저입니다.
            <br />
            변경 시, 현재 {currentLabel} 상태가 취소되며
            <br />
            이후에도 다시 상태를 변경할 수 있습니다.
          </>
        }
        cancelText="돌아가기"
        confirmText={`${pendingLabel}로 변경`}
        onOpenChange={() => handleCancelStatus()}
        onCancel={handleCancelStatus}
        onConfirm={handleConfirmStatus}
      />
    </Modal.Root>
  )
}
