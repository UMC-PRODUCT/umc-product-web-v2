import { createFileRoute } from "@tanstack/react-router"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/manage/curriculum")({
  component: CurriculumManagePage,
})

function CurriculumManagePage() {
  return (
    <div className="flex w-full flex-col">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "curriculum", label: "커리큘럼" },
        ]}
        title="커리큘럼"
        description="파트와 트랙별 스터디 커리큘럼을 정합니다."
        className="pl-3"
      />
    </div>
  )
}
