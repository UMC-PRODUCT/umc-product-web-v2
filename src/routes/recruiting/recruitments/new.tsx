import { createFileRoute } from "@tanstack/react-router"

import { isChapter } from "@/entities/organization/model/chapters"
import { RecruitmentCreatePage } from "@/features/recruiting"
import { isRecruitingListRole } from "@/features/recruiting/model/recruitingListRole"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

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
  ): RecruitmentCreateSearch => {
    const chapter = isChapter(search.chapter) ? search.chapter : undefined
    const school =
      chapter &&
      typeof search.school === "string" &&
      (SCHOOLS_BY_BRANCH[chapter] as readonly string[]).includes(search.school)
        ? search.school
        : undefined

    return {
      role: isRecruitingListRole(search.role) ? search.role : undefined,
      chapter,
      school,
    }
  },
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
