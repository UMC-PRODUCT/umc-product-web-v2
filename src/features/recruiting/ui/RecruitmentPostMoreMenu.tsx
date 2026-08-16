import { Popover } from "radix-ui"
import { useRef, useState } from "react"

import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { RecruitmentDuplicateModal } from "./RecruitmentDuplicateModal"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingTrack } from "../api/types"
import type { RecruitingListRole } from "../model/recruitingListRole"
import type {
  DuplicateOutcome,
  DuplicateTargetSeason,
  RecruitmentPostStatus,
} from "../model/recruitmentList"

interface RecruitmentPostMoreMenuProps {
  status: RecruitmentPostStatus
  // 복제하기 분기 기준: central(최고관리자/총괄·부총괄/중앙운영·교육국)은 전 지부
  // 학교 선택 모달, chapterAdmin(지부장)은 본인 지부 학교 선택 모달(기본 전체
  // 선택), schoolStaff(교내 회장단/운영진)는 모달 없이 본인 학교로 즉시 복제.
  role: RecruitingListRole
  ownChapter?: Chapter
  // 복제 모달이 보여줄 대상 후보(EDIT 권한이 있는 시즌만). schoolStaff는 모달을
  // 안 띄우니 안 넘겨도 된다.
  duplicateCandidateSeasons?: DuplicateTargetSeason[]
  // 원본 라운드의 트랙 구성. 복제는 이 트랙을 그대로 복사해서 새 라운드를
  // 만들기 때문에, 모달이 대상 학교의 시즌 트랙과 미리 비교해 호환 안 되는
  // 학교를 걸러낼 때 쓴다(RECRUITING-0110).
  sourceRecruitableTracks?: RecruitingTrack[]
  onPublish: () => Promise<void>
  onPrivatize: () => Promise<void>
  onEdit?: () => void
  // targetSeasonIds를 안 넘기면(schoolStaff 즉시복제) 원본과 같은 학교로 복제한다.
  onDuplicate: (targetSeasonIds?: string[]) => Promise<DuplicateOutcome>
  onDelete: () => void
  onUndoDelete?: () => void
  // 이 글이 속한 학교의 공유 보관함이 현재 페이지에 이미 보이는 중이면
  // 비공개/복제 완료 토스트에 "보관함으로" 이동 액션을 붙이지 않는다.
  showArchiveLink?: boolean
  onNavigateToArchive?: () => void
}

