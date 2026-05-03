import { useBlocker } from "@tanstack/react-router"
import { useState } from "react"

import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import LeftChevronIcon from "@/shared/assets/icon/chevron/NoticePublish/LeftChevronIcon"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { Button } from "@/shared/ui/Button"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { Modal } from "@/shared/ui/Modal"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

const MAX_CHARS = 2000
const NOTICE_COMPLETION_STORAGE_KEY = "notice:completion-target"

interface NoticePublishFormProps {
  variant: "publish" | "edit"
  noticeId?: string
}

export function NoticePublishForm({
  variant,
  noticeId,
}: NoticePublishFormProps) {
  const [noticeContent, setNoticeContent] = useState("")
  const [noticeTitle, setNoticeTitle] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)

  const hasPendingChanges =
    !isDone &&
    (noticeTitle.trim() !== "" || noticeContent.trim() !== "" || isRequired)

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveBlockStatus,
  } = useBlocker({
    shouldBlockFn: () => hasPendingChanges,
    withResolver: true,
    enableBeforeUnload: hasPendingChanges,
  })

  const isLeaveModalOpen = leaveBlockStatus === "blocked"

  const handleBackClick = () => {
    window.history.back()
  }

  const handleLeaveConfirm = () => {
    proceedLeave?.()
  }

  const handleLeaveCancel = () => {
    resetLeave?.()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setNoticeTitle(e.target.value)
    }
  }

  const handleContentChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setNoticeContent(value)
    }
  }

  const handleRequiredToggle = () => {
    setIsRequired((prev) => !prev)
  }

  // TODO: API 연결 후 수정
  const handlePublishNotice = () => {
    if (isLoading || isDone) return

    setIsLoading(true)

    // 1초 후 loading -> done 상태로 변경 (API 호출 시뮬레이션)
    setTimeout(() => {
      setIsLoading(false)
      setIsDone(true)
      const completionNoticeId = noticeId ?? crypto.randomUUID()

      sessionStorage.setItem(
        NOTICE_COMPLETION_STORAGE_KEY,
        JSON.stringify({
          id: completionNoticeId,
          title: noticeTitle,
          chip: isRequired ? "필독" : undefined,
          mode: variant,
        }),
      )

      setIsCompletionModalOpen(true)
      console.log(
        variant === "edit" ? "Updating notice:" : "Publishing notice:",
        {
          noticeId,
          title: noticeTitle,
          content: noticeContent,
          isRequired,
        },
      )
    }, 1000)
  }

  const isSubmittable = noticeTitle.trim() !== "" && noticeContent.trim() !== ""
  const submitLabel = variant === "edit" ? "수정하기" : "게시하기"
  const doneLabel = variant === "edit" ? "수정 완료" : "완료"
  const submitButtonVariant = variant === "edit" ? "weak" : "fill"
  const completionTitle = variant === "edit" ? "수정 완료" : "게시 완료"
  const completionDescription =
    variant === "edit"
      ? "공지 수정이 완료되었습니다."
      : "공지가 등록되었습니다."

  const handleCompletionGoBack = () => {
    window.history.back()
  }

  return (
    <>
      <section className="w-full pt-8">
        <div className="border-teal-gray-100 flex w-full flex-col items-center rounded-[12px] border bg-white px-8.5 py-8">
          <div className="flex w-full justify-start pb-2.5">
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-1 pr-3.5 pl-2"
            >
              <LeftChevronIcon />
              <span className="text-label-1-medium text-teal-gray-600">
                목록으로
              </span>
            </button>
          </div>

          <div className="flex w-full items-center gap-2.5 px-4 py-1 pb-4">
            <input
              type="text"
              name="title"
              id="title"
              className="text-heading-5-semibold placeholder-teal-gray-400 flex-1 text-teal-600 focus:outline-none"
              placeholder="제목"
              value={noticeTitle}
              onChange={handleTitleChange}
            />

            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isRequired}
                  onChange={handleRequiredToggle}
                  variant="primary"
                  aria-label="필독"
                />
                <span className="text-body-1-medium text-teal-gray-600">
                  필독
                </span>
              </div>

              <Button
                variant={submitButtonVariant}
                color="primary"
                size="m"
                disabled={!isSubmittable || isDone}
                isLoading={isLoading}
                onClick={handlePublishNotice}
              >
                {isDone ? doneLabel : submitLabel}
              </Button>
            </div>
          </div>

          <TextQuestionField
            value={noticeContent}
            onChange={handleContentChange}
            placeholder="내용을 입력하세요."
            maxLength={MAX_CHARS}
            className="bg-teal-gray-50 shadow-inner-neutral-2 data-[state=focus]:bg-teal-gray-50 flex flex-col gap-4 px-8 pt-6 pb-7.5"
          />
        </div>
      </section>

      <Modal.Root
        open={isCompletionModalOpen}
        onOpenChange={setIsCompletionModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className="shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none">
            <div className="flex flex-col items-start gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <CheckIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  {completionTitle}
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                {completionDescription}
              </Modal.Description>
            </div>

            <div className="flex w-full justify-end">
              <Modal.Close asChild>
                <Button
                  variant="fill"
                  color="primary"
                  size="s"
                  className="rounded-[10px]"
                  onClick={handleCompletionGoBack}
                >
                  보러가기
                </Button>
              </Modal.Close>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root
        open={isLeaveModalOpen}
        onOpenChange={(open) => {
          if (!open) handleLeaveCancel()
        }}
      >
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className="shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none">
            <div className="flex flex-col items-start gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <WarningTriangleIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  페이지 이탈
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                작성 중인 글이 있습니다.
                <br />
                나가시겠습니까?
              </Modal.Description>
            </div>

            <div className="flex w-full justify-end gap-3">
              <Button
                type="button"
                variant="weak"
                color="neutral"
                size="s"
                className="rounded-[10px]"
                onClick={handleLeaveCancel}
              >
                돌아가기
              </Button>
              <Button
                type="button"
                variant="fill"
                color="primary"
                size="s"
                className="rounded-[10px]"
                onClick={handleLeaveConfirm}
              >
                나가기
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
}
