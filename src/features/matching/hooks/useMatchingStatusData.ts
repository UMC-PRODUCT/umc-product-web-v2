import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  getAllProjects,
  getMatchingStatistics,
} from "@/entities/application/api/applicationApi"
import { applicationKeys } from "@/entities/application/api/applicationKeys"
import { useViewModeStore } from "@/entities/member/view-mode"
import { useAllSchools } from "@/entities/organization/hooks/useAllSchools"
import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import { getProjectMembersBatch } from "@/entities/project/api/matchingProject"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"

import { matchingResponseToStats } from "../model/matchingStatsMapper"
import { toMatchingPartDataList } from "../model/matchingStatusMapper"

import type { ApplicationStats } from "@/entities/application/model/types"

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

export function useMatchingStatusData(chapterName?: string) {
  const mode = useViewModeStore((s) => s.mode)
  const isAdmin = mode === "admin"

  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  // 챕터 필터링. 활성 기수의 지부로만 매핑한다. 기수 구분이 없는 목록으로 찾으면
  // 같은 이름의 지난 기수 지부 ID 가 잡혀 엉뚱한 데이터를 조회하게 된다.
  const {
    getChapterIdByName,
    isLoading: chaptersLoading,
    isError: chaptersError,
  } = useSchoolChapterMap()
  const chapterId = useMemo(
    () => (chapterName ? getChapterIdByName(chapterName) : undefined),
    [chapterName, getChapterIdByName],
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
    // 지부를 고른 상태라면 그 ID 가 확정된 뒤에만 조회한다. chapterId 를 파라미터로
    // 넘기면서 여기서 안 막으면, 매핑 전에는 필터가 빠진 채 전체 기수 프로젝트를
    // 받아 잠깐 다른 지부 데이터까지 보인다. 지난 기수 지부명이 남아 매핑이 아예
    // 실패하면 그 화면이 계속 유지된다.
    enabled: gisuId > 0 && (!chapterName || chapterId !== undefined),
    staleTime: 1000 * 60 * 5,
  })

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  // 전체 학교 목록 조회 (schoolId -> schoolName 매핑용)
  const schoolsQuery = useAllSchools()
  const schoolIdToName = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of schoolsQuery.data?.schools ?? []) {
      map.set(s.schoolId, s.schoolName)
    }
    return map
  }, [schoolsQuery.data])

  // 매칭 현황 집계 조회 (PROJECT-STAT-003, ProjectMember 기준 공개 집계)
  // 서버가 chapterId로 지부 스코핑하므로 FE 학교 필터링 불필요
  const matchingStatsQuery = useQuery({
    queryKey: applicationKeys.matchingMatchings(chapterId ?? 0),
    queryFn: () => getMatchingStatistics(chapterId!),
    enabled: !!chapterId,
    staleTime: 1000 * 60 * 5,
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
    queryFn: () => getProjectMembersBatch(projects.map((p) => Number(p.id))),
    enabled: projects.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  // 전체 프로젝트에 배정된 멤버 ID 수집 (수동 배정 시 중복 필터링용)
  // ProjectMember(partGroups)가 APPROVED 지원자 + 수동 배정 멤버를 모두 포함
  const assignedMemberIds = useMemo(() => {
    const ids = new Set<string>()
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
  }, [membersQuery.data])

  // 매칭 결과 시트 데이터 변환 (ProjectMember 기준)
  const matchingParts = useMemo(
    () => toMatchingPartDataList(projects, membersQuery.data ?? new Map()),
    [projects, membersQuery.data],
  )

  // 통계 + 현재 차수 (매칭 집계 응답 기반)
  const { stats, currentRound } = useMemo(() => {
    if (!matchingStatsQuery.data) {
      return { stats: emptyStats, currentRound: undefined }
    }
    return matchingResponseToStats(
      matchingStatsQuery.data,
      projectIdToName,
      schoolIdToName,
    )
  }, [matchingStatsQuery.data, projectIdToName, schoolIdToName])

  return {
    matchingParts,
    stats,
    currentRound,
    activeRound: currentRound,
    gisuId,
    chapterId,
    assignedMemberIds,
    dataUpdatedAt:
      matchingStatsQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt,
    isAdmin,
    isLoading:
      gisuQuery.isLoading ||
      chaptersLoading ||
      projectsQuery.isLoading ||
      schoolsQuery.isLoading ||
      (projects.length > 0 &&
        membersQuery.data === undefined &&
        !membersQuery.isError) ||
      (!!chapterId &&
        matchingStatsQuery.data === undefined &&
        !matchingStatsQuery.isError),
    isError: gisuQuery.isError || chaptersError || projectsQuery.isError,
    error: gisuQuery.error ?? projectsQuery.error ?? matchingStatsQuery.error,
  }
}
