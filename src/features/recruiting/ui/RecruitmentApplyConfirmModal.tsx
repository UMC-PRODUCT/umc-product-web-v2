import { CtaModal } from "@/shared/ui/modal/CtaModal"

export type ApplyConfirmStatus =
  | "confirm"
  | "submitted"
  | "submittedEditable"
  | "draft"

interface RecruitmentApplyConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: ApplyConfirmStatus
  recruitmentTitle: string
  confirmLoading?: boolean
  onConfirm: () => void
}

export function RecruitmentApplyConfirmModal({
  open,
  onOpenChange,
  status,
  recruitmentTitle,
  confirmLoading,
  onConfirm,
}: RecruitmentApplyConfirmModalProps) {
  const handleCancel = () => onOpenChange(false)

  if (status === "confirm") {
    return (
      <CtaModal
        open={open}
        onOpenChange={onOpenChange}
        icon={false}
        widthClassName="w-fit"
        titleClassName="whitespace-nowrap"
        title={`${recruitmentTitle}에 지원할까요?`}
        content={
          <>
            다른 학교 공고에 지원하면 합격이 취소될 수 있습니다.
            <br />
            반드시 내 학교 공고가 맞는지 확인해 주세요.
          </>
        }
        cancelText="돌아가기"
        onCancel={handleCancel}
        confirmText="지원하기"
        confirmLoading={confirmLoading}
        onConfirm={onConfirm}
      />
    )
  }

  if (status === "submittedEditable") {
    return (
      <CtaModal
        open={open}
        onOpenChange={onOpenChange}
        title="이미 제출한 지원서가 있습니다"
        content="모집 마감 전까지 내 지원서에서 수정할 수 있습니다."
        descriptionClassName="text-teal-600 font-semibold underline"
        cancelText="돌아가기"
        onCancel={handleCancel}
        confirmText="내 지원서 수정하기"
        confirmLoading={confirmLoading}
        onConfirm={onConfirm}
      />
    )
  }

  const isDraft = status === "draft"

  return (
    <CtaModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        isDraft
          ? "작성 중인 지원서가 있습니다"
          : "이미 제출한 지원서가 있습니다"
      }
      content={
        isDraft
          ? "내 지원서에서 이어서 작성할 수 있습니다."
          : "내 지원서에서 지원 내역을 확인할 수 있습니다."
      }
      descriptionClassName="underline"
      cancelText="돌아가기"
      onCancel={handleCancel}
      confirmText="내 지원서 보기"
      confirmLoading={confirmLoading}
      onConfirm={onConfirm}
    />
  )
}
