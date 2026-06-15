import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { useResourcePermissionsBatch } from "@/features/auth/hooks/useResourcePermissionsBatch"
import {
  isAnyOperator,
  isCentralCore,
  isChapterPresident,
  isCurrentTermPm,
  isSchoolStaff,
} from "@/features/auth/model/identity"
import { getChaptersWithSchools } from "@/features/challenger/api/organization"
import { gisuKeys, projectKeys } from "@/features/project/new/api/queryKeys"
import { useIsMatchingPeriod } from "@/features/project/new/hooks/useIsMatchingPeriod"
import { getActiveGisu } from "@/shared/api/gisu"
import { withImageCacheKey } from "@/shared/lib/withImageCacheKey"
import { EmptyState } from "@/shared/ui/EmptyState"
import { SegmentButton } from "@/shared/ui/segment-button/SegmentButton"
import { CHAPTERS } from "@/shared/ui/segment/ChapterSelector"
import { useViewMe } from "@/shared/view-mode/useViewMe"

import { getManagedProjects } from "../api"
import { ProjectManagementCard } from "./ProjectManagementCard"
import { ProjectManagementSubTitle } from "./ProjectManagementSubTitle"

import type { ResourcePermissionQuery } from "@/features/auth/api/permissions"
import type { ProjectStatus } from "@/features/project/list/api/matchingProject"
import type { MatchingProject } from "@/features/project/list/model/matchingProject"

const FE_PART_LABELS = new Set(["Web", "iOS", "Android"])
const MANAGED_PROJECTS_PAGE_SIZE = 200

const PART_LABEL: Record<string, string> = {
  PLAN: "기획",
  DESIGN: "Design",
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
  SPRINGBOOT: "SpringBoot",
  NODEJS: "Node.js",
  ADMIN: "운영",
}

const PART_KEYS = Object.keys(PART_LABEL)

type ProjectSummaryInput = {
  id?: number | null
  name?: string | null
  description?: string | null
  thumbnailImageUrl?: string | null
  logoImageUrl?: string | null
  status?: ProjectStatus | null
  productOwner?: {
    nickname?: string | null
    name?: string | null
    schoolName?: string | null
  } | null
  partQuotas?:
    | {
        part?: string | null
        currentCount?: number | null
        quota?: number | null
      }[]
    | null
}

function toMatchingProject(
  item: ProjectSummaryInput,
  imageCacheKey: number,
): MatchingProject {
  const owner = item.productOwner
  const ownerLine = [
    owner?.nickname && owner?.name
      ? `${owner.nickname}/${owner.name}`
      : (owner?.name ?? ""),
    owner?.schoolName,
  ]
    .filter(Boolean)
    .join(" · ")

  return {
    id: String(item.id ?? ""),
    branch: "",
    school: owner?.schoolName ?? "",
    title: item.name ?? "",
    description: item.description ?? "",
    authorSchoolLine: ownerLine,
    status: item.status ?? undefined,
    logoImage: item.logoImageUrl
      ? {
          src:
            withImageCacheKey(item.logoImageUrl, imageCacheKey) ??
            item.logoImageUrl,
          alt: `${item.name ?? "프로젝트"} 로고`,
        }
      : null,
    coverImage: item.thumbnailImageUrl
      ? {
          src:
            withImageCacheKey(item.thumbnailImageUrl, imageCacheKey) ??
            item.thumbnailImageUrl,
          alt: `${item.name ?? "프로젝트"} 대표 이미지`,
        }
      : null,
    recruitRows: (item.partQuotas ?? [])
      .slice()
      .sort((a, b) => {
        const ai = PART_KEYS.indexOf(a.part ?? "")
        const bi = PART_KEYS.indexOf(b.part ?? "")
        return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
      })
      .map((q) => ({
        part: PART_LABEL[q.part ?? ""] ?? q.part ?? "",
        current: Number(q.currentCount) || 0,
        total: Number(q.quota) || 0,
      })),
  }
}

function toValidProjectId(project: MatchingProject): number | null {
  const id = Number(project.id)
  return Number.isFinite(id) && id > 0 ? id : null
}

