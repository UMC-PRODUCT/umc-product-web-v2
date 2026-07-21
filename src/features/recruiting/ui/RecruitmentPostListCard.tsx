import { cn } from "@/shared/lib/utils"

import { RecruitmentPostRow } from "./RecruitmentPostRow"

import type { RecruitmentPost } from "../model/recruitmentList"

interface RecruitmentPostListCardProps {
  posts: RecruitmentPost[]
  className?: string
}

export function RecruitmentPostListCard({
  posts,
  className,
}: RecruitmentPostListCardProps) {
  return (
    <section
      className={cn(
        "border-teal-gray-200 flex w-full flex-col rounded-xl border bg-white px-3 py-5",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between px-5">
        <h3 className="text-heading-6-semibold text-teal-700">
          모집 공고 목록
        </h3>
      </div>
      {posts.length === 0 ? (
        <p className="text-body-2-regular text-teal-gray-400 mt-1.125 px-5 text-center">
          등록된 모집 공고가 없습니다.
        </p>
      ) : (
        <div className="divide-teal-gray-100 mt-1.125 flex flex-col divide-y">
          {posts.map((post) => (
            <RecruitmentPostRow
              key={post.postId}
              title={post.title}
              startLabel={post.startLabel}
              endLabel={post.endLabel}
              dateLabel={post.dateLabel}
              authorLabel={post.authorLabel}
              done={post.status === "closed"}
            />
          ))}
        </div>
      )}
    </section>
  )
}
