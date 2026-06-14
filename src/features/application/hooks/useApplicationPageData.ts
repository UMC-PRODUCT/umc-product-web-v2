import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import { getProjectPmSearchScope } from "@/features/auth/model/identity"
import {
  getAllChapters,
  getAllSchools,
  getChaptersWithSchools,
} from "@/features/challenger/api/organization"
import { getActiveGisu } from "@/shared/api/gisu"

import {
  getAllProjects,
  getChapterStatistics,
  getManagedProjects,
  getMatchingRounds,
  getProjectApplications,
} from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"
import {
  shortenSchoolName,
  summaryToStats,
  toProjectApplication,
  toRoundNumber,
} from "../model/mappers"

import type { MatchingRoundResponse } from "../model/apiTypes"
import type {
  ApplicationStats,
  ProjectApplication,
  UniversityCount,
} from "../model/types"

// 매칭 라운드 목록에서 현재 활성 차수 번호 계산
// PM 결정 기간(endsAt ~ decisionDeadline)도 "활성"으로 판별
function getCurrentRound(rounds: MatchingRoundResponse[]): {
  currentRound: number | undefined
  activeRound: number | undefined
} {
  const now = Date.now()
  const active = rounds.find(
    (r) =>
      new Date(r.startsAt).getTime() <= now &&
      now <= new Date(r.decisionDeadline).getTime(),
  )
  if (active) {
    const round =
      active.phase === "FIRST" ? 1 : active.phase === "SECOND" ? 2 : 3
    return { currentRound: round, activeRound: round }
  }
  // 완료된 차수(decisionDeadline 지남) 중 가장 최근, 없으면 undefined
  const completed = [...rounds]
    .filter((r) => new Date(r.decisionDeadline).getTime() < now)
    .sort(
      (a, b) =>
        new Date(b.decisionDeadline).getTime() -
        new Date(a.decisionDeadline).getTime(),
    )
  const fallback =
    completed.length > 0
      ? completed[0]!.phase === "FIRST"
        ? 1
        : completed[0]!.phase === "SECOND"
          ? 2
          : 3
      : undefined
  return { currentRound: fallback, activeRound: undefined }
}

// 활성 기수 ID 조회
export function useActiveGisuId() {
  return useQuery({
    queryKey: ["gisu", "active"],
    queryFn: getActiveGisu,
    staleTime: 5 * 60 * 1000,
    select: (data) => (data?.gisuId != null ? Number(data.gisuId) : null),
  })
}

// PM 챌린저 뷰용 데이터
export function useChallengerPageData() {
  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const meQuery = useMe()
  const chapterId = useMemo(
    () => getProjectPmSearchScope(meQuery.data).chapterId,
    [meQuery.data],
  )

  const challengerStatsQuery = useQuery({
    queryKey: applicationKeys.chapterStatistics(Number(chapterId) || 0),
    queryFn: () => getChapterStatistics(Number(chapterId)!),
    enabled: !!chapterId,
  })

  // 차수별 지원 가용 인원 맵 (1차: 챕터 전체, 2차~: 이전 매칭 인원 차감)
  const availablePerRound = useMemo(() => {
    const map = new Map<number, number>()
    for (const r of challengerStatsQuery.data?.summary
      .roundApplicationStatistics ?? []) {
      map.set(
        toRoundNumber(r.matchingRound.phase),
        Number(r.availableMemberCount),
      )
    }
    return map
  }, [challengerStatsQuery.data])

  const projectsQuery = useQuery({
    queryKey: applicationKeys.managedProjects(gisuId),
    queryFn: () => getManagedProjects(gisuId),
    enabled: gisuId > 0,
  })

  // 매칭 차수 조회 (PM은 챕터 선택 없으므로 전체 조회)
  const roundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(undefined),
    queryFn: () => getMatchingRounds(),
  })
  const { currentRound, activeRound } = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 프로젝트 목록이 로드되면 각 프로젝트의 지원자 목록도 함께 조회
  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  const applicantsQuery = useQuery({
    queryKey: [
      ...applicationKeys.all,
      "managed-applicants",
      gisuId,
      projects.map((p) => p.id),
    ],
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (p) => {
          const applicants = await getProjectApplications(Number(p.id))
          return { projectId: p.id, applicants }
        }),
      )
      return new Map(results.map((r) => [String(r.projectId), r.applicants]))
    },
    enabled: projects.length > 0,
  })

  // 서버 데이터 -> 프론트 타입으로 변환
  const transformed: ProjectApplication[] = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(String(p.id)) ?? []),
      ),
    [projects, applicantsQuery.data],
  )

  // PM 프로젝트 정보 (프로젝트 카드용)
  const projectInfo = useMemo(() => {
    const firstProject = projects[0]
    if (!firstProject) return null
    return {
      projectName: firstProject.name,
      pmName:
        firstProject.productOwner.nickname || firstProject.productOwner.name,
      pmUniversity: firstProject.productOwner.schoolName,
      thumbnailUrl: firstProject.thumbnailImageUrl || undefined,
    }
  }, [projects])

  return {
    projects: transformed,
    projectInfo,
    currentRound,
    activeRound,
    availablePerRound,
    isLoading:
      gisuQuery.isLoading ||
      roundsQuery.isLoading ||
      projectsQuery.isLoading ||
      applicantsQuery.isLoading,
    isError: gisuQuery.isError || projectsQuery.isError,
    error: gisuQuery.error ?? projectsQuery.error ?? applicantsQuery.error,
  }
}

