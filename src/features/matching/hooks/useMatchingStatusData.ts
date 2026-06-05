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
  summaryToStats,
  toRoundNumber,
} from "@/features/application/model/mappers"
import { getAllSchools } from "@/features/challenger/api/organization"
import { useViewModeStore } from "@/shared/view-mode"

import { toMatchingPartDataList } from "../model/matchingStatusMapper"

import type { MatchingRoundResponse } from "@/features/application/model/apiTypes"
import type {
  ApplicationStats,
  UniversityCount,
} from "@/features/application/model/types"

// 매칭 라운드 목록에서 현재 활성 차수 번호 계산
function getCurrentRound(rounds: MatchingRoundResponse[]): number {
  const now = Date.now()
  // 현재 진행 중인 라운드 (startsAt <= now <= endsAt)
  const active = rounds.find(
    (r) =>
      new Date(r.startsAt).getTime() <= now &&
      now <= new Date(r.endsAt).getTime(),
  )
  if (active) return toRoundNumber(active.phase)
  // 없으면 가장 최근 라운드
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime(),
  )
  return sorted.length > 0 ? toRoundNumber(sorted[0]!.phase) : 1
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
  const currentRound = useMemo(
    () => getCurrentRound(roundsQuery.data ?? []),
    [roundsQuery.data],
  )

  // 전체 프로젝트 조회 (매칭 결과 시트용 - admin만)
  const projectsQuery = useQuery({
    queryKey: applicationKeys.matchingParts(gisuId, chapterId),
    queryFn: () => getAllProjects(gisuId, { chapterId }),
    enabled: gisuId > 0 && isAdmin,
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
          const applicants = await getProjectApplications(p.id)
          return { projectId: p.id, applicants }
        }),
      )
      return new Map(results.map((r) => [r.projectId, r.applicants]))
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

  // 지부 통계 조회 (rounds, totalMembers, projectRounds, topProjects)
  const chapterStatsQuery = useQuery({
    queryKey: applicationKeys.chapterStatistics(chapterId ?? 0),
    queryFn: () => getChapterStatistics(chapterId!),
    enabled: !!chapterId,
  })

  // projectId -> name 맵
  const projectIdToName = useMemo(
    () => new Map(projects.map((p) => [p.id, p.name])),
    [projects],
  )

  // 전체 프로젝트에서 APPROVED된 멤버 ID 수집 (수동 배정 시 필터링용)
  const approvedMemberIds = useMemo(() => {
    const ids = new Set<string>()
    if (!applicantsQuery.data) return ids
    for (const applicants of applicantsQuery.data.values()) {
      for (const app of applicants) {
        if (app.status === "APPROVED") {
          ids.add(String(app.applicant.memberId))
        }
      }
    }
    return ids
  }, [applicantsQuery.data])

  // 매칭 현황 데이터 변환 (매칭 결과 시트용)
  const matchingParts = useMemo(
    () => toMatchingPartDataList(projects, applicantsQuery.data ?? new Map()),
    [projects, applicantsQuery.data],
  )

  // 통계: summary 기반 (universities는 schoolMatchingStatistics + schools API로 계산)
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
    const partial = summaryToStats(
      chapterStatsQuery.data.summary,
      projectIdToName,
      currentRound,
    )
    const universities: UniversityCount[] =
      chapterStatsQuery.data.summary.schoolMatchingStatistics
        .map((s) => ({
          name: schoolIdToName.get(String(s.schoolId)) ?? String(s.schoolId),
          applied: s.totalMemberCount,
          total: partial.totalMembers,
        }))
        .sort((a, b) => b.applied - a.applied)
        .slice(0, 5)
    return { ...partial, universities }
  }, [chapterStatsQuery.data, projectIdToName, currentRound, schoolIdToName])

  return {
    matchingParts,
    stats,
    currentRound,
    gisuId,
    chapterId,
    approvedMemberIds,
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
