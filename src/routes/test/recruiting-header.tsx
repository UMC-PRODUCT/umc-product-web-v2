import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { authKeys } from "@/entities/member/hooks/useMe"
import { useAuthStore } from "@/entities/member/store/authStore"
import { cn } from "@/shared/lib/utils"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"

import type { MemberInfoResponse } from "@/entities/member/api/me"
import type { RoleType } from "@/entities/member/model/challenger"
import type { RecruitingStatus } from "@/widgets/navigation/header/RecruitingStatusButton"

export const Route = createFileRoute("/test/recruiting-header")({
  component: RecruitingHeaderTestPage,
})

// 역할 시나리오: 관리자급 / 운영진급 / 챌린저급 / 게스트
type RoleScenario = "admin" | "operator" | "challenger" | "guest"

const ROLE_OPTIONS: { label: string; value: RoleScenario }[] = [
  { label: "관리자급 (SUPER/중앙)", value: "admin" },
  { label: "운영진급 (지부장/교내)", value: "operator" },
  { label: "챌린저급", value: "challenger" },
  { label: "게스트 (비로그인)", value: "guest" },
]

const SCENARIO_ROLE_TYPE: Record<Exclude<RoleScenario, "guest">, RoleType> = {
  admin: "CENTRAL_OPERATING_TEAM_MEMBER",
  operator: "CHAPTER_PRESIDENT",
  challenger: "CHALLENGER",
}

function makeMe(roleType: RoleType): MemberInfoResponse {
  return {
    id: "1",
    name: "미리보기",
    nickname: "preview",
    email: "preview@example.com",
    hasLocalCredential: false,
    schoolId: "1",
    schoolName: "UMC 대학교",
    profileImageLink: null,
    status: "ACTIVE",
    roles: [
      {
        challengerRoleId: "1",
        challengerId: "1",
        roleType,
        organizationType: "CENTRAL",
        organizationId: "1",
        gisuId: "1",
        gisu: "11",
      },
    ],
    challengerRecords: [],
  }
}

const PHASE_OPTIONS: { label: string; value: RecruitingStatus }[] = [
  { label: "모집 직전", value: { phase: "before", dDay: 7 } },
  { label: "진행중", value: { phase: "open", dDay: 22 } },
  { label: "마감", value: { phase: "closed" } },
]

function RecruitingHeaderTestPage() {
  const queryClient = useQueryClient()
  const [role, setRole] = useState<RoleScenario>("admin")
  const [phaseIndex, setPhaseIndex] = useState(1)

  // 선택한 역할 시나리오에 맞춰 auth/me를 목킹. 언마운트 시 원복.
  useEffect(() => {
    const prevAuth = useAuthStore.getState()
    const prevMe = queryClient.getQueryData(authKeys.me)

    if (role === "guest") {
      useAuthStore.setState({ isAuthed: false })
      queryClient.removeQueries({ queryKey: authKeys.me })
    } else {
      useAuthStore.setState({ isAuthed: true })
      queryClient.setQueryData(authKeys.me, makeMe(SCENARIO_ROLE_TYPE[role]))
    }

    return () => {
      useAuthStore.setState({ isAuthed: prevAuth.isAuthed })
      queryClient.setQueryData(authKeys.me, prevMe)
    }
  }, [role, queryClient])

  return (
    <main className="min-h-screen w-full">
      <RecruitingHeader recruitingStatus={PHASE_OPTIONS[phaseIndex]!.value} />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <span className="text-label-1-medium text-teal-gray-600">역할</span>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={cn(
                  "text-body-3-medium rounded-full border px-3 py-1.5",
                  role === value
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-teal-gray-200 text-teal-gray-500 bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-label-1-medium text-teal-gray-600">
            모집 상태
          </span>
          <div className="flex flex-wrap gap-2">
            {PHASE_OPTIONS.map(({ label }, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setPhaseIndex(index)}
                className={cn(
                  "text-body-3-medium rounded-full border px-3 py-1.5",
                  phaseIndex === index
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-teal-gray-200 text-teal-gray-500 bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
