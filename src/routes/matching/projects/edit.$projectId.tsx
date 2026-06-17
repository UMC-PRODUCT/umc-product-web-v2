import { createFileRoute, redirect } from "@tanstack/react-router"

import { getResourcePermission } from "@/features/auth/api/permissions"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { hasGrantedPermission } from "@/features/auth/model/resourcePermission"
import { ProjectRegisterPage } from "@/features/project/new/ui/ProjectRegisterPage"

export const Route = createFileRoute("/matching/projects/edit/$projectId")({
  params: {
    parse: (raw) => ({ projectId: Number(raw.projectId) }),
    stringify: (params) => ({ projectId: String(params.projectId) }),
  },
  beforeLoad: async ({ context, params }) => {
    await ensureMe(context.queryClient)

    const projectId = params.projectId
    if (!Number.isInteger(projectId) || projectId <= 0) {
      throw redirect({ to: "/matching/projects" })
    }

    let hasEditPermission = false
    try {
      const permission = await context.queryClient.ensureQueryData({
        queryKey: [
          "authorization",
          "resource-permission",
          "PROJECT",
          projectId,
          "EDIT",
        ],
        queryFn: () =>
          getResourcePermission({
            resourceType: "PROJECT",
            resourceId: projectId,
            permissionType: "EDIT",
          }),
        staleTime: 0,
      })
      hasEditPermission = hasGrantedPermission(permission, "EDIT")
    } catch {
      throw redirect({ to: "/matching/projects" })
    }

    if (!hasEditPermission) {
      throw redirect({ to: "/matching/projects" })
    }
  },
  component: EditProjectPage,
})

function EditProjectPage() {
  const { projectId } = Route.useParams()
  return <ProjectRegisterPage mode="edit" editProjectId={projectId} />
}
