import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import { useAuthStore } from "@/entities/member/store/authStore"
import {
  clearAnonymousApplicationSession,
  mapTrackToPartTag,
  readMemberApplicationRef,
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
  const { data: me } = useMe()
  const memberId = me?.id ?? ""
  const memberEmail = me?.email ?? null

  const memberAppRef = useMemo(
    () => (isAuthed && memberId ? readMemberApplicationRef(memberId) : null),
    [isAuthed, memberId],
  )

  const email = isAuthed
    ? memberEmail
    : typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousEmail")
      : null
  const applicationKey = isAuthed
    ? (memberAppRef?.applicationKey ??
      (typeof window !== "undefined"
        ? sessionStorage.getItem("anonymousApplicationKey")
        : null))
    : typeof window !== "undefined"
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
      <div className="border-teal-gray-150 flex w-full flex-col items-center justify-center gap-2.5 rounded-[14px] border bg-white px-8 py-35">
        <p className="text-body-2-medium text-teal-gray-400">
          조회된 지원서가 없습니다.
        </p>
        <Button
          variant="weak"
          color="neutral"
          size="s"
          onClick={handleResetVerification}
        >
          다른 지원서 확인하기
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
