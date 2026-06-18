import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import { getLatestChallengerRecord } from "@/features/auth/model/identity"
import {
  getAllChapters,
  getAllSchools,
  getChaptersWithSchools,
} from "@/features/challenger/api/organization"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"

import {
  getAllProjects,
  getChapterStatistics,
  getManagedProjects,
  getMatchingRounds,
  getProjectApplications,
  getProjectStatistics,
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

const EMPTY_SET = new Set<string>()

interface ApplicationPageDataOptions {
  enabled?: boolean
}

// 매칭 라운드 목록에서 현재 활성 차수 번호 계산
// PM 결정 기간(endsAt ~ decisionDeadline)도 "활성"으로 판별
function getCurrentRound(rounds: MatchingRoundResponse[]): {
  currentRound: number | undefined
  activeRound: number | undefined
} {
  const now = Date.now()
  const toRound = (phase: string) =>
    phase === "FIRST" ? 1 : phase === "SECOND" ? 2 : 3

  // 지원현황 기준: startsAt ~ endsAt (지원 마감 시점)
  const active = rounds.find(
    (r) =>
      new Date(r.startsAt).getTime() <= now &&
      now <= new Date(r.endsAt).getTime(),
  )
  if (active) {
    const round = toRound(active.phase)
    return { currentRound: round, activeRound: round }
  }

  // endsAt이 지난 차수 중 가장 최근
  const completed = [...rounds]
    .filter((r) => new Date(r.endsAt).getTime() < now)
    .sort((a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime())
  const fallback =
    completed.length > 0 ? toRound(completed[0]!.phase) : undefined
  return { currentRound: fallback, activeRound: undefined }
}

// PM 챌린저 뷰용 데이터
export function useChallengerPageData(
  options: ApplicationPageDataOptions = {},
) {
  const enabled = options.enabled ?? true
  const gisuQuery = useActiveGisuId({ enabled })
  const gisuId = gisuQuery.data ?? 0

  const { data: me } = useMe()
  const chapterId = useMemo(() => {
    const record = getLatestChallengerRecord(me)
    return record?.chapterId ? Number(record.chapterId) : undefined
  }, [me])

  const projectsQuery = useQuery({
    queryKey: applicationKeys.managedProjects(gisuId),
    queryFn: () => getManagedProjects(gisuId),
    enabled: enabled && gisuId > 0,
  })

  // 매칭 차수 조회 (현재 진행 차수 계산용)
  const roundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
    enabled: enabled && chapterId !== undefined,
  })

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
    enabled: enabled && projects.length > 0,
  })

  // 프로젝트별 통계 조회 (차수별 지원률, 학교별 지원자 수)
  const projectStatsQuery = useQuery({
    queryKey: [
      ...applicationKeys.all,
      "project-statistics",
      projects.map((p) => p.id),
    ],
    queryFn: async () => {
      const results = await Promise.all(
        projects.map((p) => getProjectStatistics(Number(p.id))),
      )
      return results
    },
    enabled: enabled && projects.length > 0,
  })

  const { currentRound } = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 차수별 지원 가용 인원 (서버 roundApplicationStatistics 직접 사용)
  const availablePerRound = useMemo(() => {
    const map = new Map<number, number>()
    const firstStat = (projectStatsQuery.data ?? [])[0]
    if (!firstStat) return map
    for (const r of firstStat.roundApplicationStatistics) {
      map.set(
        toRoundNumber(r.matchingRound.phase),
        Number(r.availableMemberCount),
      )
    }
    return map
  }, [projectStatsQuery.data])

  // schoolId -> schoolName 매핑 (학교별 지원 통계 표시용)
  const schoolsQuery = useQuery({
    queryKey: ["schools", "all"],
    queryFn: getAllSchools,
    enabled,
  })
  const schoolIdToName = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of schoolsQuery.data?.schools ?? []) {
      map.set(s.schoolId, s.schoolName)
    }
    return map
  }, [schoolsQuery.data])

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
    availablePerRound,
    projectStats: projectStatsQuery.data ?? [],
    schoolIdToName,
    isLoading:
      enabled &&
      (gisuQuery.isLoading ||
        projectsQuery.isLoading ||
        applicantsQuery.isLoading ||
        projectStatsQuery.isLoading ||
        roundsQuery.isLoading),
    isError: enabled && (gisuQuery.isError || projectsQuery.isError),
    error: gisuQuery.error ?? projectsQuery.error ?? applicantsQuery.error,
  }
}

// 챕터 목록 조회 (name -> id 매핑용)
export function useChapters(options: ApplicationPageDataOptions = {}) {
  const enabled = options.enabled ?? true

  return useQuery({
    queryKey: applicationKeys.chapters(),
    queryFn: getAllChapters,
    enabled,
  })
}

