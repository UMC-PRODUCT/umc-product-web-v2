import { useQuery } from "@tanstack/react-query"

import { getNoticeDetail } from "../api/noticeApi"

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
      <div className="text-body-1-regular text-teal-gray-900 whitespace-pre-wrap">
        {data.content}
      </div>

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

export function NoticeDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="bg-teal-gray-200 h-3.5 w-50 rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-teal-gray-200 h-3.5 w-50 rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-teal-gray-200 h-3.5 w-50 rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
        <div className="bg-teal-gray-200 h-3.5 w-full rounded-[4px]"></div>
      </div>
    </div>
  )
}
