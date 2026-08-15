import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"

import { useAuthStore } from "@/entities/member/store/authStore"
import {
  clearAnonymousApplicationSession,
  mapTrackToPartTag,
  RecruitingApplicationCard,
  useAnonymousApplicationQuery,
  useCancelAnonymousApplication,
  useCancelMyApplication,
  useMyRecruitingApplicationsQuery,
} from "@/features/recruiting"
import { Button } from "@/shared/ui/Button"

import type {
  RecruitingApplication,
  RecruitingMyApplicationResponse,
} from "@/features/recruiting"
import type { PartTag } from "@/shared/model/domain"

function toRecruitingApplication(
  data: RecruitingMyApplicationResponse,
  fallbackName: string,
): RecruitingApplication | null {
  if (data.cancelled || data.applicationId == null) return null
  const roles = [
    mapTrackToPartTag(data.firstChoice),
    mapTrackToPartTag(data.secondChoice),
  ].filter((role): role is PartTag => role !== null)

  const result =
    data.finalResult === "APPROVED"
      ? "pass"
      : data.finalResult === "REJECTED"
        ? "fail"
        : null

  const rawData = data as {
    submittedAt?: string
    updatedAt?: string
    period?: string
  }

  return {
    id: data.applicationId,
    name: data.applicantName
      ? `${data.applicantName}님의 지원서`
      : fallbackName,
    isSubmitted: data.submitted,
    submittedAt: data.submitted ? (rawData.submittedAt ?? null) : null,
    updatedAt: !data.submitted ? (rawData.updatedAt ?? null) : null,
    result,
    roles,
    isClosed: !data.editable,
    period: rawData.period ?? null,
  }
}

export const Route = createFileRoute("/projects/application/list")({
  // 개인 지원 정보라 색인시키지 않는다.
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isAuthed = useAuthStore.getState().isAuthed
      const isVerified = sessionStorage.getItem("isApplicationVerified")
      if (!isAuthed && isVerified !== "true") {
        throw redirect({ to: "/projects/application" })
      }
    }
  },
  component: ApplicationListPage,
})

function ApplicationListPage() {
  const navigate = useNavigate()
  const isAuthed = useAuthStore((s) => s.isAuthed)

  const email =
    !isAuthed && typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousEmail")
      : null
  const applicationKey =
    !isAuthed && typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousApplicationKey")
      : null

  const { data: anonymousData, isLoading: isAnonymousLoading } =
    useAnonymousApplicationQuery(email, applicationKey)
  const cancelAnonymousMutation = useCancelAnonymousApplication()

  const myApplicationsQuery = useMyRecruitingApplicationsQuery()
  const cancelMyApplicationMutation = useCancelMyApplication()

  const myApplications = useMemo<RecruitingApplication[]>(() => {
    if (!isAuthed) return []
    return (myApplicationsQuery.data ?? [])
      .map((data) => toRecruitingApplication(data, "지원서"))
      .filter((application): application is RecruitingApplication =>
        Boolean(application),
      )
  }, [isAuthed, myApplicationsQuery.data])

  const anonymousApplication = useMemo<RecruitingApplication | null>(() => {
    if (isAuthed) return null
    return toRecruitingApplication(anonymousData ?? {}, "익명 지원서")
  }, [isAuthed, anonymousData])

  const handleDeleteMyApplication = (id: number) => {
    cancelMyApplicationMutation.mutate(String(id))
  }

  const handleDeleteAnonymous = () => {
    if (!email || !applicationKey) return
    cancelAnonymousMutation.mutate({ email, applicationKey })
  }

  const handleResetVerification = () => {
    clearAnonymousApplicationSession()
    void navigate({ to: "/projects/application" })
  }

  const isLoading = isAuthed
    ? myApplicationsQuery.isLoading
    : isAnonymousLoading

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p className="text-body-1-medium text-teal-gray-500">
          지원서를 불러오는 중입니다...
        </p>
      </div>
    )
  }

  if (isAuthed) {
    if (myApplications.length === 0) {
      return (
        <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
          <p className="text-body-1-medium text-teal-gray-500">
            아직 지원한 내역이 없어요.
          </p>
        </div>
      )
    }

    return (
      <div className="flex w-full flex-col gap-8">
        {myApplications.map((application) => (
          <RecruitingApplicationCard
            key={application.id}
            application={application}
            onDelete={handleDeleteMyApplication}
          />
        ))}
      </div>
    )
  }

  if (!anonymousApplication) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
        <p className="text-body-1-medium text-teal-gray-500">
          조회된 지원서가 없습니다.
        </p>
        <Button
          variant="fill"
          color="neutral"
          size="m"
          onClick={handleResetVerification}
        >
          다른 지원서 조회하기
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <RecruitingApplicationCard
        key={anonymousApplication.id}
        application={anonymousApplication}
        onDelete={handleDeleteAnonymous}
      />
    </div>
  )
}
