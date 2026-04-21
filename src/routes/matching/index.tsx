import { createFileRoute, useNavigate } from "@tanstack/react-router"

import {
  type Chapter,
  CHAPTERS,
  ChapterSelector,
  NoticeCardList,
  type NoticeItem,
} from "@/features/notice"

interface AnnounceSearch {
  chapter: Chapter
  page: number
}

const DEFAULT_CHAPTER: Chapter = "Chromium"
const DEFAULT_PAGE = 1

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

// TODO: 공지 API 응답 형식에 맞추어 수정
const notices: NoticeItem[] = [
  {
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
    variant: "accent",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
    variant: "accent",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
    variant: "accent",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    chip: "필독",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    variant: "muted",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    variant: "muted",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    variant: "muted",
  },
  {
    title: "임시 공지",
    date: "0000.00.00",
    variant: "muted",
  },
]

/** 팀 매칭 · 공지 — 레이아웃 하위 인덱스 (/matching) */
export const Route = createFileRoute("/matching/")({
  validateSearch: (search: Record<string, unknown>): AnnounceSearch => {
    return {
      chapter: isChapter(search.chapter) ? search.chapter : DEFAULT_CHAPTER,
      page: parsePage(search.page),
    }
  },
  component: TeamMatchingAnnouncePage,
})

function TeamMatchingAnnouncePage() {
  const { chapter, page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const handleChapterChange = (nextChapter: Chapter) => {
    navigate({
      search: (prev) => ({ ...prev, chapter: nextChapter }),
      replace: true,
    })
  }

  return (
    <section className="w-full pt-8">
      <div className="border-teal-gray-100 flex min-h-213 w-full flex-col items-center justify-between rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex w-full flex-col gap-6 pb-10">
          <div className="flex w-full flex-col items-start gap-1.5">
            <span className="text-heading-6-semibold text-teal-gray-900">
              공지
            </span>
            <p className="text-body-2-regular text-teal-gray-600">
              팀 매칭에 관련한 지부별 공지를 안내합니다.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-2.5">
            <ChapterSelector
              selectedChapter={chapter}
              onChapterChange={handleChapterChange}
            />

            <NoticeCardList notices={notices} page={page} />
          </div>
        </div>

        <span className="shadow-inner-neutral-2 text-subtitle-4-semibold bg-teal-gray-50 text-teal-gray-900 inline-flex h-7.5 w-7.5 items-center justify-center rounded-[12px]">
          {page}
        </span>
      </div>
    </section>
  )
}