// 챕터 목록 조회 (name -> id 매핑용)
export function useChapters() {
  return useQuery({
    queryKey: applicationKeys.chapters(),
    queryFn: getAllChapters,
  })
}

// Admin 뷰용 데이터
export function useAdminPageData(chapterName?: string, schoolName?: string) {
  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  // 지부별 학교 ID 조회 (schoolMatchingStatistics 필터링용)
  const chaptersWithSchoolsQuery = useQuery({
    queryKey: ["chapters-with-schools", gisuId],
    queryFn: () => getChaptersWithSchools(String(gisuId)),
    enabled: gisuId > 0,
  })
  const chapterSchoolIds = useMemo(() => {
    if (!chapterName || !chaptersWithSchoolsQuery.data) return null
    const chapter = chaptersWithSchoolsQuery.data.chapters.find(
      (c) => c.chapterName === chapterName,
    )
    if (!chapter) return null
    return new Set(chapter.schools.map((s) => String(s.schoolId)))
  }, [chapterName, chaptersWithSchoolsQuery.data])

  // 선택된 챕터 이름 -> chapterId 매핑
  const chapterId = useMemo(() => {
    if (!chapterName || chapters.length === 0) return undefined
    const found = chapters.find((c) => c.name === chapterName)
    return found ? Number(found.id) : undefined
  }, [chapterName, chapters])

  // 전체 프로젝트 목록 조회 (지원자 테이블용)
  const projectsQuery = useQuery({
    queryKey: applicationKeys.allProjects(gisuId, chapterId),
    queryFn: () => getAllProjects(gisuId, { chapterId, size: 100 }),
    enabled: gisuId > 0,
  })

  const projects = useMemo(() => {
    const content = projectsQuery.data?.content ?? []
    // SCHOOL_PRESIDENT: 본인 학교 소속 PM의 프로젝트만 표시
    if (!schoolName) return content
    return content.filter((p) => p.productOwner.schoolName === schoolName)
  }, [projectsQuery.data, schoolName])

  // 각 프로젝트의 지원자 목록 조회 (테이블 + 학교별 통계용)
  const applicantsQuery = useQuery({
    queryKey: [
      ...applicationKeys.all,
      "admin-applicants",
      gisuId,
      chapterId,
      projects.map((p) => p.id),
    ],
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (p) => {
          const applicants = await getProjectApplications(Number(p.id))
          return { projectId: p.id, applicants }
        }),
      )
      return new Map(results.map((r) => [String(r.projectId), r.applicants]))
    },
    enabled: projects.length > 0,
  })

  // 전체 학교 목록 조회 (schoolId -> schoolName 매핑용)
  const schoolsQuery = useQuery({
    queryKey: ["schools", "all"],
    queryFn: getAllSchools,
  })
  const schoolIdToName = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of schoolsQuery.data?.schools ?? []) {
      map.set(s.schoolId, s.schoolName)
    }
    return map
  }, [schoolsQuery.data])

  // 매칭 차수 조회 (현재 진행 차수 계산용)
  const roundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
  })
  const { currentRound, activeRound } = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 지부 통계 조회 (rounds, totalMembers, projectRounds, topProjects)
  const chapterStatsQuery = useQuery({
    queryKey: applicationKeys.chapterStatistics(chapterId ?? 0),
    queryFn: () => getChapterStatistics(chapterId!),
    enabled: !!chapterId,
  })

  // projectId -> name 맵 (키를 String으로 통일)
  const projectIdToName = useMemo(
    () => new Map(projects.map((p) => [String(p.id), p.name])),
    [projects],
  )

  // 서버 데이터 -> 프론트 타입 변환 (테이블용)
  const transformed: ProjectApplication[] = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(String(p.id)) ?? []),
      ),
    [projects, applicantsQuery.data],
  )

  // 통계: summary 기반
  // universities.applied = roundSchoolRankings 전 차수 지원자 수 합산 (매칭 완료 수 아님)
  // 서버가 schoolMatchingStatistics/roundSchoolRankings를 챕터 필터링 없이 내려주므로 프론트에서 필터링
  const stats: ApplicationStats = useMemo(() => {
    if (!chapterStatsQuery.data) {
      return {
        totalMembers: 0,
        completionRate: 0,
        completedCount: 0,
        pendingCount: 0,
        rounds: [],
        topProjects: [],
        universities: [],
        projectRounds: [],
      }
    }

    // 해당 챕터 소속 학교 + 프로젝트만 필터링 (로딩 중엔 빈 Set으로 필터링해 flicker 방지)
    const filteredSummary = chapterName
      ? {
          ...chapterStatsQuery.data.summary,
          schoolMatchingStatistics:
            chapterStatsQuery.data.summary.schoolMatchingStatistics.filter(
              (s) => (chapterSchoolIds ?? new Set()).has(String(s.schoolId)),
            ),
          projectRoundStatistics:
            chapterStatsQuery.data.summary.projectRoundStatistics.filter((p) =>
              projectIdToName.has(String(p.projectId)),
            ),
        }
      : chapterStatsQuery.data.summary

    const partial = summaryToStats(filteredSummary, projectIdToName)

    // 학교별 지원자 수 집계 (roundSchoolRankings 전 차수 합산, 챕터 소속 학교만)
    const schoolApplicantCounts = new Map<string, number>()
    for (const ranking of chapterStatsQuery.data.summary.roundSchoolRankings ??
      []) {
      for (const s of ranking.schools) {
        const id = String(s.schoolId)
        if (chapterSchoolIds && !chapterSchoolIds.has(id)) continue
        schoolApplicantCounts.set(
          id,
          (schoolApplicantCounts.get(id) ?? 0) + Number(s.applicantCount),
        )
      }
    }

    const universities: UniversityCount[] =
      filteredSummary.schoolMatchingStatistics
        .map((s) => ({
          name: shortenSchoolName(
            schoolIdToName.get(String(s.schoolId)) ?? String(s.schoolId),
          ),
          applied: schoolApplicantCounts.get(String(s.schoolId)) ?? 0,
          total: Number(s.totalMemberCount),
        }))
        .sort((a, b) => b.applied - a.applied)
        .slice(0, 5)
    return { ...partial, universities }
  }, [
    chapterStatsQuery.data,
    projectIdToName,
    schoolIdToName,
    chapterName,
    chapterSchoolIds,
  ])

  return {
    projects: transformed,
    stats,
    currentRound,
    activeRound,
    dataUpdatedAt: applicantsQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt,
    chapters,
    isLoading:
      gisuQuery.isLoading ||
      chaptersQuery.isLoading ||
      roundsQuery.isLoading ||
      projectsQuery.isLoading ||
      applicantsQuery.isLoading ||
      chapterStatsQuery.isLoading,
    isError:
      gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError,
    error: gisuQuery.error ?? chaptersQuery.error ?? projectsQuery.error,
  }
}