export function RecruitmentPostMoreMenu({
  status,
  role,
  ownChapter,
  duplicateCandidateSeasons = [],
  sourceRecruitableTracks = [],
  onPublish,
  onPrivatize,
  onEdit,
  onDuplicate,
  onDelete,
  onUndoDelete,
  showArchiveLink = false,
  onNavigateToArchive,
}: RecruitmentPostMoreMenuProps) {
  const addToast = useToastStore((state) => state.addToast)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [privatizeConfirmOpen, setPrivatizeConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const shouldPreventFocusRestoreRef = useRef(false)

  // TODO: 복제한 공고의 수정하기 페이지로 보내는 "바로가기" 액션은 central
  // 역할의 다중 학교 복제 시 어느 학교로 보낼지가 정해지면 다시 추가한다.
  // 학교를 여러 개 골랐을 수 있어 학교별 토스트 대신 결과를 집계해 하나로 보여준다.
  const duplicateOutcomeToast = ({
    succeededCount,
    failedCount,
  }: DuplicateOutcome) => {
    if (failedCount === 0) {
      addToast({
        message:
          succeededCount > 1
            ? `${succeededCount}개 학교의 공유 보관함에 복제되었습니다.`
            : "모집 공고가 공유 보관함에 복제되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    addToast({
      message:
        succeededCount === 0
          ? "복제에 실패했습니다. 잠시 후 다시 시도해주세요."
          : `${succeededCount}개 학교 복제 완료, ${failedCount}개 실패했습니다.`,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  const withClose = (action?: () => void) => () => {
    setPopoverOpen(false)
    action?.()
  }

  const handlePublishClick = () => {
    setPopoverOpen(false)
    onPublish()
      .then(() => {
        // 공개된 글은 같은 페이지의 "모집 공고 목록"에 바로 보이므로 이동 액션은 불필요
        addToast({
          message: "모집이 공개되었습니다.",
          color: "primary",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      })
      .catch(() => {})
  }

  const handlePrivatizeClick = () => {
    shouldPreventFocusRestoreRef.current = true
    setPopoverOpen(false)
    setPrivatizeConfirmOpen(true)
  }

  const handleDeleteClick = () => {
    shouldPreventFocusRestoreRef.current = true
    setPopoverOpen(false)
    setDeleteConfirmOpen(true)
  }

  const handleDuplicateClick = () => {
    setPopoverOpen(false)
    // schoolStaff(교내 회장단/운영진)는 학교 선택지가 본인 학교뿐이라
    // 모달 없이 바로 본인 학교로 복제한다.
    if (role === "schoolStaff") {
      onDuplicate()
        .then((outcome) => duplicateOutcomeToast(outcome))
        .catch(() => {})
      return
    }
    shouldPreventFocusRestoreRef.current = true
    setDuplicateModalOpen(true)
  }

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <MoreVerticalIcon />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={10}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => {
              if (shouldPreventFocusRestoreRef.current) {
                e.preventDefault()
                shouldPreventFocusRestoreRef.current = false
              }
            }}
            className="shadow-drop-neutral-1 border-teal-gray-50 z-1100 flex w-35 flex-col items-start gap-1 rounded-[0.625rem] border bg-white p-0.5"
          >
            {status === "DRAFT" ? (
              <DropdownItem label="공개하기" onClick={handlePublishClick} />
            ) : (
              <button
                type="button"
                onClick={handlePrivatizeClick}
                className={cn(
                  "hover:bg-teal-gray-50 flex h-13 w-full flex-col items-start justify-center rounded-lg px-4 text-left transition-colors",
                )}
              >
                <span className="text-body-2-regular text-teal-gray-700">
                  비공개하기
                </span>
                <span className="text-teal-gray-400 text-[0.625rem] leading-[150%]">
                  학교 공유 보관함으로
                </span>
              </button>
            )}

            {status !== "CLOSED" && (
              // TODO: API 연동 시 지원자 1명 이상인 OPEN 글은 수정하기를 disabled 처리
              <DropdownItem label="수정하기" onClick={withClose(onEdit)} />
            )}

            <DropdownItem label="복제하기" onClick={handleDuplicateClick} />

            <DropdownItem
              label="삭제"
              onClick={handleDeleteClick}
              className="text-error-500"
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <CtaModal
        open={privatizeConfirmOpen}
        title="모집을 비공개할까요?"
        content={
          <>
            모집을 비공개하면 지원자에게 더 이상 보이지 않습니다.
            <br />
            공고는 해당 학교의 공유 보관함으로 이동됩니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="비공개하기"
        variant="success"
        onOpenChange={setPrivatizeConfirmOpen}
        onCancel={() => setPrivatizeConfirmOpen(false)}
        onConfirm={() => {
          setPrivatizeConfirmOpen(false)
          onPrivatize()
            .then(() => {
              addToast({
                message: "모집 공고가 비공개되었습니다.",
                color: "primary",
                variant: "deep",
                type: "default",
                duration: 3000,
                action: showArchiveLink
                  ? {
                      label: "보관함으로",
                      onClick: () => onNavigateToArchive?.(),
                    }
                  : undefined,
              })
            })
            .catch(() => {})
        }}
      />

      <CtaModal
        open={deleteConfirmOpen}
        title="모집을 삭제할까요?"
        content="삭제한 모집은 복구할 수 없습니다."
        cancelText="돌아가기"
        confirmText="삭제하기"
        variant="error"
        onOpenChange={setDeleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          setDeleteConfirmOpen(false)
          onDelete()
          addToast({
            message: "모집 공고가 삭제되었습니다.",
            color: "red",
            variant: "deep",
            type: "default",
            // 실행취소 액션이 있으니 사용자가 놓치지 않도록 좀 더 오래 유지
            duration: 7000,
            action: { label: "취소하기", onClick: () => onUndoDelete?.() },
          })
        }}
      />

      {role !== "schoolStaff" && (
        <RecruitmentDuplicateModal
          open={duplicateModalOpen}
          role={role}
          ownChapter={ownChapter}
          candidateSeasons={duplicateCandidateSeasons}
          sourceRecruitableTracks={sourceRecruitableTracks}
          onOpenChange={setDuplicateModalOpen}
          onCancel={() => setDuplicateModalOpen(false)}
          onConfirm={(targetSeasonIds) => {
            setDuplicateModalOpen(false)
            onDuplicate(targetSeasonIds)
              .then((outcome) => duplicateOutcomeToast(outcome))
              .catch(() => {})
          }}
        />
      )}
    </>
  )
}
