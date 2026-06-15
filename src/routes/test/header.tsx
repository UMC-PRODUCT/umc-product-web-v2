import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import Header from "@/components/header/Header"
import { MatchingSegmentRegion } from "@/components/sidebar/MatchingSegmentRegion"
import SideBar from "@/components/sidebar/SideBar"
import { useAuthStore } from "@/features/auth/store/authStore"

import type { MemberInfoResponse } from "@/features/auth/api/me"

const PATHNAME_OPTIONS = [
  { label: "소개", value: "/intro" },
  { label: "데모데이 매칭 / 프로젝트 목록", value: "/matching/projects" },
  { label: "데모데이 매칭 / 관리", value: "/matching/projects/management" },
  { label: "데모데이 매칭 / 라운드", value: "/matching/rounds" },
  { label: "데모데이 매칭 / 지원 현황", value: "/matching/status" },
  { label: "데모데이 매칭 / 지원서 목록", value: "/matching/applications" },
  { label: "기타 (active 없음)", value: "/other" },
]

export const Route = createFileRoute("/test/header")({
  component: HeaderTestPage,
})

function HeaderTestPage() {
  const [activePathname, setActivePathname] = useState(
    PATHNAME_OPTIONS[1].value,
  )
  const isReady = useHeaderPreviewUser()

  if (!isReady) return null

  return (
    <main className="h-full min-h-screen w-full">
      <Header activePathname={activePathname} />
      <div className="flex w-full">
        <SideBar activePathname={activePathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="bp2:px-8.5 bp2:pt-14.5 px-4 pt-6">
            <MatchingSegmentRegion activePathname={activePathname} />
          </div>
          <div className="bp2:px-8.5 bp2:pt-8 flex min-w-0 flex-1 flex-col px-4 pt-6">
            <section className="border-teal-gray-100 flex flex-col gap-4 rounded-lg border bg-white p-6">
              <div>
                <h1 className="text-heading-6-semibold text-teal-gray-900">
                  Header / SideBar / Segment 테스트
                </h1>
                <p className="text-body-2-regular text-teal-gray-500 mt-1">
                  pathname을 전환하며 헤더 active 상태와 사이드바·세그먼트를
                  확인합니다.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-label-1-medium text-teal-gray-600">
                  pathname 선택
                </span>
                <div className="flex flex-wrap gap-2">
                  {PATHNAME_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setActivePathname(value)}
                      className={`text-body-3-medium rounded-full border px-3 py-1.5 transition-colors ${
                        activePathname === value
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-teal-gray-200 text-teal-gray-500 hover:border-teal-gray-300 bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-body-3-regular text-teal-gray-400 font-mono">
                  {activePathname}
                </p>
              </div>
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
