import { createFileRoute, redirect } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  mapTrackToPartTag,
  RecruitingApplicationCard,
  useAnonymousApplicationQuery,
  useCancelAnonymousApplication,
} from "@/features/recruiting"

import type { RecruitingApplication } from "@/features/recruiting"
import type { PartTag } from "@/shared/model/domain"

export const Route = createFileRoute("/projects/application/list")({
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

    return {
      id: data.applicationId,
      name: data.applicantName
        ? `${data.applicantName}님의 지원서`
        : "익명 지원서",
      submittedAt: data.submitted ? "제출 완료" : null,
      updatedAt: !data.submitted ? "임시 저장됨" : null,
      result,
      roles,
      isClosed: !data.editable,
      period: "",
    }
  }, [data])

  const handleDelete = () => {
    if (!email || !applicationKey) return
    cancelMutation.mutate({ email, applicationKey })
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
      <div className="flex w-full items-center justify-center py-20">
        <p className="text-body-1-medium text-teal-gray-500">
          조회된 지원서가 없습니다.
        </p>
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
