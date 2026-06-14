import { type ReactNode, useEffect, useState } from "react"

import { Border } from "./Border"
import { NoticeCard } from "./NoticeCard"
import { NoticeCardSkeleton } from "./NoticeCardSkeleton"

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
  isLoading?: boolean
  canEdit?: boolean
  canDelete?: boolean
  focusedNoticeId?: string | null
  onDeleteNotice?: (noticeId: string) => void
  onEditNotice?: (noticeId: string) => void
  renderContent?: (noticeId: string) => ReactNode
}

const SKELETON_COUNT = 3

export function NoticeCardList({
  notices,
  page,
  isLoading = false,
  canEdit = false,
  canDelete = false,
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
    targetButton.scrollIntoView({ block: "start", behavior: "smooth" })
  }, [expandedIndex, focusedNoticeId, notices])

  if (isLoading) {
    return (
      <div className="flex w-full flex-col">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={`skeleton-${index}`} className="w-full">
            <NoticeCardSkeleton />
            {index < 4 ? <Border /> : null}
          </div>
        ))}
      </div>
    )
  }

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
              canEdit={notice.id.startsWith("default-") ? false : canEdit}
              canDelete={notice.id.startsWith("default-") ? false : canDelete}
              expanded={isExpanded}
              data-notice-id={notice.id}
              onExpandedChange={(nextExpanded) => {
                setExpandedIndex(nextExpanded ? index : null)
                if (!nextExpanded) return
                const targetId = notice.id
                requestAnimationFrame(() => {
                  document
                    .querySelector<HTMLElement>(
                      `[data-notice-id="${targetId}"]`,
                    )
                    ?.scrollIntoView({ block: "start", behavior: "smooth" })
                })
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
