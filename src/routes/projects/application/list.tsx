import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  clearAnonymousApplicationSession,
  mapTrackToPartTag,
  RecruitingApplicationCard,
  useAnonymousApplicationQuery,
  useCancelAnonymousApplication,
} from "@/features/recruiting"
import { Button } from "@/shared/ui/Button"

import type { RecruitingApplication } from "@/features/recruiting"
import type { PartTag } from "@/shared/model/domain"

export const Route = createFileRoute("/projects/application/list")({
  // 개인 지원 정보라 색인시키지 않는다.
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isVerified = sessionStorage.getItem("isApplicationVerified")
      if (isVerified !== "true") {
        throw redirect({ to: "/projects/application" })
      }
    }
  },
  component: ApplicationListPage,
})

function ApplicationListPage() {
  const navigate = useNavigate()

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousEmail")
      : null
  const applicationKey =
    typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousApplicationKey")
      : null

  const { data, isLoading } = useAnonymousApplicationQuery(
    email,
    applicationKey,
  )
  const cancelMutation = useCancelAnonymousApplication()

  const application = useMemo<RecruitingApplication | null>(() => {
    if (!data || data.cancelled || data.applicationId == null) return null
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
        : "익명 지원서",
      isSubmitted: data.submitted,
      submittedAt: data.submitted ? (rawData.submittedAt ?? null) : null,
      updatedAt: !data.submitted ? (rawData.updatedAt ?? null) : null,
      result,
      roles,
      isClosed: !data.editable,
      period: rawData.period ?? null,
    }
  }, [data])

  const handleDelete = () => {
    if (!email || !applicationKey) return
    cancelMutation.mutate({ email, applicationKey })
  }

  const handleResetVerification = () => {
    clearAnonymousApplicationSession()
    void navigate({ to: "/projects/application" })
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p className="text-body-1-medium text-teal-gray-500">
          지원서를 불러오는 중입니다...
        </p>
      </div>
    )
  }

  if (!application) {
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
        key={application.id}
        application={application}
        onDelete={handleDelete}
      />
    </div>
  )
}
