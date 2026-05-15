import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  getAllChapters,
  getAllGisu,
} from "@/features/challenger/api/organization"

import {
  getAllProjects,
  getManagedProjects,
  getProjectApplications,
} from "../api/applicationApi"
import { applicationKeys } from "../api/applicationKeys"
import { toProjectApplication } from "../model/mappers"

import type { ApplicationStats, ProjectApplication } from "../model/types"

// 활성 기수 ID 조회
export function useActiveGisuId() {
  return useQuery({
    queryKey: ["gisu", "active"],
    queryFn: async () => {
      const res = await getAllGisu()
      const active = res.gisuList.find((g) => g.isActive)
      return active ? Number(active.gisuId) : null
    },
  })
}

// PM 챌린저 뷰용 데이터
export function useChallengerPageData() {
  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const projectsQuery = useQuery({
    queryKey: applicationKeys.managedProjects(gisuId),
    queryFn: () => getManagedProjects(gisuId),
    enabled: gisuId > 0,
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
          const applicants = await getProjectApplications(p.id)
          return { projectId: p.id, applicants }
        }),
      )
      return new Map(results.map((r) => [r.projectId, r.applicants]))
    },
    enabled: projects.length > 0,
  })

  // 서버 데이터 -> 프론트 타입으로 변환
  const transformed: ProjectApplication[] = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(p.id) ?? []),
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
    }
  }, [projects])

  return {
    projects: transformed,
    projectInfo,
    isLoading:
      gisuQuery.isLoading ||
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

// 프로젝트 + 지원자 데이터에서 ApplicationStats 계산
export function computeAdminStats(
  projects: ProjectApplication[],
): ApplicationStats {
  const allApplicants = projects.flatMap((p) => p.applicants)

  // 차수별 지원자 수
  const roundMap = new Map<number, number>()
  for (const a of allApplicants) {
    roundMap.set(a.round, (roundMap.get(a.round) ?? 0) + 1)
  }

  // 총 모집 인원
  const totalQuota = projects.reduce(
    (sum, p) => sum + p.designCount.total + p.feCount.total + p.beCount.total,
    0,
  )

  const completedCount = allApplicants.filter((a) => a.status === "pass").length
  const pendingCount = totalQuota - completedCount

  const rounds = Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, applied]) => ({
      round,
      applied,
      total: totalQuota,
    }))

  // 프로젝트별 지원자 수 Top 4
  const projectCounts = projects
    .map((p) => ({ name: p.projectName, count: p.applicants.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  // 대학별 집계
  const uniMap = new Map<string, number>()
  for (const a of allApplicants) {
    uniMap.set(a.university, (uniMap.get(a.university) ?? 0) + 1)
  }
  const universities = Array.from(uniMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, applied]) => ({
      name,
      applied,
      total: totalQuota,
    }))

  // 프로젝트별 차수별 지원자 수 (최대 3차수)
  const projectRounds = projects.map((p) => {
    const rMap = new Map<number, number>()
    for (const a of p.applicants) {
      rMap.set(a.round, (rMap.get(a.round) ?? 0) + 1)
    }
    return {
      name: p.projectName,
      rounds: [rMap.get(1) ?? 0, rMap.get(2) ?? 0, rMap.get(3) ?? 0],
    }
  })

  return {
    totalMembers: totalQuota,
    completionRate:
      totalQuota > 0 ? Math.round((completedCount / totalQuota) * 100) : 0,
    completedCount,
    pendingCount: Math.max(0, pendingCount),
    rounds,
    topProjects: projectCounts,
    universities,
    projectRounds,
  }
}

// Admin 뷰용 데이터
export function useAdminPageData(chapterName?: string) {
  const gisuQuery = useActiveGisuId()
  const gisuId = gisuQuery.data ?? 0

  const chaptersQuery = useChapters()
  const chapters = useMemo(
    () => chaptersQuery.data?.chapters ?? [],
    [chaptersQuery.data],
  )

  // 선택된 챕터 이름 -> chapterId 매핑
  const chapterId = useMemo(() => {
    if (!chapterName || chapters.length === 0) return undefined
    const found = chapters.find((c) => c.name === chapterName)
    return found ? Number(found.id) : undefined
  }, [chapterName, chapters])

  // 전체 프로젝트 목록 조회
  const projectsQuery = useQuery({
    queryKey: applicationKeys.allProjects(gisuId, chapterId),
    queryFn: () => getAllProjects(gisuId, { chapterId }),
    enabled: gisuId > 0,
  })

  const projects = useMemo(
    () => projectsQuery.data?.content ?? [],
    [projectsQuery.data],
  )

  // 각 프로젝트의 지원자 목록 조회
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
          const applicants = await getProjectApplications(p.id)
          return { projectId: p.id, applicants }
        }),
      )
      return new Map(results.map((r) => [r.projectId, r.applicants]))
    },
    enabled: projects.length > 0,
  })

  // 서버 데이터 -> 프론트 타입 변환
  const transformed: ProjectApplication[] = useMemo(
    () =>
      projects.map((p) =>
        toProjectApplication(p, applicantsQuery.data?.get(p.id) ?? []),
      ),
    [projects, applicantsQuery.data],
  )

  // 통계 계산
  const stats = useMemo(() => computeAdminStats(transformed), [transformed])

  return {
    projects: transformed,
    stats,
    dataUpdatedAt: applicantsQuery.dataUpdatedAt || projectsQuery.dataUpdatedAt,
    chapters,
    isLoading:
      gisuQuery.isLoading ||
      chaptersQuery.isLoading ||
      projectsQuery.isLoading ||
      applicantsQuery.isLoading,
    isError:
      gisuQuery.isError || chaptersQuery.isError || projectsQuery.isError,
    error: gisuQuery.error ?? chaptersQuery.error ?? projectsQuery.error,
  }
}
