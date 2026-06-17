import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router"

import { getResourcePermission } from "@/features/auth/api/permissions"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isProjectRegistrationQuotaLimited } from "@/features/auth/model/identity"
import { hasGrantedPermission } from "@/features/auth/model/resourcePermission"
import { getManagedProjects } from "@/features/project/management/api"
import { getMyDraft, gisuKeys, projectKeys } from "@/features/project/new/api"
import { ProjectRegisterPage } from "@/features/project/new/ui/ProjectRegisterPage"
import { getActiveGisu } from "@/shared/api/gisu"

export const Route = createFileRoute("/matching/projects/new")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)

    let hasWritePermission = false
    try {
      const permission = await context.queryClient.ensureQueryData({
        queryKey: [
          "authorization",
          "resource-permission",
          "PROJECT",
          undefined,
          "WRITE",
        ],
        queryFn: () =>
          getResourcePermission({
            resourceType: "PROJECT",
            permissionType: "WRITE",
          }),
        staleTime: 0,
      })
      hasWritePermission = hasGrantedPermission(permission, "WRITE")
    } catch {
      throw redirect({ to: "/matching/projects" })
    }

    if (!hasWritePermission) {
      throw redirect({ to: "/matching/projects" })
    }

    if (isProjectRegistrationQuotaLimited(me)) {
      try {
        const gisu = await context.queryClient.ensureQueryData({
          queryKey: gisuKeys.active,
          queryFn: getActiveGisu,
        })
        const gisuId = gisu?.gisuId ? Number(gisu.gisuId) : undefined
        if (gisuId) {
          const draft = await context.queryClient.ensureQueryData({
            queryKey: projectKeys.draft(gisuId),
            queryFn: () => getMyDraft(gisuId),
          })
          if (draft?.status === "DRAFT") {
            return
          }
          const managed = await context.queryClient.ensureQueryData({
            queryKey: projectKeys.managedCheck(gisuId),
            queryFn: () => getManagedProjects(gisuId),
          })
          const blockingProjects = managed.filter(
            (project) => project.status !== "PENDING_REVIEW",
          )
          if (blockingProjects.length > 0) {
            throw redirect({
              to: "/matching/projects/management",
              search: { notice: "duplicate" },
            })
          }
        }
      } catch (error) {
        if (isRedirect(error)) throw error
      }
    }
  },
  component: NewProjectPage,
})

function NewProjectPage() {
  return <ProjectRegisterPage mode="new" />
}
