import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  getAllProjects,
  getChapterStatistics,
  getMatchingRounds,
  getProjectApplications,
} from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { useChapters } from "@/features/application/hooks/useApplicationPageData"
import {
  shortenSchoolName,
  summaryToStats,
  toRoundNumber,
} from "@/features/application/model/mappers"
import {
  getAllSchools,
  getChaptersWithSchools,
} from "@/features/challenger/api/organization"
import { getProjectMembers } from "@/features/project/list/api/matchingProject"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"
import { useViewModeStore } from "@/shared/view-mode"

import { toMatchingPartDataList } from "../model/matchingStatusMapper"

import type { MatchingRoundResponse } from "@/features/application/model/apiTypes"
import type {
  ApplicationStats,
  UniversityCount,
} from "@/features/application/model/types"

// 매칭 결과 공개 기준 차수 계산 (지원 현황과 생명주기 다름)
// - s2 이전: 0 (아무것도 표시 안 함)
// - s2 ~ s3 직전: 1 (1차 결과 공개)
// - s3 ~ d3: 2 (2차 결과 공개)
// - d3 이후: 3 (3차 결과 공개)
function getMatchingVisibleRound(rounds: MatchingRoundResponse[]): {
  visibleUpToRound: number
  currentRound: number | undefined
} {
  if (rounds.length === 0)
    return { visibleUpToRound: 0, currentRound: undefined }

  const now = Date.now()
  const sorted = [...rounds].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )

  // 마지막 차수 decisionDeadline 이후 → 전 차수 공개
  const last = sorted[sorted.length - 1]!
  if (now > new Date(last.decisionDeadline).getTime()) {
    const round = toRoundNumber(last.phase)
    return { visibleUpToRound: round, currentRound: round }
  }

  // 다음 차수 startsAt을 지날 때마다 이전 차수 결과 공개
  let visible = 0
  for (let i = 1; i < sorted.length; i++) {
    if (now >= new Date(sorted[i]!.startsAt).getTime()) {
      visible = i
    }
  }

  return {
    visibleUpToRound: visible,
    currentRound: visible > 0 ? visible : undefined,
  }
}

