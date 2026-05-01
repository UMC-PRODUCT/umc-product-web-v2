import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  type Chapter,
  CHAPTERS,
  ChapterSelector,
  NoticeCardList,
  type NoticeItem,
} from "@/features/notice"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { Button } from "@/shared/ui/Button"
import { Pagination } from "@/shared/ui/Pagination"

interface AnnounceSearch {
  chapter: Chapter
  page: number
}

const DEFAULT_CHAPTER: Chapter = "Chromium"
const DEFAULT_PAGE = 1
const NOTICE_PAGE_SIZE = 10
const NOTICE_COMPLETION_STORAGE_KEY = "notice:completion-target"

type PendingNotice = {
  id: string
  title: string
  chip?: string
  mode: "publish" | "edit"
}

function isChapter(value: unknown): value is Chapter {
  return (
    typeof value === "string" && CHAPTERS.some((chapter) => chapter === value)
  )
}

function parsePage(value: unknown): number {
  const parsedPage =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : typeof value === "number"
        ? value
        : DEFAULT_PAGE

  return Number.isFinite(parsedPage) && parsedPage > 0
    ? Math.floor(parsedPage)
    : DEFAULT_PAGE
}

function readPendingNotice() {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = sessionStorage.getItem(NOTICE_COMPLETION_STORAGE_KEY)
  if (!rawValue) return null

  sessionStorage.removeItem(NOTICE_COMPLETION_STORAGE_KEY)

  try {
    return JSON.parse(rawValue) as PendingNotice
  } catch {
    return null
  }
}

// TODO: 공지 API 응답 형식에 맞추어 수정
const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: "1",
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
  },
  {
    id: "2",
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
  },
  {
    id: "3",
    title: "임시 공지",
    date: "0000.00.00",
  },
]

export const Route = createFileRoute("/matching/projects/announce/")({
  validateSearch: (search: Record<string, unknown>): AnnounceSearch => {
    return {
      chapter: isChapter(search.chapter) ? search.chapter : DEFAULT_CHAPTER,
      page: parsePage(search.page),
    }
  },
  component: ProjectSettingsAnnouncePage,
})

function ProjectSettingsAnnouncePage() {
  const { chapter, page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const addToast = useToastStore((state) => state.addToast)
  const [pendingNotice] = useState(readPendingNotice)
  const [notices, setNotices] = useState(() => {
    if (!pendingNotice) return INITIAL_NOTICES

    if (pendingNotice.mode === "edit") {
      return INITIAL_NOTICES.map((notice) =>
        notice.id === pendingNotice.id
          ? { ...notice, title: pendingNotice.title, chip: pendingNotice.chip }
          : notice,
      )
    }

    return [
      {
        id: pendingNotice.id,
        title: pendingNotice.title,
        date: "0000.00.00",
        chip: pendingNotice.chip,
      },
      ...INITIAL_NOTICES,
    ]
  })
  const totalPages = Math.max(1, Math.ceil(notices.length / NOTICE_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const focusedNoticeId = pendingNotice?.id ?? null
  const paginatedNotices = notices.slice(
    (safePage - 1) * NOTICE_PAGE_SIZE,
    safePage * NOTICE_PAGE_SIZE,
  )
  // TODO: 사용자 권한 API 연동 후 실제 권한 값으로 교체
  const canManage = true

  const handleChapterChange = (nextChapter: Chapter) => {
    navigate({
      search: (prev) => ({ ...prev, chapter: nextChapter }),
      replace: true,
    })
  }

  const handleNoticePublishClick = () => {
    navigate({
      to: "/matching/projects/announce/notice-publish",
    })
  }

  const handleNoticeEditClick = (noticeId: string) => {
    navigate({
      to: "/matching/projects/announce/notice-publish/$noticeId",
      params: { noticeId },
    })
  }

  // TODO: API 연동 후 실제 삭제 API 호출로 교체
  const handleNoticeDeleteClick = (noticeId: string) => {
    setNotices((prev) => prev.filter((notice) => notice.id !== noticeId))
    addToast({
      message: "공지가 삭제되었습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3,
    })
  }

  const handlePageChange = (nextPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: nextPage }),
      replace: true,
    })
  }

  useEffect(() => {
    if (!focusedNoticeId) return

    const targetIndex = notices.findIndex(
      (notice) => notice.id === focusedNoticeId,
    )

    if (targetIndex < 0) return

    const targetPage = Math.floor(targetIndex / NOTICE_PAGE_SIZE) + 1
    if (targetPage !== safePage) {
      navigate({
        search: (prev) => ({ ...prev, page: targetPage }),
        replace: true,
      })
    }
  }, [focusedNoticeId, navigate, notices, safePage])

  return (
    <section className="w-full pt-8">
      <div className="border-teal-gray-100 flex min-h-213 w-full flex-col items-center justify-between rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex w-full flex-col gap-6 pb-10">
          <div className="flex w-full flex-col items-start gap-1.5">
            <span className="text-heading-6-semibold text-teal-gray-900">
              공지
            </span>
            <p className="text-body-2-regular text-teal-gray-600">
              프로젝트 설정에 대한 지부별 공지를 PM 챌린저에게 안내합니다.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-2.5">
            <div className="flex w-full items-center gap-2.5">
              <ChapterSelector
                selectedChapter={chapter}
                onChapterChange={handleChapterChange}
              />

              {canManage ? (
                <Button
                  type="button"
                  variant="fill"
                  color="primary"
                  size="m"
                  onClick={handleNoticePublishClick}
                  className="w-26.5 items-center gap-1 py-3 pr-4 pl-3"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="text-label-1-medium text-white">
                    공지 작성
                  </span>
                </Button>
              ) : null}
            </div>

            <NoticeCardList
              notices={paginatedNotices}
              page={safePage}
              canManage={canManage}
              focusedNoticeId={focusedNoticeId}
              onDeleteNotice={handleNoticeDeleteClick}
              onEditNotice={handleNoticeEditClick}
            />
          </div>
        </div>

        <Pagination
          className="self-center"
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </section>
  )
}