export function ProjectManagementPage() {
  const navigate = useNavigate()
  const { viewMe: me } = useViewMe()
  const [selectedChapter, setSelectedChapter] = useState<string>(CHAPTERS[0])

  const isAdminScope = isAnyOperator(me)
  const isPm = isCurrentTermPm(me)
  const hasAccess = isAdminScope || isPm
  const useGroupedView = isCentralCore(me)

  const descriptionText = useGroupedView
    ? "전체 지부의 프로젝트 정보를 확인하고 수정할 수 있습니다. 팀 매칭 진행 중에는 수정이 제한됩니다."
    : isChapterPresident(me)
      ? "내 지부의 프로젝트 정보를 확인하고 수정할 수 있습니다. 팀 매칭 진행 중에는 수정이 제한됩니다."
      : isSchoolStaff(me)
        ? "내 지부의 프로젝트 정보를 확인합니다."
        : "내 프로젝트 정보를 확인하고 수정할 수 있습니다. 팀 매칭 진행 중에는 수정할 수 없습니다."

  const gisuQuery = useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
    enabled: hasAccess,
  })
  const gisuId = gisuQuery.data?.gisuId
    ? Number(gisuQuery.data.gisuId)
    : undefined

  const managedQuery = useQuery({
    queryKey: projectKeys.managedMe(gisuId),
    queryFn: () =>
      getManagedProjects(gisuId!, { size: MANAGED_PROJECTS_PAGE_SIZE }),
    enabled: hasAccess && !!gisuId,
  })

  const chaptersQuery = useQuery({
    queryKey: ["chapters", "with-schools", gisuId],
    queryFn: () => getChaptersWithSchools(String(gisuId!)),
    enabled: useGroupedView && !!gisuId,
  })

  const projects: MatchingProject[] = useMemo(
    () =>
      (managedQuery.data ?? []).map((project) =>
        toMatchingProject(project, managedQuery.dataUpdatedAt),
      ),
    [managedQuery.data, managedQuery.dataUpdatedAt],
  )

  const selectedChapterInfo = useMemo(() => {
    if (!useGroupedView) return undefined
    return chaptersQuery.data?.chapters.find(
      (chapter) => chapter.chapterName === selectedChapter,
    )
  }, [useGroupedView, chaptersQuery.data, selectedChapter])

  const selectedChapterId = selectedChapterInfo?.chapterId
    ? Number(selectedChapterInfo.chapterId)
    : undefined
  const matchingPeriodChapterId =
    selectedChapterId !== undefined && Number.isFinite(selectedChapterId)
      ? selectedChapterId
      : undefined
  const isMatchingPeriod = useIsMatchingPeriod({
    ...(useGroupedView ? { chapterId: matchingPeriodChapterId } : {}),
    enabled: hasAccess,
  })

  const filteredProjects: MatchingProject[] = useMemo(() => {
    if (!useGroupedView) return projects
    if (!selectedChapterInfo) return []
    const schoolNames = new Set(
      selectedChapterInfo.schools.map((s) => s.schoolName),
    )
    return projects.filter((p) => schoolNames.has(p.school))
  }, [useGroupedView, projects, selectedChapterInfo])

  const partGroups = useMemo(() => {
    if (!useGroupedView) return new Map<string, MatchingProject[]>()
    const map = new Map<string, MatchingProject[]>()
    for (const project of filteredProjects) {
      for (const row of project.recruitRows) {
        if (!FE_PART_LABELS.has(row.part)) continue
        if (!map.has(row.part)) map.set(row.part, [])
        map.get(row.part)!.push(project)
      }
    }
    return map
  }, [useGroupedView, filteredProjects])

  const permissionProjectIds = useMemo(() => {
    const ids = new Set<number>()
    for (const project of projects) {
      const id = toValidProjectId(project)
      if (id !== null) ids.add(id)
    }
    return Array.from(ids)
  }, [projects])

  const projectPermissionQueries = useMemo<ResourcePermissionQuery[]>(
    () => [
      {
        resourceType: "PROJECT",
        resourceIds: permissionProjectIds,
        permissionTypes: ["EDIT", "MANAGE", "DELETE"],
      },
    ],
    [permissionProjectIds],
  )

  const projectPermissionsQuery = useResourcePermissionsBatch(
    projectPermissionQueries,
    { enabled: hasAccess },
  )

  const isProjectPermissionLoading =
    permissionProjectIds.length > 0 && projectPermissionsQuery.isPending
  const isProjectListLoading =
    managedQuery.isLoading || (useGroupedView && chaptersQuery.isLoading)

  const getProjectActionPermissions = (project: MatchingProject) => {
    const projectId = toValidProjectId(project)
    if (projectId === null) {
      return {
        canDeleteProject: false,
        canEditProject: false,
        canPublishProject: false,
      }
    }

    return {
      canDeleteProject: projectPermissionsQuery.hasPermission({
        resourceType: "PROJECT",
        resourceId: projectId,
        permissionType: "DELETE",
      }),
      canEditProject: projectPermissionsQuery.hasPermission({
        resourceType: "PROJECT",
        resourceId: projectId,
        permissionType: "EDIT",
      }),
      canPublishProject: projectPermissionsQuery.hasPermission({
        resourceType: "PROJECT",
        resourceId: projectId,
        permissionType: "MANAGE",
      }),
    }
  }

  if (!hasAccess) return null

  return (
    <section className="relative isolate flex w-full min-w-0 flex-col items-stretch justify-start">
      <div className="border-teal-gray-100 bp1:gap-6 bp1:px-6 bp1:pt-6 bp1:pb-8 bp2:px-8.5 bp2:pt-8 bp2:pb-10 relative z-30 flex h-full w-full max-w-242 min-w-0 flex-col gap-5 rounded-[12px] border bg-white px-4 pt-5 pb-6">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 관리
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            {descriptionText}
          </span>
        </div>

        <div className="bp1:gap-8 bp2:gap-10 flex min-w-0 flex-col gap-6">
          {useGroupedView && (
            <div className="min-w-0">
              <SegmentButton
                items={CHAPTERS.map((ch) => ({ value: ch, label: ch }))}
                value={selectedChapter}
                onValueChange={setSelectedChapter}
                className="w-full min-w-0 [&>button>span:last-child]:min-w-0 [&>button>span:last-child]:truncate"
                itemClassName="min-w-0 flex-1 basis-0 shrink px-2"
              />
            </div>
          )}
          {isProjectListLoading ? (
            <p className="text-body-2-regular text-teal-gray-400 py-10 text-center">
              데이터를 불러오는 중...
            </p>
          ) : isAdminScope ? (
            useGroupedView && partGroups.size > 0 ? (
              Array.from(partGroups.entries()).map(([part, partProjects]) => (
                <div key={part} className="flex min-w-0 flex-col">
                  <ProjectManagementSubTitle title={part} className="pb-2" />
                  <div className="bp2:grid-cols-1 bp2:gap-4 grid min-w-0 grid-cols-1 gap-3 min-[700px]:grid-cols-2">
                    {partProjects.map((project) => {
                      const permissions = getProjectActionPermissions(project)
                      return (
                        <ProjectManagementCard
                          key={project.id}
                          data={project}
                          isPermissionLoading={isProjectPermissionLoading}
                          isMatchingPeriod={isMatchingPeriod}
                          {...permissions}
                        />
                      )
                    })}
                  </div>
                </div>
              ))
            ) : !useGroupedView && projects.length > 0 ? (
              <div className="bp2:grid-cols-1 grid min-w-0 grid-cols-1 gap-3 min-[700px]:grid-cols-2">
                {projects.map((project) => {
                  const permissions = getProjectActionPermissions(project)
                  return (
                    <ProjectManagementCard
                      key={project.id}
                      data={project}
                      isPermissionLoading={isProjectPermissionLoading}
                      isMatchingPeriod={isMatchingPeriod}
                      {...permissions}
                    />
                  )
                })}
              </div>
            ) : (
              <EmptyState
                message="등록된 프로젝트가 없습니다."
                subMessage="챌린저들이 프로젝트를 등록한 후 확인할 수 있습니다."
              />
            )
          ) : projects.length > 0 ? (
            <div className="bp2:grid-cols-1 grid min-w-0 grid-cols-1 gap-3 min-[700px]:grid-cols-2">
              {projects.map((project) => {
                const permissions = getProjectActionPermissions(project)
                return (
                  <ProjectManagementCard
                    key={project.id}
                    data={project}
                    isPermissionLoading={isProjectPermissionLoading}
                    isMatchingPeriod={isMatchingPeriod}
                    {...permissions}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              message="등록한 프로젝트가 없습니다."
              subMessage="프로젝트 지원 후 확인할 수 있습니다."
              button={{
                label: "프로젝트 등록으로",
                onClick: () =>
                  navigate({
                    to: "/matching/projects/new",
                    search: { projectId: undefined },
                  }),
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
