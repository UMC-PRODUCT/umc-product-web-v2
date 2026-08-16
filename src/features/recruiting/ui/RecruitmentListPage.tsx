import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useRef, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { isChapter } from "@/entities/organization/model/chapters"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"
import { IconButton } from "@/shared/ui/button/IconButton"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { recruitingKeys } from "../api/queryKeys"
import {
  checkRecruitingRoundTitleAvailability,
  cloneRecruitingRound,
} from "../api/recruitingApi"
import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
import { useRecruitingPermissions } from "../hooks/useRecruitingPermissions"
import {
  useDeleteRecruitingRound,
  useRestoreRecruitingRound,
  useUpdateRecruitingRoundStatus,
} from "../hooks/useRecruitmentListMutations"
import {
  MAX_ADDITIONAL_ROUND_NO,
  resolveAdditionalRoundNoOptions,
} from "../model/additionalRoundNo"
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
  buildDuplicateTargetSeasons,
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
import type {
  DuplicateOutcome,
  RecruitmentPost,
  RecruitmentSort,
} from "../model/recruitmentList"

interface RecruitmentListPageProps {
  role?: RecruitingListRole
  useMockData?: boolean
}

function buildMockScope(
  role: RecruitingListRole,
  serverChapterNames: string[],
): RecruitingScope {
  const branchMap = SCHOOLS_BY_BRANCH as Record<string, readonly string[]>
  if (role === "central") {
    return {
      groups: [],
      chapters: serverChapterNames,
      schools: [],
      isFallback: false,
    }
  }
  if (role === "chapterAdmin") {
    return {
      groups: [],
      chapters: [RECRUITING_MY_CHAPTER_MOCK],
      schools: [...(branchMap[RECRUITING_MY_CHAPTER_MOCK] ?? [])],
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
  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const { chapterNames: serverChapterNames } = useSchoolChapterMap()
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
    refetch: refetchRounds,
    // 다른 운영진이 공고를 올리거나 마감 처리하는 목록이다. 5분 캐시로 두면 그
    // 변화가 한참 뒤에 보인다. 주기적으로 캐묻는 대신 화면에 들어오거나 창으로
    // 돌아온 순간에만 다시 받아 온다.
  } = useAdminRecruitingRounds(sort, { fresh: true })

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
  // 복제 모달의 "다른 학교로 복제" 후보. scope.groups가 이미 EDIT 권한이 있는
  // 시즌만 남긴 목록이라 별도 권한 필터링이 필요 없다.
  const duplicateCandidateSeasons = useMemo(
    () => buildDuplicateTargetSeasons(scope.groups),
    [scope.groups],
  )
  const mockScope = useMemo(
    () => buildMockScope(role, serverChapterNames),
    [role, serverChapterNames],
  )
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

  // 작성자 표시(RecruitmentPost.authorLabel)는 라운드별 실제 작성자(round.author,
  // mapRoundGroupsToPosts 참고)로 채워진다. 예전에는 여기서 "현재 로그인한 나"를
  // 대신 채워 넣어서 다른 운영진이 만든 임시저장 글도 전부 "작성자: 나"로 잘못
  // 보였다.
  const fetchedPosts = useMemo(() => {
    const scopedGroups = applyScopeFilters(
      scope,
      chapterTab,
      schoolTab,
      scope.chapters,
    )
    return mapRoundGroupsToPosts(scopedGroups)
  }, [scope, chapterTab, schoolTab])

  // mock 모드(테스트 라우트 전용)만 낙관적 업데이트를 위한 로컬 state가 필요하다.
  // 실제 모드는 mutation 성공 후 재조회된 fetchedPosts를 그대로 파생값으로 쓴다.
  const [mockPosts, setMockPosts] = useState<RecruitmentPost[]>(
    RECRUITMENT_LIST_MOCK,
  )
  // 삭제(soft delete)는 서버에서 복구 가능하지만, 목록 API가 삭제된 Round를
  // 자동 제외하는 시점(재조회 완료)까지는 시차가 있다. 그동안 목록에서만
  // 낙관적으로 숨긴다(handleDelete 참고). mock 모드는 이 state를 안 쓰므로
  // (즉시 mockPosts에서 제거) 필터는 항상 no-op.
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(
    new Set(),
  )
  const viewPosts = (
    useMockData
      ? filterMockPosts(
          mockPosts,
          showChapterTabs,
          showSchoolTabs,
          chapterTab,
          schoolTab,
        )
      : fetchedPosts
  ).filter((post) => !pendingDeleteIds.has(post.postId))
  // 탭 필터와 무관하게 스코프 전체에서 postId로 찾아야 하는 액션(발행/삭제 등)에 쓴다.
  const basePosts = useMockData
    ? mockPosts
    : mapRoundGroupsToPosts(scope.groups)
  const setPosts = setMockPosts
  const lastDeletedPostRef = useRef<RecruitmentPost | null>(null)
  // "실행취소"는 postId를 안 받는 단일 액션이라(onUndoDelete: () => void),
  // 가장 최근에 삭제한 것 하나만 복구할 수 있다 — mock 모드의 lastDeletedPostRef와
  // 같은 제약. 복구 API(restoreRecruitingRound)는 seasonId도 필요해 함께 담아둔다.
  const lastPendingDeletePostRef = useRef<{
    seasonId: string
    roundId: string
  } | null>(null)

  const updateRoundStatus = useUpdateRecruitingRoundStatus()
  const deleteRound = useDeleteRecruitingRound()
  const restoreRound = useRestoreRecruitingRound()
  const isDuplicatingRef = useRef(false)

  // mutateAsync를 써서 실제 API 응답을 기다린 뒤에만 호출부(RecruitmentPostMoreMenu)가
  // "성공" 토스트를 띄우게 한다. 실패 토스트는 updateRoundStatus 훅의 onError가 전담한다.
  const handlePrivatize = (postId: string): Promise<void> => {
    if (useMockData) {
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId ? { ...post, status: "DRAFT" } : post,
        ),
      )
      return Promise.resolve()
    }
    const post = basePosts.find((item) => item.postId === postId)
    if (!post) return Promise.reject(new Error("post not found"))
    return updateRoundStatus
      .mutateAsync({
        seasonId: post.seasonId,
        roundId: postId,
        status: "DRAFT",
      })
      .then(() => undefined)
  }

  const handlePublish = (postId: string): Promise<void> => {
    if (useMockData) {
      setPosts((prev) =>
        prev.map((post) =>
          post.postId === postId ? { ...post, status: "OPEN" } : post,
        ),
      )
      return Promise.resolve()
    }
    const post = basePosts.find((item) => item.postId === postId)
    if (!post) return Promise.reject(new Error("post not found"))
    return updateRoundStatus
      .mutateAsync({
        seasonId: post.seasonId,
        roundId: postId,
        status: "OPEN",
      })
      .then(() => undefined)
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

    lastPendingDeletePostRef.current = {
      seasonId: post.seasonId,
      roundId: postId,
    }
    setPendingDeleteIds((prev) => new Set(prev).add(postId))

    deleteRound.mutate(
      { seasonId: post.seasonId, roundId: postId },
      {
        onError: () => {
          setPendingDeleteIds((prev) => {
            const next = new Set(prev)
            next.delete(postId)
            return next
          })
        },
      },
    )
  }

  // 삭제 토스트의 "취소하기" 액션. 서버가 삭제를 soft delete로 처리해두므로
  // 실제 복구 API(restoreRecruitingRound)를 호출한다 — 실패하면(예: 삭제 후
  // 같은 슬롯에 새 Round가 생겨 충돌) useRestoreRecruitingRound가 에러 토스트를
  // 띄우고, 목록은 삭제된 채로 유지된다.
  const handleUndoDelete = () => {
    if (useMockData) {
      const restored = lastDeletedPostRef.current
      if (!restored) return
      setPosts((prev) => [...prev, restored])
      lastDeletedPostRef.current = null
      return
    }
    const target = lastPendingDeletePostRef.current
    if (!target) return
    lastPendingDeletePostRef.current = null

    restoreRound.mutate(target, {
      onSuccess: () => {
        setPendingDeleteIds((prev) => {
          const next = new Set(prev)
          next.delete(target.roundId)
          return next
        })
      },
    })
  }

  const handleDuplicate = (
    postId: string,
    targetSeasonIds?: string[],
  ): Promise<DuplicateOutcome> => {
    if (useMockData) {
      setPosts((prev) => {
        const source = prev.find((post) => post.postId === postId)
        if (!source) return prev
        return [
          ...prev,
          { ...source, postId: crypto.randomUUID(), status: "DRAFT" },
        ]
      })
      return Promise.resolve({ succeededCount: 1, failedCount: 0 })
    }
    if (isDuplicatingRef.current) {
      return Promise.reject(new Error("clone pending"))
    }
    const post = basePosts.find((item) => item.postId === postId)
    if (!post) return Promise.reject(new Error("post not found"))

    const targets = targetSeasonIds?.length ? targetSeasonIds : [post.seasonId]

    isDuplicatingRef.current = true
    // roundNo/제목 중복은 화면에 캐시된 groups(staleTime 5분)가 아니라 매번 새로
    // 받아온 목록으로 계산해야 한다. 캐시가 갱신되기 전에 연달아 복제하면 직전
    // 복제로 이미 쓰인 번호를 또 계산해 RECRUITING-0116("이전 차수 다음 번호")
    // 충돌이 난다.
    return refetchRounds()
      .then(({ data: freshGroups }) => {
        const cloneToSeason = (targetSeasonId: string) => {
          const targetRounds =
            freshGroups?.find((group) => group.seasonId === targetSeasonId)
              ?.rounds ?? []
          // 추가모집(ADDITIONAL) 차수 번호는 REGULAR와 별개의 독립된 시퀀스다
          // (resolveAdditionalRoundNoOptions 참고, "정규 모집은 추가 모집
          // 번호와 무관하다"). 시즌 전체 라운드를 섞어서 최댓값+1을 구하면
          // REGULAR의 roundNo(항상 1)가 끼어들어, ADDITIONAL 라운드가 아직
          // 하나도 없는 시즌(다른 학교로 처음 복제하는 경우 흔하다)에서 실제
          // 다음 번호(1)보다 하나 큰 값(2)을 보내 RECRUITING-0116으로 거절된다.
          const { nextRoundNo } = resolveAdditionalRoundNoOptions(
            targetRounds,
            MAX_ADDITIONAL_ROUND_NO,
          )
          if (nextRoundNo === undefined) {
            return Promise.reject(
              new Error("추가 모집 차수를 더 만들 수 없습니다."),
            )
          }
          // 같은 글을 여러 학교에 복제해도 제목이 겹치지 않도록 대상 학교(시즌)
          // 별로 사용 가능한 제목을 먼저 찾는다. "복제본" 문구 대신 꼬릿말
          // 숫자를 붙인다 — 원본 제목은 이미 사용 중이라 항상 2부터 시작해서
          // 복제할 때마다 +1씩 늘어난다.
          return resolveAvailableTitle(post.title, (title) =>
            checkRecruitingRoundTitleAvailability(targetSeasonId, title).catch(
              () => true,
            ),
          ).then((title) =>
            cloneRecruitingRound(post.seasonId, postId, {
              targetSeasonId,
              title,
              type: "ADDITIONAL",
              roundNo: nextRoundNo,
            }),
          )
        }

        return Promise.allSettled(targets.map(cloneToSeason))
      })
      .then((results) => {
        void queryClient.invalidateQueries({
          queryKey: recruitingKeys.rounds(),
        })
        const failedCount = results.filter(
          (result) => result.status === "rejected",
        ).length
        return { succeededCount: results.length - failedCount, failedCount }
      })
      .finally(() => {
        isDuplicatingRef.current = false
      })
  }

  const branchMap = SCHOOLS_BY_BRANCH as Record<string, readonly string[]>

  // 공유 보관함이 보이는 뷰로 전환 (지부 탭이 없는 스코프는 학교 탭만 바꾸고,
  // 지부 탭이 있는 스코프는 해당 학교가 속한 지부 탭 + 학교 드릴다운으로 전환)
  const handleNavigateToArchive = (school: string) => {
    if (!showChapterTabs) {
      setSchoolTab(school)
      return
    }
    const targetChapter = serverChapterNames.find((chapter: string) =>
      (branchMap[chapter] ?? []).includes(school),
    )
    if (targetChapter) setChapterTab(targetChapter)
    setSelectedSchool(school)
  }

  // central 세그먼트는 데이터 유무와 무관하게 조직의 전체 지부를 보여준다.
  const centralChapters =
    chapterTab === "all"
      ? serverChapterNames
      : isChapter(chapterTab)
        ? [chapterTab]
        : []
  const chapterGroups = groupPostsByChapter(viewPosts, centralChapters)

  const ownScopeSchools = ownScopeChapter
    ? (branchMap[ownScopeChapter] ?? [])
    : []
  // 학교 탭이 없는 단일 학교 스코프에서는 schoolTab이 항상 "all"로 머무르므로,
  // 헤딩·보관함·생성 버튼 판단에는 실제 학교 이름을 대신 쓴다.
  const ownScopeSchoolTab = showSchoolTabs
    ? schoolTab
    : ((useMockData ? RECRUITING_MY_SCHOOL_MOCK : viewerSchool) ?? schoolTab)
  // 학교 회장단은 같은 지부의 다른 학교 탭도 조회할 수 있지만(공유 보관함),
  // 생성 권한은 본인 소속 학교뿐이다 — 서버도 schoolId 불일치면 403으로 막는다.
  // viewerSchool은 백엔드 정식 명칭("한국항공대학교")이라 축약형 탭 값과
  // 그대로 비교하면 본인 학교 탭에서도 항상 어긋난다(recruitingScope.ts 참고).
  const viewerSchoolAbbr = useMockData
    ? RECRUITING_MY_SCHOOL_MOCK
    : formatSchoolName(viewerSchool)
  const isOtherSchoolTab =
    role === "schoolStaff" &&
    !!viewerSchoolAbbr &&
    ownScopeSchoolTab !== viewerSchoolAbbr

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
                      role={role}
                      posts={scopedPosts}
                      permittedSeasonIds={permittedSeasonIds}
                      duplicateCandidateSeasons={duplicateCandidateSeasons}
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
                          role={role}
                          posts={scopedPosts}
                          permittedSeasonIds={permittedSeasonIds}
                          duplicateCandidateSeasons={duplicateCandidateSeasons}
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
              role={role}
              posts={viewPosts}
              schoolTab={ownScopeSchoolTab}
              permittedSeasonIds={permittedSeasonIds}
              duplicateCandidateSeasons={duplicateCandidateSeasons}
              onPrivatize={handlePrivatize}
              onPublish={handlePublish}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onUndoDelete={handleUndoDelete}
              onNavigateToArchive={handleNavigateToArchive}
              archiveVisible
              archiveTitle={activeScope.isFallback ? "공유 보관함" : undefined}
              onCreate={
                activeScope.isFallback || isOtherSchoolTab
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
