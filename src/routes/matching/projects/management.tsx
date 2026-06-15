import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { canManageProjects } from "@/features/auth/model/identity"
import { ProjectManagementPage } from "@/features/project/management"

export const Route = createFileRoute("/matching/projects/management")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { notice?: "duplicate" } =>
    search.notice === "duplicate" ? { notice: "duplicate" } : {},
  beforeLoad: async ({ context, location }) => {
    const me = await ensureMe(context.queryClient, location.href)
    if (!canManageProjects(me)) throw redirect({ to: "/matching/projects" })
  },
  component: ProjectManagementRoute,
})

function ProjectManagementRoute() {
  const { notice } = Route.useSearch()
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    if (notice !== "duplicate") return
    addToast({
      message: "등록된 프로젝트가 이미 존재 합니다.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    void navigate({ to: "/matching/projects/management", replace: true })
  }, [notice, navigate, addToast])

  return <ProjectManagementPage />
}
