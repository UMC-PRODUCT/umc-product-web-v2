import { useState } from "react"

import LeftChevronIcon from "@/shared/assets/icon/chevron/NoticePublish/LeftChevronIcon"

import { CheckBox } from "./CheckBox"
import { NoticeSubmitButton } from "./NoticeSubmitButton"

const MAX_CHARS = 2000

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
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleBackClick = () => {
    window.history.back()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setNoticeTitle(e.target.value)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setNoticeContent(e.target.value)
    }
  }

  const handleNotificationToggle = () => {
    setIsNotificationEnabled((prev) => !prev)
  }

  // TODO: API 연결 후 수정
  const handlePublishNotice = () => {
    if (isLoading || isDone) return

    setIsLoading(true)

    // 1초 후 loading -> done 상태로 변경 (API 호출 시뮬레이션)
    setTimeout(() => {
      setIsLoading(false)
      setIsDone(true)
      console.log(
        variant === "edit" ? "Updating notice:" : "Publishing notice:",
        {
          noticeId,
          title: noticeTitle,
          content: noticeContent,
          isNotificationEnabled,
        },
      )
    }, 1000)
  }

  const isSubmittable = noticeTitle.trim() !== "" && noticeContent.trim() !== ""
  const submitLabel = variant === "edit" ? "수정하기" : "게시하기"
  const doneLabel = variant === "edit" ? "수정 완료" : "완료"

  return (
    <section className="w-full pt-8">
      <div className="border-teal-gray-100 flex w-full flex-col items-center rounded-[12px] border bg-white px-8.5 py-8">
        <div className="flex w-full justify-start pb-2.5">
          <button
            type="button"
            onClick={handleBackClick}
            className="flex w-17.5 items-center gap-1 pr-3.5 pl-2"
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
              <CheckBox
                checked={isNotificationEnabled}
                onCheckedChange={handleNotificationToggle}
              />
              <span className="text-body-1-medium text-teal-gray-600">
                알림 발송
              </span>
            </div>

            <NoticeSubmitButton
              variant={variant}
              disabled={!isSubmittable}
              isLoading={isLoading}
              isDone={isDone}
              onClick={handlePublishNotice}
            >
              {isDone ? doneLabel : submitLabel}
            </NoticeSubmitButton>
          </div>
        </div>

        <div className="bg-teal-gray-50 shadow-inner-neutral-2 flex w-full flex-col gap-4 rounded-[12px] px-8 pt-6 pb-7.5">
          <textarea
            className="placeholder-teal-gray-400 text-body-1-regular text-teal-gray-900 min-h-90 focus:outline-none"
            placeholder="내용을 입력하세요"
            value={noticeContent}
            onChange={handleContentChange}
            maxLength={MAX_CHARS}
          />
          <div className="text-body-2-medium text-teal-gray-400 text-right">
            {noticeContent.length} / {MAX_CHARS}자
          </div>
        </div>
      </div>
    </section>
  )
}
