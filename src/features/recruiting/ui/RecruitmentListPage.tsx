import { useNavigate } from "@tanstack/react-router"
import { useMemo, useRef, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
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
import {
  applyScopeFilters,
  resolveRecruitingScope,
} from "../model/recruitingScope"
import { resolveAvailableTitle } from "../model/recruitmentCreate"
import {
  groupPostsByChapter,
  mapRoundGroupsToPosts,
  RECRUITMENT_SORT_OPTIONS,
} from "../model/recruitmentList"
import {
  RECRUITING_MY_CHAPTER_MOCK,
  RECRUITING_MY_SCHOOL_MOCK,
  RECRUITMENT_LIST_MOCK,
} from "../model/recruitmentList.mock"
import { ChapterTabs } from "./ChapterTabs"
import { RecruitmentCreateButton } from "./RecruitmentCreateButton"
import { RecruitmentDraftArchiveCard } from "./RecruitmentDraftArchiveCard"
import { RecruitmentOwnScopeSection } from "./RecruitmentOwnScopeSection"
import { RecruitmentPostListCard } from "./RecruitmentPostListCard"
import { RecruitmentSchoolSearchDropdown } from "./RecruitmentSchoolSearchDropdown"
import { SchoolTabs } from "./SchoolTabs"

import type { RecruitingListRole } from "../model/recruitingListRole"
import type { RecruitingScope } from "../model/recruitingScope"
import type { RecruitmentPost, RecruitmentSort } from "../model/recruitmentList"

interface RecruitmentListPageProps {
  // 테스트 라우트(/test/recruiting-recruitments)에서 역할별 화면을 미리 보기 위한 override.
  // 생략하면 로그인한 사용자의 실제 역할로 판정한다.
  role?: RecruitingListRole
  useMockData?: boolean
}

// 테스트 라우트 전용: 실 데이터 없이 role만으로 조회 스코프를 흉내낸다.
// 실 데이터 경로는 resolveRecruitingScope(권한 조회 결과)를 그대로 쓴다.
function buildMockScope(role: RecruitingListRole): RecruitingScope {
  if (role === "central") {
    return {
      groups: [],
      chapters: [...CHAPTERS],
      schools: [],
      isFallback: false,
    }
  }
  if (role === "chapterAdmin") {
    return {
      groups: [],
      chapters: [RECRUITING_MY_CHAPTER_MOCK],
      schools: [...SCHOOLS_BY_BRANCH[RECRUITING_MY_CHAPTER_MOCK]],
      isFallback: false,
    }
  }
  return {
    groups: [],
    chapters: [RECRUITING_MY_CHAPTER_MOCK],
    schools: [RECRUITING_MY_SCHOOL_MOCK],
    isFallback: true,
  }
}

function filterMockPosts(
  posts: RecruitmentPost[],
  showChapterTabs: boolean,
  showSchoolTabs: boolean,
  chapterTab: string,
  schoolTab: string,
): RecruitmentPost[] {
  if (showChapterTabs) {
    return chapterTab === "all"
      ? posts
      : posts.filter((post) => post.chapter === chapterTab)
  }
  if (showSchoolTabs && schoolTab !== "all") {
    return posts.filter((post) => post.school === schoolTab)
  }
  return posts
}

export function RecruitmentListPage({
  role: roleOverride,
  useMockData = false,
}: RecruitmentListPageProps) {
  const navigate = useNavigate()
  const { data: me } = useMe()
  // RecruitmentCreatePage(BasicInfoForm)가 진입 지점별 필드 잠금에 쓰는 값이라
  // role 자체는 계속 넘긴다. 이 화면의 조회 범위는 더 이상 role로 가르지 않고
  // resolveRecruitingScope의 실제 EDIT 권한 결과를 따른다.
  const role = roleOverride ?? resolveRecruitingListRole(me)
  const viewerSchool = resolveViewerSchool(me)
  const viewerChapterName = resolveViewerChapter(me)
  const viewerChapter = isChapter(viewerChapterName)
    ? viewerChapterName
    : undefined

  const [chapterTab, setChapterTab] = useState("all")
  const [schoolTab, setSchoolTab] = useState("all")
  const [schoolSearchOpen, setSchoolSearchOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  // 지부별 카드가 각자 정렬 컨트롤을 갖던 이전 UI와 달리, 데이터는 페이지
  // 전체를 한 번에 조회하는 단일 API 호출이라 정렬도 페이지 전체가 공유한다.
  const [sort, setSort] = useState<RecruitmentSort>("NEWEST")
  const [sortOpen, setSortOpen] = useState(false)

  const {
    groups,
    isLoading: isRoundsLoading,
    isError: isRoundsError,
    isForbidden,
  } = useAdminRecruitingRounds(sort)

  // 편집 권한은 role이 아니라 시즌 단위 실제 EDIT 권한으로 판정한다(canEditRecruitmentPost 참고).
  const seasonIds = useMemo(
    () => [...new Set(groups.map((group) => group.seasonId))],
    [groups],
  )
  const { permittedSeasonIds } = useRecruitingPermissions(seasonIds)

  // EDIT 권한이 있는 시즌이 조회 범위. 권한이 하나도 없으면 내 학교로 좁혀 시도한다
  // (resolveRecruitingScope 참고). 지부가 여럿이면 지부 탭, 한 지부에 학교가
  // 여럿이면 학교 탭으로 가른다 — role 기반 3분기 렌더링을 대체한다.
  const scope = useMemo(
    () => resolveRecruitingScope(groups, permittedSeasonIds, viewerSchool),
    [groups, permittedSeasonIds, viewerSchool],
  )
  const mockScope = useMemo(() => buildMockScope(role), [role])
  const activeScope = useMockData ? mockScope : scope
  // 세그먼트(지부/학교 탭) 노출은 현재 조회된 데이터 양이 아니라 역할 자체로 정한다.
  // central=지부 세그먼트, chapterAdmin/schoolStaff=학교 세그먼트 — 게시글이
  // 하나도 없어도(혹은 EDIT 권한 조회가 아직 비어도) 세그먼트는 항상 보여야 한다.
  const showChapterTabs = role === "central"
  const ownScopeChapter = useMockData
    ? RECRUITING_MY_CHAPTER_MOCK
    : viewerChapter
  const showSchoolTabs =
    (role === "chapterAdmin" || role === "schoolStaff") && !!ownScopeChapter

  const authorLabel = me
    ? `${me.nickname}/${me.name} · ${formatSchoolName(me.schoolName)}`
    : undefined

  const fetchedPosts = useMemo(() => {
    const scopedGroups = applyScopeFilters(
      scope,
      chapterTab,
      schoolTab,
      scope.chapters,
    )
    return mapRoundGroupsToPosts(scopedGroups, authorLabel)
  }, [scope, chapterTab, schoolTab, authorLabel])

  // mock 모드(테스트 라우트 전용)만 낙관적 업데이트를 위한 로컬 state가 필요하다.
  // 실제 모드는 mutation 성공 후 재조회된 fetchedPosts를 그대로 파생값으로 쓴다.
  const [mockPosts, setMockPosts] = useState<RecruitmentPost[]>(
    RECRUITMENT_LIST_MOCK,
  )
  const viewPosts = useMockData
    ? filterMockPosts(
        mockPosts,
        showChapterTabs,
        showSchoolTabs,
        chapterTab,
        schoolTab,
      )
    : fetchedPosts
  // 탭 필터와 무관하게 스코프 전체에서 postId로 찾아야 하는 액션(발행/삭제 등)에 쓴다.
  const basePosts = useMockData
    ? mockPosts
    : mapRoundGroupsToPosts(scope.groups)
  const setPosts = setMockPosts
  const lastDeletedPostRef = useRef<RecruitmentPost | null>(null)

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
    const post = basePosts.find((item) => item.postId === postId)
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
    const post = basePosts.find((item) => item.postId === postId)
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
        basePosts.find((post) => post.postId === postId) ?? null
      setPosts((prev) => prev.filter((post) => post.postId !== postId))
      return
    }
    const post = basePosts.find((item) => item.postId === postId)
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
    const post = basePosts.find((item) => item.postId === postId)
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

  // 공유 보관함이 보이는 뷰로 전환 (지부 탭이 없는 스코프는 학교 탭만 바꾸고,
  // 지부 탭이 있는 스코프는 해당 학교가 속한 지부 탭 + 학교 드릴다운으로 전환)
  const handleNavigateToArchive = (school: string) => {
    if (!showChapterTabs) {
      setSchoolTab(school)
      return
    }
    const targetChapter = CHAPTERS.find((chapter) =>
      (SCHOOLS_BY_BRANCH[chapter] as readonly string[]).includes(school),
    )
    if (targetChapter) setChapterTab(targetChapter)
    setSelectedSchool(school)
  }

  // central 세그먼트는 데이터 유무와 무관하게 조직의 전체 지부를 보여준다.
  const centralChapters =
    chapterTab === "all"
      ? [...CHAPTERS]
      : isChapter(chapterTab)
        ? [chapterTab]
        : []
  const chapterGroups = groupPostsByChapter(viewPosts, centralChapters)

  const ownScopeSchools = ownScopeChapter
    ? SCHOOLS_BY_BRANCH[ownScopeChapter]
    : []
  // 학교 탭이 없는 단일 학교 스코프에서는 schoolTab이 항상 "all"로 머무르므로,
  // 헤딩·보관함·생성 버튼 판단에는 실제 학교 이름을 대신 쓴다.
  const ownScopeSchoolTab = showSchoolTabs
    ? schoolTab
    : ((useMockData ? RECRUITING_MY_SCHOOL_MOCK : viewerSchool) ?? schoolTab)

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
      {!useMockData && (isRoundsLoading || isForbidden || isRoundsError) ? (
        <div className="border-teal-gray-100 text-body-2-regular text-teal-gray-500 mt-8 flex min-h-50 w-full items-center justify-center rounded-[12px] border bg-white">
          {isRoundsLoading
            ? "불러오는 중입니다..."
            : isForbidden
              ? "이 화면을 조회할 권한이 없습니다."
              : "모집 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."}
        </div>
      ) : (
        <>
          {showChapterTabs && (
            <ChapterTabs
              value={chapterTab}
              onValueChange={(value) => {
                setChapterTab(value)
                setSelectedSchool(null)
              }}
              className="mt-8"
            />
          )}
          {!showChapterTabs && showSchoolTabs && (
            <SchoolTabs
              schools={ownScopeSchools}
              value={schoolTab}
              onValueChange={setSchoolTab}
              allLabel={role === "chapterAdmin" ? "지부 전체" : "학교 전체"}
              className="mt-8"
            />
          )}

          {showChapterTabs && (
            <div className="mt-8 flex flex-col gap-11">
              {chapterGroups.map(({ chapter, posts: chapterPosts }) => {
                const scopedPosts = selectedSchool
                  ? chapterPosts.filter(
                      (post) => post.school === selectedSchool,
                    )
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

          {!showChapterTabs && ownScopeChapter && (
            <RecruitmentOwnScopeSection
              chapter={ownScopeChapter}
              posts={viewPosts}
              schoolTab={ownScopeSchoolTab}
              permittedSeasonIds={permittedSeasonIds}
              onPrivatize={handlePrivatize}
              onPublish={handlePublish}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onUndoDelete={handleUndoDelete}
              onNavigateToArchive={handleNavigateToArchive}
              archiveVisible
              archiveTitle={activeScope.isFallback ? "공유 보관함" : undefined}
              onCreate={
                activeScope.isFallback
                  ? undefined
                  : () =>
                      navigate({
                        to: "/recruiting/recruitments/new",
                        search: {
                          role,
                          chapter: ownScopeChapter,
                          school: ownScopeSchoolTab,
                        },
                      })
              }
            />
          )}
        </>
      )}
    </div>
  )
}
