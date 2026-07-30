import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { IconButton } from "@/shared/ui/button/IconButton"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { checkRecruitingRoundTitleAvailability } from "../api/recruitingApi"
import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
import { useRecruitingPermissions } from "../hooks/useRecruitingPermissions"
import {
  useCloneRecruitingRound,
  useDeleteRecruitingRound,
  useUpdateRecruitingRoundStatus,
} from "../hooks/useRecruitmentListMutations"
import {
  resolveRecruitingListRole,
  resolveViewerChapter,
  resolveViewerSchool,
} from "../model/recruitingRole"
import { resolveAvailableTitle } from "../model/recruitmentCreate"
import {
  groupPostsByChapter,
  mapRoundGroupsToPosts,
  RECRUITMENT_SORT_OPTIONS,
} from "../model/recruitmentList"
import { RECRUITMENT_LIST_MOCK } from "../model/recruitmentList.mock"
import { ChapterTabs } from "./ChapterTabs"
import { RecruitmentCreateButton } from "./RecruitmentCreateButton"
import { RecruitmentDraftArchiveCard } from "./RecruitmentDraftArchiveCard"
import { RecruitmentOwnScopeSection } from "./RecruitmentOwnScopeSection"
import { RecruitmentPostListCard } from "./RecruitmentPostListCard"
import { RecruitmentSchoolSearchDropdown } from "./RecruitmentSchoolSearchDropdown"
import { SchoolTabs } from "./SchoolTabs"

import type { RecruitingListRole } from "../model/recruitingListRole"
import type { RecruitmentPost, RecruitmentSort } from "../model/recruitmentList"

interface RecruitmentListPageProps {
  // 테스트 라우트(/test/recruiting-recruitments)에서 역할별 화면을 미리 보기 위한 override.
  // 생략하면 로그인한 사용자의 실제 역할로 판정한다.
  role?: RecruitingListRole
  useMockData?: boolean
}

