import { createFileRoute } from "@tanstack/react-router"

import {
  RecruitmentPostMoreMenu,
  RecruitmentPostRow,
} from "@/features/recruiting"

export const Route = createFileRoute("/test/recruitment-post-row")({
  component: RecruitmentPostRowTestPage,
})

function RecruitmentPostRowTestPage() {
  return (
    <main className="flex min-h-screen w-full flex-col gap-6 px-8 py-10">
      <div className="flex w-260 flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          1) 모집 공고 글 - Edit (모집중)
        </h1>
        <RecruitmentPostRow
          title="제목"
          startLabel="2000-00-00 00:00"
          endLabel="00-00 23:59"
          editable
          rightAction={
            <RecruitmentPostMoreMenu
              status="recruiting"
              onPrivatize={() => alert("비공개하기")}
              onEdit={() => alert("수정하기")}
              onDuplicate={() => alert("복제하기")}
              onDelete={() => alert("삭제")}
            />
          }
        />
      </div>

      <div className="flex w-260 flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          2) 모집 공고 글 - Read Only
        </h1>
        <RecruitmentPostRow
          title="제목"
          startLabel="2000-00-00 00:00"
          endLabel="00-00 23:59"
          editable={false}
        />
      </div>

      <div className="flex w-260 flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          3) 모집 마감된 글
        </h1>
        <RecruitmentPostRow
          title="제목"
          startLabel="2000-00-00 00:00"
          endLabel="00-00 23:59"
          done
          editable
          rightAction={
            <RecruitmentPostMoreMenu
              status="closed"
              onPrivatize={() => alert("비공개하기")}
              onDuplicate={() => alert("복제하기")}
              onDelete={() => alert("삭제")}
            />
          }
        />
      </div>

      <div className="flex w-260 flex-col gap-4">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          4) 임시 보관글
        </h1>
        <RecruitmentPostRow
          title="제목"
          dateLabel="2026.00.00"
          authorLabel="이방토/이예원 · 한양대 ERICA"
          editable
          rightAction={
            <RecruitmentPostMoreMenu
              status="draft"
              onPublish={() => alert("공개하기")}
              onEdit={() => alert("수정하기")}
              onDuplicate={() => alert("복제하기")}
              onDelete={() => alert("삭제")}
            />
          }
        />
      </div>
    </main>
  )
}
