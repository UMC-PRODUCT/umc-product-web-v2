import { useMemo, useState } from "react"

import { useApplicationDetail } from "@/features/application/hooks/useApplications"
import {
  toApplicantDetail,
  toApplicantFormData,
} from "@/features/application/model/mappers"
import { ModalFormPanel } from "@/features/application/ui/detail-modal/ModalFormPanel"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

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
  projectId,
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

  const applicationId = applicantId ? Number(applicantId) : 0
  const detailQuery = useApplicationDetail(projectId ?? 0, applicationId)

  const applicant = useMemo(() => {
    if (!detailQuery.data) return null
    return toApplicantDetail(detailQuery.data)
  }, [detailQuery.data])

  const formData = useMemo(() => {
    if (!detailQuery.data?.formResponse || !applicantId) return null
    return toApplicantFormData(detailQuery.data.formResponse, applicantId)
  }, [detailQuery.data, applicantId])

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

  // toDateTimePair 반환 형식: "MM/DD"
  const processedAt = applicant.processedAt
  const dateStr = processedAt
    ? `${processedAt.date.split("/")[0] ?? ""}월 ${processedAt.date.split("/")[1] ?? ""}일 ${processedAt.time}`
    : ""

  return (
    <Modal.Root open={open} onOpenChange={(next) => !next && handleClose()}>
      <Modal.Portal>
        <Modal.Overlay tone="deep" />
        <Modal.Content
          className="flex max-h-[calc(100vh-60px)] items-start"
          aria-describedby={undefined}
        >
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