export function RecruitmentListPage({
  role: roleOverride,
  useMockData = false,
}: RecruitmentListPageProps) {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const role = roleOverride ?? resolveRecruitingListRole(me)
  const viewerChapter = resolveViewerChapter(me)
  const viewerSchool = resolveViewerSchool(me)
  const myChapter = isChapter(viewerChapter) ? viewerChapter : undefined

  const [chapterTab, setChapterTab] = useState("all")
  const [schoolTab, setSchoolTab] = useState("all")
  const [schoolSearchOpen, setSchoolSearchOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  // 지부별 카드가 각자 정렬 컨트롤을 갖던 이전 UI와 달리, 데이터는 페이지
  // 전체를 한 번에 조회하는 단일 API 호출이라 정렬도 페이지 전체가 공유한다.
  const [sort, setSort] = useState<RecruitmentSort>("NEWEST")
  const [sortOpen, setSortOpen] = useState(false)

  // /admin/rounds는 학교 회장단 이상만 조회 가능하다(isForbidden). SCHOOL_STAFF는
  // 현재 이 화면에서 공고 목록을 볼 수 없다 — 알려진 백엔드 권한 제약.
  const {
    groups,
    isLoading: isRoundsLoading,
    isError: isRoundsError,
    isForbidden,
  } = useAdminRecruitingRounds(sort)
  const fetchedPosts = useMemo(() => mapRoundGroupsToPosts(groups), [groups])

  // useMockData(테스트 라우트 전용)일 때만 조회 결과를 로컬 상태로 미러링해
  // 낙관적으로 반영한다. 실제 모드에서는 mutation 성공 후 재조회로 갱신된다.
  const [posts, setPosts] = useState<RecruitmentPost[]>(
    useMockData ? RECRUITMENT_LIST_MOCK : [],
  )
  useEffect(() => {
    if (!useMockData) setPosts(fetchedPosts)
  }, [useMockData, fetchedPosts])
  const lastDeletedPostRef = useRef<RecruitmentPost | null>(null)

  // 편집 권한은 role이 아니라 시즌 단위 실제 EDIT 권한으로 판정한다(canEditRecruitmentPost 참고).
  const seasonIds = useMemo(
    () => [...new Set(posts.map((post) => post.seasonId))],
    [posts],
  )
  const { permittedSeasonIds } = useRecruitingPermissions(seasonIds)

  const updateRoundStatus = useUpdateRecruitingRoundStatus()
  const cloneRound = useCloneRecruitingRound()
  const deleteRound = useDeleteRecruitingRound()

  const handlePrivatize = (postId: string) => {
    if (useMockData) {
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId ? { ...post, status: "DRAFT" } : post,
        ),
      )
      return
    }
    const post = posts.find((item) => item.postId === postId)
    if (!post) return
    updateRoundStatus.mutate({
      seasonId: post.seasonId,
      roundId: postId,
      status: "DRAFT",
    })
  }

  const handlePublish = (postId: string) => {
    if (useMockData) {
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId ? { ...post, status: "OPEN" } : post,
        ),
      )
      return
    }
    const post = posts.find((item) => item.postId === postId)
    if (!post) return
    updateRoundStatus.mutate({
      seasonId: post.seasonId,
      roundId: postId,
      status: "OPEN",
    })
  }

  const handleDelete = (postId: string) => {
    if (useMockData) {
      lastDeletedPostRef.current =
        posts.find((post) => post.postId === postId) ?? null
      setPosts((prev) => prev.filter((post) => post.postId !== postId))
      return
    }
    const post = posts.find((item) => item.postId === postId)
    if (!post) return
    deleteRound.mutate({ seasonId: post.seasonId, roundId: postId })
  }

  // 실제 DELETE는 복구 불가(백엔드 명세)라 mock 모드에서만 되돌릴 수 있다.
  const handleUndoDelete = () => {
    if (!useMockData) return
    const restored = lastDeletedPostRef.current
    if (!restored) return
    setPosts((prev) => [...prev, restored])
    lastDeletedPostRef.current = null
  }

  // 복제본은 항상 원본 학교의 같은 시즌에 새 DRAFT로 저장됨
  const handleDuplicate = (postId: string) => {
    if (useMockData) {
      setPosts((prev) => {
        const source = prev.find((post) => post.postId === postId)
        if (!source) return prev
        return [
          ...prev,
          { ...source, postId: crypto.randomUUID(), status: "DRAFT" },
        ]
      })
      return
    }
    const post = posts.find((item) => item.postId === postId)
    if (!post) return
    // 같은 글을 여러 번 복제해도 제목이 겹치지 않도록 사용 가능한 제목을 먼저 찾는다.
    void resolveAvailableTitle(`${post.title} 복제본`, (title) =>
      checkRecruitingRoundTitleAvailability(post.seasonId, title).catch(
        () => true,
      ),
    ).then((title) => {
      cloneRound.mutate({
        seasonId: post.seasonId,
        roundId: postId,
        payload: {
          targetSeasonId: post.seasonId,
          title,
          type: post.type,
        },
      })
    })
  }

  // 공유 보관함이 보이는 뷰로 전환 (해당 학교가 속한 지부 탭 + 학교 드릴다운)
  const handleNavigateToArchive = (school: string) => {
    if (role === "chapterAdmin" || role === "schoolStaff") {
      setSchoolTab(school)
      return
    }
    const targetChapter = CHAPTERS.find((chapter) =>
      (SCHOOLS_BY_BRANCH[chapter] as readonly string[]).includes(school),
    )
    if (targetChapter) setChapterTab(targetChapter)
    setSelectedSchool(school)
  }

  const scopeChapters =
    chapterTab === "all"
      ? [...CHAPTERS]
      : isChapter(chapterTab)
        ? [chapterTab]
        : []
  const chapterGroups = groupPostsByChapter(posts, scopeChapters)
  const myChapterPosts = myChapter
    ? posts.filter((post) => post.chapter === myChapter)
    : []
  const myScopedPosts =
    schoolTab === "all"
      ? myChapterPosts
      : myChapterPosts.filter((post) => post.school === schoolTab)

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "recruitment-management", label: "모집 관리" },
          { id: "recruitment-list", label: "모집 목록" },
        ]}
        title="모집 목록"
        description="지부별, 학교별 모집 공고를 확인하고 관리합니다."
        className="pl-3"
      />
      <div className="mt-4 flex w-full items-center justify-end px-3">
        <FilterDropdown
          label="최신 순"
          multiSelect={false}
          className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
          open={sortOpen}
          onClick={() => setSortOpen((prev) => !prev)}
          onRequestClose={() => setSortOpen(false)}
          options={RECRUITMENT_SORT_OPTIONS}
          selectedValue={sort}
          selectedLabel={
            RECRUITMENT_SORT_OPTIONS.find((option) => option.value === sort)
              ?.label
          }
          onSelect={(value) => setSort(value as RecruitmentSort)}
        />
      </div>
      {!useMockData && (isRoundsLoading || isForbidden || isRoundsError) && (
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 w-full items-center justify-center rounded-[12px] border bg-white">
          {isRoundsLoading
            ? "불러오는 중입니다..."
            : isForbidden
              ? "이 화면을 조회할 권한이 없습니다."
              : "모집 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}
        </div>
      )}
      {role === "central" && (
        <ChapterTabs
          value={chapterTab}
          onValueChange={(value) => {
            setChapterTab(value)
            setSelectedSchool(null)
          }}
          className="mt-8"
        />
      )}
      {(role === "chapterAdmin" || role === "schoolStaff") && myChapter && (
        <SchoolTabs
          schools={SCHOOLS_BY_BRANCH[myChapter]}
          value={schoolTab}
          onValueChange={setSchoolTab}
          allLabel={role === "chapterAdmin" ? "지부 전체" : "학교 전체"}
          className="mt-8"
        />
      )}

      {role === "central" && (
        <div className="mt-8 flex flex-col gap-11">
          {chapterGroups.map(({ chapter, posts: chapterPosts }) => {
            const scopedPosts = selectedSchool
              ? chapterPosts.filter((post) => post.school === selectedSchool)
              : chapterPosts
            const canSeeArchive = chapterTab !== "all"

            return (
              <section key={chapter} className="flex flex-col">
                <div className="flex items-end justify-between px-3">
                  <div className="relative flex items-center gap-2.5">
                    <h2 className="text-heading-5-semibold text-teal-700">
                      {selectedSchool ?? chapter}
                    </h2>
                    {chapterTab !== "all" && (
                      <IconButton
                        variant="weak"
                        aria-label="학교 검색"
                        onClick={() => setSchoolSearchOpen((prev) => !prev)}
                        className="bg-teal-gray-100 text-teal-gray-700 hover:bg-teal-gray-150 h-7.5 min-h-7.5 w-7.5 min-w-0 rounded-[0.625rem] p-0"
                      >
                        <DownChevronIcon className="h-4 w-4" />
                      </IconButton>
                    )}
                    <RecruitmentSchoolSearchDropdown
                      open={schoolSearchOpen}
                      chapter={chapter}
                      onOpenChange={setSchoolSearchOpen}
                      onSelect={(school) => setSelectedSchool(school)}
                    />
                  </div>
                  {canSeeArchive && (
                    <RecruitmentCreateButton
                      onClick={() =>
                        navigate({
                          to: "/recruiting/recruitments/new",
                          search: {
                            role,
                            chapter,
                            school: selectedSchool ?? undefined,
                          },
                        })
                      }
                      className="translate-y-1"
                    />
                  )}
                </div>
                <RecruitmentPostListCard
                  chapter={chapter}
                  posts={scopedPosts}
                  permittedSeasonIds={permittedSeasonIds}
                  onPrivatize={handlePrivatize}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onUndoDelete={handleUndoDelete}
                  onNavigateToArchive={handleNavigateToArchive}
                  archiveVisibleOnPage={canSeeArchive}
                  schoolFilterActive={selectedSchool !== null}
                  className="mt-5"
                />
                {canSeeArchive && (
                  <div className="mt-11 flex flex-col gap-5">
                    <h2 className="text-heading-5-semibold pl-3 text-teal-700">
                      {chapter}
                    </h2>
                    <RecruitmentDraftArchiveCard
                      chapter={chapter}
                      posts={scopedPosts}
                      permittedSeasonIds={permittedSeasonIds}
                      onPublish={handlePublish}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onUndoDelete={handleUndoDelete}
                      selectedSchool={selectedSchool}
                    />
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {role === "chapterAdmin" && myChapter && (
        <RecruitmentOwnScopeSection
          chapter={myChapter}
          posts={myScopedPosts}
          schoolTab={schoolTab}
          permittedSeasonIds={permittedSeasonIds}
          onPrivatize={handlePrivatize}
          onPublish={handlePublish}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onUndoDelete={handleUndoDelete}
          onNavigateToArchive={handleNavigateToArchive}
          archiveVisible
          onCreate={() =>
            navigate({
              to: "/recruiting/recruitments/new",
              search: {
                role,
                chapter: myChapter,
                school: schoolTab,
              },
            })
          }
        />
      )}

      {role === "schoolStaff" && myChapter && (
        <RecruitmentOwnScopeSection
          chapter={myChapter}
          posts={myScopedPosts}
          schoolTab={schoolTab}
          permittedSeasonIds={permittedSeasonIds}
          onPrivatize={handlePrivatize}
          onPublish={handlePublish}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onUndoDelete={handleUndoDelete}
          onNavigateToArchive={handleNavigateToArchive}
          archiveVisible={schoolTab === viewerSchool}
          archiveTitle="공유 보관함"
        />
      )}
    </div>
  )
}
