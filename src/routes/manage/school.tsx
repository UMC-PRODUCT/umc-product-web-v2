import { createFileRoute } from "@tanstack/react-router"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/manage/school")({
  component: SchoolManagePage,
})

function SchoolManagePage() {
  return (
    <div className="flex w-full flex-col">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "school", label: "학교 관리" },
        ]}
        title="학교 관리"
        description="UMC 11기 소속의 학교 정보를 관리합니다."
        className="pl-3"
      />
    </div>
  )
}