// Admin 뷰용 데이터
export function useAdminPageData(
  chapterName?: string,
  options: ApplicationPageDataOptions = {},
) {
  const enabled = options.enabled ?? true
  const gisuQuery = useActiveGisuId({ enabled })
  const gisuId = gisuQuery.data ?? 0

  const chaptersQuery = useChapters({ enabled })
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  // 지부별 학교 ID 조회 (schoolMatchingStatistics 필터링용)
  const chaptersWithSchoolsQuery = useQuery({
    queryKey: ["chapters-with-schools", gisuId],
    queryFn: () => getChaptersWithSchools(String(gisuId)),
    enabled: enabled && gisuId > 0,
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
    enabled: enabled && gisuId > 0,
  })

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  // 전체 학교 목록 조회 (schoolId -> schoolName 매핑용)
  const schoolsQuery = useQuery({
    queryKey: ["schools", "all"],
    queryFn: getAllSchools,
    enabled,
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
    enabled,
  })
  const { currentRound, activeRound } = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 지부 통계 조회 (rounds, totalMembers, projectRounds, topProjects)
  const chapterStatsQuery = useQuery({
    queryKey: applicationKeys.chapterStatistics(chapterId ?? 0),
    queryFn: () => getChapterStatistics(chapterId!),
    enabled: enabled && !!chapterId,
  })

  // projectId -> name 맵 (키를 String으로 통일)
  const projectIdToName = useMemo(
    () => new Map(projects.map((p) => [String(p.id), p.name])),
    [projects],
  )

  // 서버 데이터 -> 프론트 타입 변환 (테이블용)
  const transformed: ProjectApplication[] = useMemo(
    () => projects.map((p) => toProjectApplication(p, [])),
    [projects],
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
    // 학교 회장단 포함 모든 운영진은 지부 전체 통계를 본다 (지부 현황은 지부 단위 집계, 총원·완료율·학교별 분포 일관)
    const schoolIds = chapterSchoolIds ?? EMPTY_SET
    const schoolFilter = (id: string) => schoolIds.has(id)
    const filteredSummary = chapterName
      ? {
          ...chapterStatsQuery.data.summary,
          schoolMatchingStatistics:
            chapterStatsQuery.data.summary.schoolMatchingStatistics.filter(
              (s) => schoolFilter(String(s.schoolId)),
            ),
          projectRoundStatistics:
            chapterStatsQuery.data.summary.projectRoundStatistics.filter((p) =>
              projectIdToName.has(String(p.projectId)),
            ),
        }
      : chapterStatsQuery.data.summary

    // Top4를 현재 차수 단일 기준으로 표시, 3차 이후에는 1차 기준
    const topProjectsRound =
      currentRound !== undefined && currentRound >= 3 ? 1 : currentRound
    const partial = summaryToStats(
      filteredSummary,
      projectIdToName,
      currentRound,
    )

    // 3차 이후 Top4를 1차 기준으로 재계산
    if (topProjectsRound !== undefined && topProjectsRound !== currentRound) {
      const phaseKey =
        topProjectsRound === 1
          ? "FIRST"
          : topProjectsRound === 2
            ? "SECOND"
            : "THIRD"
      partial.topProjects = filteredSummary.projectRoundStatistics
        .map((p) => ({
          projectId: p.projectId,
          name: projectIdToName.get(String(p.projectId)) ?? String(p.projectId),
          count: Number(
            p.matchingRounds.find((r) => r.matchingRound.phase === phaseKey)
              ?.appliedMemberCount ?? 0,
          ),
        }))
        .sort(
          (a, b) =>
            b.count - a.count || Number(a.projectId) - Number(b.projectId),
        )
        .slice(0, 4)
    }

    // 도넛: 지원 완료율로 보정 (completedCount = 현재 차수 appliedMemberCount, 분모 = totalMembers)
    const currentPhase =
      currentRound === 1
        ? "FIRST"
        : currentRound === 2
          ? "SECOND"
          : currentRound === 3
            ? "THIRD"
            : undefined
    const appliedCount = currentPhase
      ? Number(
          filteredSummary.roundApplicationStatistics.find(
            (r) => r.matchingRound.phase === currentPhase,
          )?.appliedMemberCount ?? 0,
        )
      : 0
    partial.completedCount = appliedCount
    partial.pendingCount = Math.max(0, partial.totalMembers - appliedCount)
    partial.completionRate =
      partial.totalMembers > 0
        ? Math.round((appliedCount / partial.totalMembers) * 100)
        : 0

    // 도넛 차트 총원을 필터링된 schoolMatchingStatistics 기준으로 보정
    // roundApplicationStatistics.availableMemberCount는 전체 기준이므로 지부/학교 필터링 반영 안 됨
    for (const r of partial.rounds) {
      r.total = partial.totalMembers
    }

    // 학교별 지원자 수 집계 (roundSchoolRankings 전 차수 합산, 챕터 소속 학교만)
    const schoolApplicantCounts = new Map<string, number>()
    for (const ranking of chapterStatsQuery.data.summary.roundSchoolRankings ??
      []) {
      for (const s of ranking.schools) {
        const id = String(s.schoolId)
        if (!schoolFilter(id)) continue
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
    currentRound,
  ])

  return {
    projects: transformed,
    stats,
    currentRound,
    activeRound,
    dataUpdatedAt: projectsQuery.dataUpdatedAt,
    chapters,
    isLoading:
      enabled &&
      (gisuQuery.isLoading ||
        chaptersQuery.isLoading ||
        roundsQuery.isLoading ||
        projectsQuery.isLoading ||
        chapterStatsQuery.isLoading ||
        chaptersWithSchoolsQuery.isLoading),
    isError:
      enabled &&
      (gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError),
    error: gisuQuery.error ?? chaptersQuery.error ?? projectsQuery.error,
  }
}
