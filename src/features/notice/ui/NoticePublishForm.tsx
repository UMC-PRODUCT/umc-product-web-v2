import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useBlocker } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"

import { useAuthStore } from "@/features/auth/store/authStore"
import { getMemberProfile } from "@/features/challenger/api/member"
import {
  getAllChapters,
  getAllGisu,
} from "@/features/challenger/api/organization"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import LeftChevronIcon from "@/shared/assets/icon/chevron/LeftChevronIcon"
import { Button } from "@/shared/ui/Button"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import { getNoticeDetail, patchNotice, postNotice } from "../api/noticeApi"
import {
  type NoticeTabEnum,
  type PartEnum,
  type PatchNoticeRequest,
} from "../model/apiTypes"

const MAX_CHARS = 2000
const NOTICE_COMPLETION_STORAGE_KEY = "notice:completion-target"

interface NoticePublishFormProps {
  variant: "publish" | "edit"
  noticeId?: string
  noticeTab: NoticeTabEnum
  targetParts?: PartEnum[]
  chapter?: string
}

export function NoticePublishForm({
  variant,
  noticeId,
  noticeTab,
  targetParts = [],
  chapter,
}: NoticePublishFormProps) {
  const queryClient = useQueryClient()
  const [noticeContent, setNoticeContent] = useState("")
  const [noticeTitle, setNoticeTitle] = useState("")
  const [isRequired, setIsRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const memberId = useAuthStore((s) => s.memberId)

  // 기수 정보 조회
  const { data: gisuData } = useQuery({
    queryKey: ["gisu", "all"],
    queryFn: getAllGisu,
  })

  // 지부 정보 조회
  const { data: chaptersData } = useQuery({
    queryKey: ["chapters", "all"],
    queryFn: getAllChapters,
  })

  // 내 정보 조회
  const { data: profile } = useQuery({
    queryKey: ["member", "profile", memberId],
    queryFn: () => getMemberProfile(String(memberId)),
    enabled: !!memberId,
  })

  // 공지 상세 조회 (수정 모드일 때)
  const { data: noticeDetail } = useQuery({
    queryKey: ["notice", "detail", noticeId],
    queryFn: () => getNoticeDetail(Number(noticeId)),
    enabled: variant === "edit" && !!noticeId,
  })

  // 수정 모드일 때 기존 데이터로 폼 채우기
  useEffect(() => {
    if (variant === "edit" && noticeDetail) {
      setNoticeTitle(noticeDetail.title)
      setNoticeContent(noticeDetail.content)
      setIsRequired(noticeDetail.mustRead)
    }
  }, [variant, noticeDetail])

  const activeGisuId = useMemo(() => {
    if (!gisuData) return null
    const active = gisuData.gisuList.find((g) => g.isActive)
    return active ? active.gisuId : gisuData.gisuList[0]?.gisuId || null
  }, [gisuData])

  const targetInfo = useMemo(() => {
    const activeRecord =
      profile?.challengerRecords?.find(
        (r) => r.challengerStatus === "ACTIVE",
      ) || profile?.challengerRecords?.[0]

    // 만약 파라미터로 chapter가 넘어왔다면 해당 지부의 ID를 찾아서 사용
    let chapterId = activeRecord ? Number(activeRecord.chapterId) : 0
    if (chapter && chaptersData) {
      const found = chaptersData.chapters.find((c) => c.name === chapter)
      if (found) chapterId = Number(found.id)
    }

    if (!activeGisuId || !chapterId) return null

    return {
      targetGisuId: Number(activeGisuId),
      targetChapterId: chapterId,
      targetSchoolId: null,
      targetParts,
      targetNoticeTab: noticeTab,
    }
  }, [profile, activeGisuId, noticeTab, targetParts, chapter, chaptersData])

  const publishMutation = useMutation({
    mutationFn: postNotice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notices"] })
      setIsLoading(false)
      setIsDone(true)

      const completionNoticeId = String(data.noticeId)

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
    },
    onError: () => {
      setIsLoading(false)
      // TODO: 에러 처리 (토스트 등)
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: PatchNoticeRequest }) =>
      patchNotice(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] })
      queryClient.invalidateQueries({
        queryKey: ["notice", "detail", noticeId],
      })
      setIsLoading(false)
      setIsDone(true)

      sessionStorage.setItem(
        NOTICE_COMPLETION_STORAGE_KEY,
        JSON.stringify({
          id: noticeId,
          title: noticeTitle,
          chip: isRequired ? "필독" : undefined,
          mode: variant,
        }),
      )

      setIsCompletionModalOpen(true)
    },
    onError: () => {
      setIsLoading(false)
      // TODO: 에러 처리
    },
  })

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac =
      typeof window !== "undefined" &&
      /Mac|iPad|iPhone|iPod/.test(navigator.userAgent)
    const hasModifier = isMac ? e.metaKey : e.ctrlKey

    if (hasModifier && (e.key === "b" || e.key === "B")) {
      e.preventDefault()

      const textarea = textareaRef.current
      if (!textarea) return

      const selectionStart = textarea.selectionStart ?? 0
      const selectionEnd = textarea.selectionEnd ?? 0
      const text = textarea.value

      const textBefore = text.substring(0, selectionStart)
      const selectedText = text.substring(selectionStart, selectionEnd)
      const textAfter = text.substring(selectionEnd)

      let newText = ""
      let newStart = selectionStart
      let newEnd = selectionEnd

      if (
        selectedText.startsWith("**") &&
        selectedText.endsWith("**") &&
        selectedText.length >= 4
      ) {
        const unwrapped = selectedText.slice(2, -2)
        newText = textBefore + unwrapped + textAfter
        newStart = selectionStart
        newEnd = selectionEnd - 4
      } else if (textBefore.endsWith("**") && textAfter.startsWith("**")) {
        newText = textBefore.slice(0, -2) + selectedText + textAfter.slice(2)
        newStart = selectionStart - 2
        newEnd = selectionEnd - 2
      } else {
        newText = textBefore + "**" + selectedText + "**" + textAfter
        newStart = selectionStart + 2
        newEnd = selectionEnd + 2
      }

      handleContentChange(newText)

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(newStart, newEnd)
      })
    }
  }

  const handleRequiredToggle = () => {
    setIsRequired((prev) => !prev)
  }

  const handlePublishNotice = () => {
    if (isLoading || isDone) return
    if (variant === "publish" && !targetInfo) return

    setIsLoading(true)

    if (variant === "publish" && targetInfo) {
      publishMutation.mutate({
        title: noticeTitle,
        content: noticeContent,
        mustRead: isRequired,
        shouldNotify: false, // UI에 알림 여부 토글이 없으므로 기본값 false
        targetInfo,
      })
    } else if (variant === "edit" && noticeId) {
      editMutation.mutate({
        id: Number(noticeId),
        body: {
          title: noticeTitle,
          content: noticeContent,
          mustRead: isRequired,
        },
      })
    }
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
      <section className="w-full">
        <div className="border-teal-gray-100 flex w-full flex-col items-center rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
          <div className="flex w-full justify-start pb-2.5">
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-1 pr-3.5 pl-2"
            >
              <LeftChevronIcon className="text-teal-gray-400 size-4" />
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
              autoFocus
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
                disabled={
                  !isSubmittable ||
                  isDone ||
                  (variant === "publish" && !targetInfo)
                }
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
            onKeyDown={handleKeyDown}
            textareaRef={textareaRef}
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
                  보러 가기
                </Button>
              </Modal.Close>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <CtaModal
        open={isLeaveModalOpen}
        title="페이지 이탈"
        content={
          <>
            작성 중인 글이 있습니다.
            <br />
            나가시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="나가기"
        onOpenChange={(open) => {
          if (!open) handleLeaveCancel()
        }}
        onCancel={handleLeaveCancel}
        onConfirm={handleLeaveConfirm}
      />
    </>
  )
}
