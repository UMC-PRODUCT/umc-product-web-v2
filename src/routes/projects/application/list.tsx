import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState } from "react"

import { RecruitingApplicationCard } from "@/features/recruiting"

import type { RecruitingApplication } from "@/features/recruiting"

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
  const [dummyApplications, setDummyApplications] = useState<
    RecruitingApplication[]
  >([
    {
      id: 1,
      name: "한양대학교 ERICA UMC 11기 정규 모집",
      submittedAt: "2026-07-11 23:35",
      result: "fail",
      roles: ["plan"],
      isClosed: true,
      period: "2026-06-15 00:00 ~ 2026-07-11 23:59",
    },
    {
      id: 2,
      name: "한양대학교 ERICA UMC 11기 2차 추가 모집",
      submittedAt: null,
      updatedAt: "2026-07-12 14:22",
      result: null,
      roles: ["design", "mobile-pe"],
      isClosed: true,
      period: "2026-07-12 00:00 ~ 2026-07-15 23:59",
    },
    {
      id: 3,
      name: "한양대학교 ERICA UMC 11기 3차 추가 모집",
      submittedAt: null,
      updatedAt: "2026-07-20 10:15",
      result: null,
      roles: ["web-pe", "plan"],
      isClosed: false,
      dDay: 10,
      period: "2026-07-16 00:00 ~ 2026-07-31 23:59",
    },
    {
      id: 4,
      name: "한양대학교 ERICA UMC 11기 4차 추가 모집",
      submittedAt: "2026-08-05 14:20",
      result: "pass",
      roles: ["springboot", "nodejs"],
      isClosed: true,
      period: "2026-08-01 00:00 ~ 2026-08-05 23:59",
    },
  ])

  const handleDelete = (id: number) => {
    setDummyApplications((prev) => prev.filter((app) => app.id !== id))
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {dummyApplications.map((app) => (
        <RecruitingApplicationCard
          key={app.id}
          application={app}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
