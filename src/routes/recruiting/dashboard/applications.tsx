import { createFileRoute } from "@tanstack/react-router"

import { StatCard } from "@/features/recruiting/ui/dashboard/StatCard"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/recruiting/dashboard/applications")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "dashboard", label: "대시보드" },
          { id: "applications", label: "지원 현황" },
        ]}
        title="지원 현황"
        description="지부별, 학교별, 파트별 지원 현황을 실시간으로 확인합니다."
      />
      <StatCard
        title={"총 지원자"}
        count={1000}
        footer={{
          type: "timestamp",
          date: "07/02",
          time: "02:48",
        }}
      />
    </div>
  )
}
