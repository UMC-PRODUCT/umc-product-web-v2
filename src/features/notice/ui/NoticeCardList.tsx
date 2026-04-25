import { useEffect, useState } from "react"

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
  onDeleteNotice?: (noticeId: string) => void
  onEditNotice?: (noticeId: string) => void
}

export function NoticeCardList({
  notices,
  page,
  canManage = false,
  onDeleteNotice,
  onEditNotice,
}: NoticeCardListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEffect(() => {
    setExpandedIndex(null)
  }, [page])

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
              임시 내용
            </NoticeCard>

            {!isExpanded && index < notices.length - 1 ? <Border /> : null}
          </div>
        )
      })}
    </div>
  )
}
