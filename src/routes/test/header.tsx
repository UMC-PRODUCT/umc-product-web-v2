import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import Header from "@/components/header/Header"
import { MatchingSegmentRegion } from "@/components/sidebar/MatchingSegmentRegion"
import SideBar from "@/components/sidebar/SideBar"
import { useAuthStore } from "@/features/auth/store/authStore"

import type { MemberInfoResponse } from "@/features/auth/api/me"

const HEADER_PREVIEW_PATHNAME = "/matching/projects/management"

export const Route = createFileRoute("/test/header")({
  component: HeaderTestPage,
})

function HeaderTestPage() {
  const isReady = useHeaderPreviewUser()

  if (!isReady) return null

  return (
    <main className="h-full min-h-screen w-full">
      <Header activePathname={HEADER_PREVIEW_PATHNAME} />
      <div className="flex w-full">
        <SideBar activePathname={HEADER_PREVIEW_PATHNAME} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="bp2:px-8.5 bp2:pt-14.5 px-4 pt-6">
            <MatchingSegmentRegion activePathname={HEADER_PREVIEW_PATHNAME} />
          </div>
          <div className="bp2:px-8.5 bp2:pt-8 flex min-h-screen min-w-0 flex-1 flex-col px-4 pt-6">
            <section className="border-teal-gray-100 flex flex-col gap-3 rounded-lg border bg-white p-6">
              <h1 className="text-heading-6-semibold text-teal-gray-900">
                Header Test Page
              </h1>
              <p className="text-body-2-regular text-teal-gray-500">
                실제 매칭 workflow 레이아웃과 같은 Header, SideBar, Segment
                조합에서 반응형 상태를 확인합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

export const HEADER_PREVIEW_USER: MemberInfoResponse = {
  id: "1",
  name: "김운영",
  nickname: "운영자",
  email: "operator@example.com",
  hasLocalCredential: false,
  schoolId: "1",
  schoolName: "UMC 대학교",
  profileImageLink: null,
  status: "ACTIVE",
  roles: [
    {
      challengerRoleId: "1",
      challengerId: "1",
      roleType: "CENTRAL_OPERATING_TEAM_MEMBER",
      organizationType: "CENTRAL",
      organizationId: "1",
      gisuId: "1",
      gisu: "9",
    },
  ],
  challengerRecords: [
    {
      challengerId: "1",
      memberId: "1",
      gisuId: "1",
      gisu: "9",
      chapterId: "1",
      chapterName: "Seoul",
      part: "WEB",
      challengerStatus: "ACTIVE",
      name: "김운영",
      nickname: "운영자",
      email: "operator@example.com",
      schoolId: "1",
      schoolName: "UMC 대학교",
      profileImageLink: "",
      status: "ACTIVE",
    },
  ],
}

export function useHeaderPreviewUser() {
  const queryClient = useQueryClient()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const previousAuthState = useAuthStore.getState()
    const previousAuthQuery = queryClient.getQueryData(["auth", "me"])

    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      memberId: null,
      isAuthed: false,
    })
    queryClient.setQueryData(["auth", "me"], HEADER_PREVIEW_USER)
    setIsReady(true)

    return () => {
      useAuthStore.setState({
        accessToken: previousAuthState.accessToken,
        refreshToken: previousAuthState.refreshToken,
        memberId: previousAuthState.memberId,
        isAuthed: previousAuthState.isAuthed,
      })
      queryClient.setQueryData(["auth", "me"], previousAuthQuery)
    }
  }, [queryClient])

  return isReady
}
