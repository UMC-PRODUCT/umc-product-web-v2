import { createFileRoute } from "@tanstack/react-router"

import { CurriculumCardSkeleton } from "@/features/curriculum/ui/CurriculumCardSkeleton"

export const Route = createFileRoute("/test/curriculum-skeleton")({
  component: CurriculumSkeletonTestPage,
})

function CurriculumSkeletonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        CurriculumCardSkeleton Test Page
      </h1>

      <div className="flex max-w-242 flex-col gap-3">
        <CurriculumCardSkeleton />
        <CurriculumCardSkeleton />
        <CurriculumCardSkeleton />
      </div>
    </main>
  )
}