export function useMatchingStatusData(chapterName?: string) {
  const mode = useViewModeStore((s) => s.mode)
  const isAdmin = mode === "admin"

  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  // 챕터 필터링
  const chapterId = useMemo(() => {
    if (!chapterName || chapters.length === 0) return undefined
    const found = chapters.find((c) => c.name === chapterName)
    return found ? Number(found.id) : undefined
  }, [chapterName, chapters])

  // 매칭 차수 조회
  const roundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(chapterId),
    queryFn: () => getMatchingRounds(chapterId),
  })
  const { visibleUpToRound, currentRound } = useMemo(
    () => getMatchingVisibleRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 전체 프로젝트 조회 (매칭 결과 시트용)
  const projectsQuery = useQuery({
    queryKey: applicationKeys.matchingParts(gisuId, chapterId),
    queryFn: async () => {
      const size = 100
      const firstPage = await getAllProjects(gisuId, {
        chapterId,
        page: 0,
        size,
        statuses: ["IN_PROGRESS", "COMPLETED"],
      })
      const projects = [...firstPage.content]
      let page = 0
      let hasNext = firstPage.hasNext

      while (hasNext) {
        page += 1
        const nextPage = await getAllProjects(gisuId, {
          chapterId,
          page,
          size,
          statuses: ["IN_PROGRESS", "COMPLETED"],
        })
        projects.push(...nextPage.content)
        hasNext = nextPage.hasNext
      }

      return { ...firstPage, content: projects }
    },
    enabled: gisuId > 0,
  })

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  // 프로젝트별 지원자 일괄 조회 (매칭 결과 시트 + 학교별 통계용)
  const applicantsQuery = useQuery({
    queryKey: applicationKeys.matchingApplicants(
      gisuId,
      chapterId,
      projects.map((p) => p.id),
    ),
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

  // 프로젝트별 팀원 조회 (수동 배정 멤버 포함)
  const membersQuery = useQuery({
    queryKey: applicationKeys.matchingMembers(
      gisuId,
      chapterId,
      projects.map((p) => p.id),
    ),
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (p) => {
          const members = await getProjectMembers(Number(p.id))
          return { projectId: p.id, members }
        }),
      )
      return new Map(results.map((r) => [String(r.projectId), r.members]))
    },
    enabled: projects.length > 0,
  })

  // 전체 프로젝트에 배정된 멤버 ID 수집 (수동 배정 시 중복 필터링용)
  // APPROVED 지원자 + 수동 배정 멤버(지원서 없이 추가된 멤버) 모두 포함
  const assignedMemberIds = useMemo(() => {
    const ids = new Set<string>()
    // 1. APPROVED 지원서 기반
    if (applicantsQuery.data) {
      for (const applicants of applicantsQuery.data.values()) {
        for (const app of applicants) {
          if (app.status === "APPROVED") {
            ids.add(String(app.applicant.memberId))
          }
        }
      }
    }
    // 2. 프로젝트 멤버 목록 기반 (수동 배정 멤버 포함)
    if (membersQuery.data) {
      for (const members of membersQuery.data.values()) {
        for (const group of members.partGroups) {
          for (const member of group.members) {
            ids.add(String(member.memberId))
          }
        }
      }
    }
    return ids
  }, [applicantsQuery.data, membersQuery.data])

  // 매칭 현황 데이터 변환 (매칭 결과 시트용)
  const matchingParts = useMemo(
    () =>
      toMatchingPartDataList(
        projects,
        applicantsQuery.data ?? new Map(),
        membersQuery.data ?? new Map(),
      ),
    [projects, applicantsQuery.data, membersQuery.data, currentRound],
  )

  // 통계: summary 기반 (universities는 schoolMatchingStatistics + schools API로 계산)
  // 서버가 schoolMatchingStatistics를 챕터 필터링 없이 내려주므로 프론트에서 필터링
  const emptyStats: ApplicationStats = {
    totalMembers: 0,
    completionRate: 0,
    completedCount: 0,
    pendingCount: 0,
    rounds: [],
    topProjects: [],
    universities: [],
    projectRounds: [],
  }

  const stats: ApplicationStats = useMemo(() => {
    if (!chapterStatsQuery.data) return emptyStats

    const summary = chapterStatsQuery.data.summary
    // 총원·학교별 분포는 지부 모집단 기준 (라운드 가시성과 무관)
    const chapterSchoolStats = chapterName
      ? summary.schoolMatchingStatistics.filter((s) =>
          (chapterSchoolIds ?? new Set()).has(String(s.schoolId)),
        )
      : summary.schoolMatchingStatistics
    const totalMembers = chapterSchoolStats.reduce(
      (sum, s) => sum + Number(s.totalMemberCount),
      0,
    )

    // s2 이전: 차수별 매칭 결과는 숨기되 지부 총원은 표시
    if (visibleUpToRound === 0) {
      return { ...emptyStats, totalMembers, pendingCount: totalMembers }
    }

    // 해당 챕터 소속 학교 + 프로젝트만 필터링 (로딩 중엔 빈 Set으로 필터링해 flicker 방지)
    const filteredSummary = chapterName
      ? {
          ...summary,
          schoolMatchingStatistics: chapterSchoolStats,
          projectRoundStatistics: summary.projectRoundStatistics.filter((p) =>
            projectIdToName.has(String(p.projectId)),
          ),
        }
      : summary

    // visibleUpToRound 차수까지의 결과만 표시
    // Top4는 d3 이후에도 1차 기준
    const topProjectsRound = visibleUpToRound === 3 ? 1 : visibleUpToRound
    const partial = summaryToStats(
      filteredSummary,
      projectIdToName,
      visibleUpToRound,
      "matching",
    )

    if (topProjectsRound !== visibleUpToRound) {
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
              ?.matchedMemberCount ?? 0,
          ),
        }))
        .sort(
          (a, b) =>
            b.count - a.count || Number(a.projectId) - Number(b.projectId),
        )
        .slice(0, 4)
    }

    // 도넛 차트 총원을 필터링된 schoolMatchingStatistics 기준으로 보정
    for (const r of partial.rounds) {
      r.total = partial.totalMembers
    }

    const universities: UniversityCount[] =
      filteredSummary.schoolMatchingStatistics
        .map((s) => ({
          name: shortenSchoolName(
            schoolIdToName.get(String(s.schoolId)) ?? String(s.schoolId),
          ),
          applied: Number(s.matchedMemberCount),
          total: Number(s.totalMemberCount),
        }))
        .sort((a, b) => b.applied - a.applied)
        .slice(0, 5)
    return { ...partial, universities }
  }, [
    chapterStatsQuery.data,
    projectIdToName,
    visibleUpToRound,
    schoolIdToName,
    chapterName,
    chapterSchoolIds,
  ])

  return {
    matchingParts,
    stats,
    currentRound,
    activeRound: visibleUpToRound > 0 ? visibleUpToRound : undefined,
    gisuId,
    chapterId,
    assignedMemberIds,
    dataUpdatedAt: applicantsQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt,
    isAdmin,
    isLoading:
      gisuQuery.isLoading ||
      chaptersQuery.isLoading ||
      roundsQuery.isLoading ||
      projectsQuery.isLoading ||
      (projects.length > 0 &&
        ((applicantsQuery.data === undefined && !applicantsQuery.isError) ||
          (membersQuery.data === undefined && !membersQuery.isError))) ||
      chapterStatsQuery.isLoading ||
      chaptersWithSchoolsQuery.isLoading,
    isError:
      gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError,
    error:
      gisuQuery.error ??
      chaptersQuery.error ??
      projectsQuery.error ??
      applicantsQuery.error,
  }
}
