import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { getViewerBranch, isOperator } from "@/features/auth/model/identity"
import {
  getAllChapters,
  getAllGisu,
} from "@/features/challenger/api/organization"
import {
  type Chapter,
  CHAPTERS,
  ChapterSelector,
  NoticeCardList,
  NoticeDetailContent,
  type NoticeItem,
} from "@/features/notice"
import { deleteNotice, getNotices } from "@/features/notice/api/noticeApi"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { Button } from "@/shared/ui/Button"
import { Pagination } from "@/shared/ui/Pagination"

interface AnnounceSearch {
  chapter: Chapter
  page: number
}

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

/** 프로젝트 설정 공지 페이지 (/matching/projects/announce) */
export const Route = createFileRoute("/matching/projects/announce/")({
  validateSearch: (search: Record<string, unknown>): AnnounceSearch => {
    return {
      chapter: isChapter(search.chapter) ? search.chapter : CHAPTERS[0],
      page: parsePage(search.page),
    }
  },
  beforeLoad: async ({ search, context }) => {
    const me = await ensureMe(context.queryClient)
    if (isOperator(me)) return
    const userChapter = getViewerBranch(me)
    if (isChapter(userChapter) && search.chapter !== userChapter) {
      throw redirect({
        to: "/matching/projects/announce",
        search: { ...search, chapter: userChapter },
      })
    }
  },
  component: ProjectSettingsAnnouncePage,
})

function ProjectSettingsAnnouncePage() {
  const { chapter, page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const addToast = useToastStore((state) => state.addToast)
  const [pendingNotice] = useState(readPendingNotice)

  const { data: me } = useMe()
  const { hasPermission } = useResourcePermission("NOTICE")

  const isOp = isOperator(me)
  const userChapter = getViewerBranch(me) as Chapter | undefined

  const canWrite = hasPermission("WRITE")
  const canEdit = hasPermission("EDIT")
  const canDelete = hasPermission("DELETE")

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

  const activeGisuId = useMemo(() => {
    if (!gisuData) return null
    const active = gisuData.gisuList.find((g) => g.isActive)
    return active ? active.gisuId : gisuData.gisuList[0]?.gisuId || null
  }, [gisuData])

  const selectedChapterId = useMemo(() => {
    if (!chaptersData) return null
    return chaptersData.chapters.find((c) => c.name === chapter)?.id || null
  }, [chaptersData, chapter])

  const { data: noticesData, isLoading: isNoticesLoading } = useQuery({
    queryKey: [
      "notices",
      "project-settings",
      activeGisuId,
      selectedChapterId,
      page,
    ],
    queryFn: () =>
      getNotices({
        gisuId: Number(activeGisuId),
        chapterId: selectedChapterId ? Number(selectedChapterId) : undefined,
        noticeTab: "CHALLENGER",
        part: "PLAN",
        page: page - 1,
        size: NOTICE_PAGE_SIZE,
        sort: "createdAt,DESC",
      }),
    enabled: !!activeGisuId,
  })

  const notices = useMemo(() => {
    if (!noticesData) return []

    const mappedNotices: NoticeItem[] = noticesData.content.map((item) => ({
      id: String(item.id),
      title: item.title,
      date: dayjs(item.createdAt).format("YYYY.MM.DD"),
      chip: item.mustRead ? "필독" : undefined,
    }))

    return [...mappedNotices].sort((a, b) => {
      if (a.chip === "필독" && b.chip !== "필독") return -1
      if (a.chip !== "필독" && b.chip === "필독") return 1
      return 0
    })
  }, [noticesData])

  const totalPages = noticesData?.totalPages || 1
  const safePage = Math.min(Math.max(1, page), totalPages)
  const focusedNoticeId = pendingNotice?.id ?? null

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotice(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] })
      addToast({
        message: "공지가 삭제되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    onError: () => {
      // TODO: 삭제 실패 시 동작 추가
    },
  })

  const handleChapterChange = (nextChapter: Chapter) => {
    if (!isOp && userChapter && nextChapter !== userChapter) {
      addToast({
        message: "소속된 지부의 공지만 확인할 수 있습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }

    navigate({
      search: (prev) => ({ ...prev, chapter: nextChapter }),
      replace: true,
    })
  }

  const handleNoticePublishClick = () => {
    navigate({
      to: "/matching/projects/announce/notice-publish",
      search: { chapter },
    })
  }

  const handleNoticeEditClick = (noticeId: string) => {
    navigate({
      to: "/matching/projects/announce/notice-publish/$noticeId",
      params: { noticeId },
    })
  }

  const handleNoticeDeleteClick = (noticeId: string) => {
    deleteMutation.mutate(noticeId)
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
              {canWrite
                ? "프로젝트 설정에 대한 지부별 공지를 PM 챌린저에게 안내합니다."
                : "프로젝트 설정에 대한 우리 지부의 PM 챌린저 공지를 한눈에 조회합니다."}
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-2.5">
            <div className="flex w-full items-center gap-2.5">
              <ChapterSelector
                selectedChapter={chapter}
                onChapterChange={handleChapterChange}
              />

              {canWrite ? (
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
              notices={notices}
              page={safePage}
              isLoading={isNoticesLoading}
              canEdit={canEdit}
              canDelete={canDelete}
              focusedNoticeId={focusedNoticeId}
              onDeleteNotice={handleNoticeDeleteClick}
              onEditNotice={handleNoticeEditClick}
              renderContent={(noticeId) => (
                <NoticeDetailContent noticeId={noticeId} />
              )}
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
