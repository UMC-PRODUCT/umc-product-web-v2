import { type ReactNode, useEffect, useState } from "react"

import { Border } from "./Border"
import { NoticeCard } from "./NoticeCard"

// TODO: 공지 API 응답 형식에 맞추어 수정
export type NoticeItem = {
  id: string
  title: string
  date: string
  chip?: string
}

// TODO: 공지 API 응답 형식에 맞추어 수정
interface NoticeCardListProps {
  notices: NoticeItem[]
  page: number
  canManage?: boolean
  focusedNoticeId?: string | null
  onDeleteNotice?: (noticeId: string) => void
  onEditNotice?: (noticeId: string) => void
  renderContent?: (noticeId: string) => ReactNode
}

export function NoticeCardList({
  notices,
  page,
  canManage = false,
  focusedNoticeId,
  onDeleteNotice,
  onEditNotice,
  renderContent,
}: NoticeCardListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    setExpandedIndex(null)
  }, [page])

  useEffect(() => {
    if (!focusedNoticeId) return

    const targetIndex = notices.findIndex(
      (notice) => notice.id === focusedNoticeId,
    )

    if (targetIndex < 0) return

    setExpandedIndex(targetIndex)
  }, [focusedNoticeId, notices])

  useEffect(() => {
    if (!focusedNoticeId) return

    const targetButton = document.querySelector<HTMLElement>(
      `[data-notice-id="${focusedNoticeId}"]`,
    )

    if (!targetButton) return

    targetButton.focus()
    targetButton.scrollIntoView({ block: "center", behavior: "smooth" })
  }, [expandedIndex, focusedNoticeId, notices])

  return (
    <div className="flex w-full flex-col">
      {notices.map((notice, index) => {
        const isExpanded = expandedIndex === index
        const cardVariant =
          expandedIndex === null ? "default" : isExpanded ? "accent" : "muted"

        return (
          <div
            key={`${notice.title}-${notice.date}-${index}`}
            className="w-full"
          >
            <NoticeCard
              title={notice.title}
              date={notice.date}
              chip={notice.chip}
              variant={cardVariant}
              canManage={canManage}
              expanded={isExpanded}
              data-notice-id={notice.id}
              onExpandedChange={(nextExpanded) => {
                setExpandedIndex(nextExpanded ? index : null)
              }}
              onEdit={() => {
                onEditNotice?.(notice.id)
              }}
              onDelete={() => {
                onDeleteNotice?.(notice.id)
              }}
            >
              {renderContent ? renderContent(notice.id) : "임시 내용"}
            </NoticeCard>

            {!isExpanded && index < notices.length - 1 ? <Border /> : null}
          </div>
        )
      })}
    </div>
  )
}
