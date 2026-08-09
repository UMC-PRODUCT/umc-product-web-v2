import { createFileRoute, redirect } from "@tanstack/react-router"

import { isRecruitingEditor } from "@/entities/member/model/identity"
import { isChapter } from "@/entities/organization/model/chapters"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { RecruitmentCreatePage } from "@/features/recruiting"
import { isRecruitingListRole } from "@/features/recruiting/model/recruitingListRole"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { notifyAccessDenied } from "@/shared/lib/accessDenied"

import type { Chapter } from "@/entities/organization/model/chapters"
import type { RecruitingListRole } from "@/features/recruiting/model/recruitingListRole"

interface RecruitmentCreateSearch {
  role?: RecruitingListRole
  chapter?: Chapter
  school?: string
}

export const Route = createFileRoute("/recruiting/recruitments/new")({
  // 모집 생성은 서버가 학교 회장단까지만 허용한다. 사이드바에서 감추는 것만으로는
  // 주소를 직접 친 진입을 막지 못해, 다 채우고 저장에서야 거부당한다.
  beforeLoad: async ({ context, location }) => {
    const me = await ensureMe(context.queryClient, location.href)
    if (!isRecruitingEditor(me)) {
      notifyAccessDenied()
      throw redirect({ to: "/recruiting/dashboard/applications" })
    }
  },
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
