import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useMe } from "@/features/auth/hooks/useMe"
import { useResourcePermissionsBatch } from "@/features/auth/hooks/useResourcePermissionsBatch"
import {
  isAnyOperator,
  isCentralStaff,
  isCurrentTermPm,
  isSuperAdmin,
} from "@/features/auth/model/identity"
import { gisuKeys } from "@/features/project/new/api/queryKeys"
import { getActiveGisu } from "@/shared/api/gisu"

import { getManagedProjects } from "../api"
import { ProjectManagementCard } from "./ProjectManagementCard"
import { ProjectManagementSubTitle } from "./ProjectManagementSubTitle"

import type { ResourcePermissionQuery } from "@/features/auth/api/permissions"
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

function toMatchingProject(item: ProjectSummaryInput): MatchingProject {
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
    coverImage: item.thumbnailImageUrl ? { src: item.thumbnailImageUrl } : null,
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
  const { data: me } = useMe()

  const isAdminScope = isAnyOperator(me)
  const isPm = isCurrentTermPm(me)
  const hasAccess = isAdminScope || isPm
  const useGroupedView = isCentralStaff(me) || isSuperAdmin(me)

  const gisuQuery = useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
    enabled: hasAccess,
  })
  const gisuId = gisuQuery.data?.gisuId
    ? Number(gisuQuery.data.gisuId)
    : undefined

  const managedQuery = useQuery({
    queryKey: ["project", "managed", "me", gisuId],
    queryFn: () =>
      getManagedProjects(gisuId!, { size: MANAGED_PROJECTS_PAGE_SIZE }),
    enabled: hasAccess && !!gisuId,
  })

  const projects: MatchingProject[] = useMemo(
    () => (managedQuery.data ?? []).map(toMatchingProject),
    [managedQuery.data],
  )

  const partGroups = useMemo(() => {
    if (!useGroupedView) return new Map<string, MatchingProject[]>()
    const map = new Map<string, MatchingProject[]>()
    for (const project of projects) {
      for (const row of project.recruitRows) {
        if (!FE_PART_LABELS.has(row.part)) continue
        if (!map.has(row.part)) map.set(row.part, [])
        map.get(row.part)!.push(project)
      }
    }
    return map
  }, [useGroupedView, projects])

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

  const getProjectActionPermissions = (project: MatchingProject) => {
    const projectId = toValidProjectId(project)
    if (projectId === null) {
      return {
        canDeleteProject: false,
        canEditProject: false,
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
    }
  }

  if (!hasAccess) return null

  return (
    <section className="relative flex w-full flex-col items-start justify-start">
      <div className="border-teal-gray-100 relative z-30 flex h-full min-w-242 flex-col gap-6 rounded-[12px] border bg-white px-8.5 pt-8 pb-10">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 관리
          </span>
          <span className="text-body-2-regular text-teal-gray-600">
            모든 프로젝트의 상세 정보를 확인하고 수정할 수 있습니다.
            <br />
            단, 매칭 중에는 일부 수정이 제한됩니다.
          </span>
        </div>

        <div className="flex flex-col gap-10">
          {managedQuery.isLoading ? (
            <p className="text-body-2-regular text-teal-gray-400 py-10 text-center">
              데이터를 불러오는 중...
            </p>
          ) : useGroupedView ? (
            partGroups.size > 0 ? (
              Array.from(partGroups.entries()).map(([part, partProjects]) => (
                <div key={part} className="flex flex-col">
                  <ProjectManagementSubTitle title={part} className="pb-2" />
                  <div className="flex flex-col gap-4">
                    {partProjects.map((project) => {
                      const permissions = getProjectActionPermissions(project)
                      return (
                        <ProjectManagementCard
                          key={project.id}
                          data={project}
                          isPermissionLoading={isProjectPermissionLoading}
                          {...permissions}
                        />
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-body-2-medium text-teal-gray-400 py-10 text-center">
                등록된 프로젝트가 없습니다.
              </p>
            )
          ) : projects.length > 0 ? (
            <div className="flex flex-col gap-3">
              {projects.map((project) => {
                const permissions = getProjectActionPermissions(project)
                return (
                  <ProjectManagementCard
                    key={project.id}
                    data={project}
                    isPermissionLoading={isProjectPermissionLoading}
                    {...permissions}
                  />
                )
              })}
            </div>
          ) : (
            <p className="text-body-2-medium text-teal-gray-400 py-10 text-center">
              등록된 프로젝트가 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
