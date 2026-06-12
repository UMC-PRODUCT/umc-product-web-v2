import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  getAllProjects,
  getChapterStatistics,
  getMatchingRounds,
  getProjectApplications,
} from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import {
  useActiveGisuId,
  useChapters,
} from "@/features/application/hooks/useApplicationPageData"
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
import { useViewModeStore } from "@/shared/view-mode"

import { toMatchingPartDataList } from "../model/matchingStatusMapper"

import type { MatchingRoundResponse } from "@/features/application/model/apiTypes"
import type {
  ApplicationStats,
  UniversityCount,
} from "@/features/application/model/types"

// 매칭 라운드 목록에서 현재 활성 차수 번호 계산
// PM 결정 기간(endsAt ~ decisionDeadline)도 "활성"으로 판별
function getCurrentRound(rounds: MatchingRoundResponse[]): {
  currentRound: number
  activeRound: number | undefined
} {
  const now = Date.now()
  const active = rounds.find(
    (r) =>
      new Date(r.startsAt).getTime() <= now &&
      now <= new Date(r.decisionDeadline).getTime(),
  )
  if (active) {
    const round = toRoundNumber(active.phase)
    return { currentRound: round, activeRound: round }
  }
  // 없으면 가장 최근 라운드 (타이틀용), activeRound는 undefined
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
  )
  const fallback = sorted.length > 0 ? toRoundNumber(sorted[0]!.phase) : 1
  return { currentRound: fallback, activeRound: undefined }
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
  const { currentRound, activeRound } = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 전체 프로젝트 조회 (매칭 결과 시트용)
  const projectsQuery = useQuery({
    queryKey: applicationKeys.matchingParts(gisuId, chapterId),
    queryFn: () => getAllProjects(gisuId, { chapterId }),
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

    const partial = summaryToStats(
      filteredSummary,
      projectIdToName,
      currentRound,
    )
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
    currentRound,
    schoolIdToName,
    chapterName,
    chapterSchoolIds,
  ])

  return {
    matchingParts,
    stats,
    currentRound,
    activeRound,
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
      applicantsQuery.isLoading ||
      chapterStatsQuery.isLoading,
    isError:
      gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError,
    error:
      gisuQuery.error ??
      chaptersQuery.error ??
      projectsQuery.error ??
      applicantsQuery.error,
  }
}
