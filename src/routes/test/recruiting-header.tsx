import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { authKeys } from "@/entities/member/hooks/useMe"
import { useAuthStore } from "@/entities/member/store/authStore"
import { LandingHeader } from "@/features/intro/ui/components/LandingHeader"
import { cn } from "@/shared/lib/utils"
import RecruitingHeader from "@/widgets/navigation/header/RecruitingHeader"

import type { MemberInfoResponse } from "@/entities/member/api/me"
import type {
  OrganizationType,
  RoleType,
} from "@/entities/member/model/challenger"
import type { RecruitingStatus } from "@/widgets/navigation/header/RecruitingStatusButton"

export const Route = createFileRoute("/test/recruiting-header")({
  component: RecruitingHeaderTestPage,
})

type RoleScenario =
  | "centralCore"
  | "schoolLeadership"
  | "schoolViceLeadership"
  | "centralStaff"
  | "chapterPresident"
  | "challenger"
  | "guest"

const ROLE_OPTIONS: { label: string; value: RoleScenario }[] = [
  { label: "중앙 핵심", value: "centralCore" },
  { label: "학교 회장", value: "schoolLeadership" },
  { label: "학교 부회장", value: "schoolViceLeadership" },
  { label: "중앙 운영팀원", value: "centralStaff" },
  { label: "지부장", value: "chapterPresident" },
  { label: "챌린저", value: "challenger" },
  { label: "게스트 (비로그인)", value: "guest" },
]

const SCENARIO_ROLE_TYPE: Record<Exclude<RoleScenario, "guest">, RoleType> = {
  centralCore: "CENTRAL_PRESIDENT",
  schoolLeadership: "SCHOOL_PRESIDENT",
  schoolViceLeadership: "SCHOOL_VICE_PRESIDENT",
  centralStaff: "CENTRAL_OPERATING_TEAM_MEMBER",
  chapterPresident: "CHAPTER_PRESIDENT",
  challenger: "CHALLENGER",
}

const SCENARIO_ORGANIZATION_TYPE: Record<
  Exclude<RoleScenario, "guest">,
  OrganizationType
> = {
  centralCore: "CENTRAL",
  schoolLeadership: "SCHOOL",
  schoolViceLeadership: "SCHOOL",
  centralStaff: "CENTRAL",
  chapterPresident: "CHAPTER",
  challenger: "SCHOOL",
}

function makeMe(role: Exclude<RoleScenario, "guest">): MemberInfoResponse {
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
        roleType: SCENARIO_ROLE_TYPE[role],
        organizationType: SCENARIO_ORGANIZATION_TYPE[role],
        organizationId: "1",
        gisuId: "1",
        gisu: "11",
      },
    ],
    challengerRecords: [],
  }
}

const PHASE_OPTIONS: { label: string; value: RecruitingStatus }[] = [
  { label: "진행중", value: { phase: "open" } },
  { label: "마감", value: { phase: "closed" } },
]

type HeaderKind = "app" | "landing"

const HEADER_OPTIONS: { label: string; value: HeaderKind }[] = [
  { label: "앱 안쪽 (Dark=False)", value: "app" },
  { label: "랜딩 소개 (Dark=True)", value: "landing" },
]

function RecruitingHeaderTestPage() {
  const queryClient = useQueryClient()
  const [role, setRole] = useState<RoleScenario>("centralCore")
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [headerKind, setHeaderKind] = useState<HeaderKind>("app")

  // 선택한 역할 시나리오에 맞춰 auth/me를 목킹. 언마운트 시 원복.
  useEffect(() => {
    const prevAuth = useAuthStore.getState()
    const prevMe = queryClient.getQueryData(authKeys.me)

    if (role === "guest") {
      useAuthStore.setState({ isAuthed: false })
      queryClient.removeQueries({ queryKey: authKeys.me })
    } else {
      useAuthStore.setState({ isAuthed: true })
      queryClient.setQueryData(authKeys.me, makeMe(role))
    }

    return () => {
      useAuthStore.setState({ isAuthed: prevAuth.isAuthed })
      queryClient.setQueryData(authKeys.me, prevMe)
    }
  }, [role, queryClient])

  return (
    <main className="min-h-screen w-full">
      {headerKind === "app" ? (
        <RecruitingHeader recruitingStatus={PHASE_OPTIONS[phaseIndex]!.value} />
      ) : (
        // 랜딩 헤더는 fixed 라 그대로 두면 화면 맨 위에 붙는다. transform 을 준
        // 상자가 fixed 의 기준이 되므로 이 자리에 갇혀서 그려진다.
        <div
          className="relative h-20 w-full bg-[#101f1e]"
          style={{ transform: "translateZ(0)" }}
        >
          <LandingHeader recruitingStatus={PHASE_OPTIONS[phaseIndex]!.value} />
        </div>
      )}

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          <span className="text-label-1-medium text-teal-gray-600">헤더</span>
          <div className="flex flex-wrap gap-2">
            {HEADER_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setHeaderKind(value)}
                className={cn(
                  "text-body-3-medium rounded-full border px-3 py-1.5",
                  headerKind === value
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-teal-gray-200 text-teal-gray-500 bg-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {headerKind === "landing" && (
            <p className="text-body-3-regular text-teal-gray-500">
              랜딩 헤더는 탭이 소개·모집 안내·프로젝트 셋뿐이고 역할에 따라
              늘어나지 않는다. 역할 선택은 앱 안쪽 헤더에만 영향을 준다.
            </p>
          )}
        </div>

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
