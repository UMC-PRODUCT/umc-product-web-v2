import { useQuery } from "@tanstack/react-query"

import { MarkdownRenderer } from "@/shared/ui/MarkdownRenderer"

import { getNoticeDetail } from "../api/noticeApi"
import { NoticeDetailSkeleton } from "./NoticeDetailSkeleton"

interface NoticeDetailContentProps {
  noticeId: string
}

export function NoticeDetailContent({ noticeId }: NoticeDetailContentProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notice", "detail", noticeId],
    queryFn: () => getNoticeDetail(Number(noticeId)),
    enabled: !!noticeId,
  })

  if (isLoading) {
    return <NoticeDetailSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="flex w-full items-center justify-center py-10">
        <span className="text-body-2-medium text-red-500">
          공지 내용을 불러오는 중 오류가 발생했습니다.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <MarkdownRenderer content={data.content} />

      {data.images && data.images.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4">
          {[...data.images]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt="notice attachment"
                className="max-h-60 rounded-lg object-contain shadow-sm"
              />
            ))}
        </div>
      )}

      {data.links && data.links.length > 0 && (
        <div className="flex flex-col gap-2 pt-4">
          {[...data.links]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-2-medium text-teal-600 underline underline-offset-4 transition-colors hover:text-teal-700"
              >
                {link.url}
              </a>
            ))}
        </div>
      )}
    </div>
  )
}
