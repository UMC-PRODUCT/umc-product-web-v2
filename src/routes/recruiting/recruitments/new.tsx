import { createFileRoute } from "@tanstack/react-router"

import { isChapter } from "@/entities/organization/model/chapters"
import { RecruitmentCreatePage } from "@/features/recruiting"
import { isRecruitingListRole } from "@/features/recruiting/model/recruitingListRole"

import type { Chapter } from "@/entities/organization/model/chapters"
import type { RecruitingListRole } from "@/features/recruiting/model/recruitingListRole"

interface RecruitmentCreateSearch {
  role?: RecruitingListRole
  chapter?: Chapter
  school?: string
}

export const Route = createFileRoute("/recruiting/recruitments/new")({
  validateSearch: (
    search: Record<string, unknown>,
  ): RecruitmentCreateSearch => ({
    role: isRecruitingListRole(search.role) ? search.role : undefined,
    chapter: isChapter(search.chapter) ? search.chapter : undefined,
    school: typeof search.school === "string" ? search.school : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { role, chapter, school } = Route.useSearch()
  return (
    <RecruitmentCreatePage
      role={role}
      initialChapter={chapter}
      initialSchool={school}
    />
  )
}
