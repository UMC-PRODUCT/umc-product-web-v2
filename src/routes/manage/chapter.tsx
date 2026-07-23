import { createFileRoute } from "@tanstack/react-router"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

export const Route = createFileRoute("/manage/chapter")({
  component: ChapterManagePage,
})

function ChapterManagePage() {
  return (
    <div className="flex w-full flex-col">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "chapter", label: "지부 관리" },
        ]}
        title="지부 관리"
        description="지부를 만들고 드래그 앤 드롭으로 소속 학교를 정합니다."
        className="pl-3"
      />
    </div>
  )
}
