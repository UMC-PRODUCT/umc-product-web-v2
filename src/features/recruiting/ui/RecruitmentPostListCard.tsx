import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { cn } from "@/shared/lib/utils"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import {
  canEditRecruitmentPost,
  groupPostsBySchool,
} from "../model/recruitmentList"
import { RecruitmentPostMoreMenu } from "./RecruitmentPostMoreMenu"
import { RecruitmentPostRow } from "./RecruitmentPostRow"
import { RecruitmentSchoolSection } from "./RecruitmentSchoolSection"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitmentPost } from "../model/recruitmentList"

interface RecruitmentPostListCardProps {
  chapter: Chapter
  posts: RecruitmentPost[]
  permittedSeasonIds: ReadonlySet<string>
  onPrivatize: (postId: string) => void
  onDuplicate: (postId: string) => void
  onDelete: (postId: string) => void
  onUndoDelete: () => void
  onNavigateToArchive: (school: string) => void
  archiveVisibleOnPage: boolean
  schoolFilterActive?: boolean
  className?: string
}

function PostRow({
  post,
  permittedSeasonIds,
  onPrivatize,
  onDuplicate,
  onDelete,
  onUndoDelete,
  onNavigateToArchive,
  archiveVisibleOnPage,
}: {
  post: RecruitmentPost
  permittedSeasonIds: ReadonlySet<string>
  onPrivatize: (postId: string) => void
  onDuplicate: (postId: string) => void
  onDelete: (postId: string) => void
  onUndoDelete: () => void
  onNavigateToArchive: (school: string) => void
  archiveVisibleOnPage: boolean
}) {
  const editable = canEditRecruitmentPost(post, permittedSeasonIds)
  const navigate = useNavigate()

  return (
    <RecruitmentPostRow
      title={post.title}
      startLabel={post.startLabel}
      endLabel={post.endLabel}
      dateLabel={post.dateLabel}
      authorLabel={post.authorLabel}
      status={post.status}
      editable={editable}
      rightAction={
        <RecruitmentPostMoreMenu
          status={post.status}
          onPublish={() => {}}
          onPrivatize={() => onPrivatize(post.postId)}
          onEdit={() =>
            navigate({
              to: "/recruiting/recruitments/edit/$roundId",
              params: { roundId: post.postId },
              search: { seasonId: post.seasonId },
            })
          }
          onDuplicate={() => onDuplicate(post.postId)}
          onDelete={() => onDelete(post.postId)}
          onUndoDelete={onUndoDelete}
          showArchiveLink={!archiveVisibleOnPage}
          onNavigateToArchive={() => onNavigateToArchive(post.school)}
        />
      }
    />
  )
}

export function RecruitmentPostListCard({
  chapter,
  posts,
  permittedSeasonIds,
  onPrivatize,
  onDuplicate,
  onDelete,
  onUndoDelete,
  onNavigateToArchive,
  archiveVisibleOnPage,
  schoolFilterActive = false,
  className,
}: RecruitmentPostListCardProps) {
  const [recruitingOnly, setRecruitingOnly] = useState(false)
  const [bySchool, setBySchool] = useState(false)
  const showBySchool = !schoolFilterActive && bySchool

  // DRAFT(비공개) 글은 학교별 공유 보관함에서만 노출
  const publishedPosts = posts.filter((post) => post.status !== "DRAFT")
  const visiblePosts = recruitingOnly
    ? publishedPosts.filter((post) => post.status === "OPEN")
    : publishedPosts
  const filteredEmpty = publishedPosts.length > 0 && visiblePosts.length === 0

  return (
    <section
      className={cn(
        "border-teal-gray-200 flex w-full flex-col rounded-xl border bg-white px-3 pt-5 pb-8",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between px-5">
        <h3 className="text-heading-6-semibold text-teal-700">
          모집 공고 목록
        </h3>
        {publishedPosts.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={recruitingOnly}
                onChange={setRecruitingOnly}
                variant="primary"
                aria-label="모집 중만 보기"
              />
              <span className="text-body-1-medium text-teal-gray-600">
                모집 중
              </span>
            </label>
            {!schoolFilterActive && (
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={bySchool}
                  onChange={setBySchool}
                  variant="primary"
                  aria-label="학교별로 보기"
                />
                <span className="text-body-1-medium text-teal-gray-600">
                  학교별
                </span>
              </label>
            )}
          </div>
        )}
      </div>
      {publishedPosts.length === 0 ? (
        <p className="text-body-2-regular text-teal-gray-400 mt-1.125 px-5 text-center">
          등록된 모집 공고가 없습니다.
        </p>
      ) : filteredEmpty ? (
        <p className="text-body-2-regular text-teal-gray-400 mt-1.125 px-5 text-center">
          현재 모집 중인 공고가 없습니다.
        </p>
      ) : showBySchool ? (
        <div className="mt-5 flex flex-col gap-8 px-5">
          {groupPostsBySchool(visiblePosts, chapter).map(
            ({ school, posts: schoolPosts }) => {
              const schoolHasPosts = publishedPosts.some(
                (post) => post.school === school,
              )
              return (
                <RecruitmentSchoolSection key={school} schoolName={school}>
                  {schoolPosts.length === 0 ? (
                    <div className="flex w-full items-center justify-center bg-white py-10">
                      <p className="text-body-2-regular text-teal-gray-400">
                        {schoolHasPosts && recruitingOnly
                          ? "현재 모집 중인 공고가 없습니다."
                          : "등록된 모집 공고가 없습니다."}
                      </p>
                    </div>
                  ) : (
                    schoolPosts.map((post) => (
                      <PostRow
                        key={post.postId}
                        post={post}
                        permittedSeasonIds={permittedSeasonIds}
                        onPrivatize={onPrivatize}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        onUndoDelete={onUndoDelete}
                        onNavigateToArchive={onNavigateToArchive}
                        archiveVisibleOnPage={archiveVisibleOnPage}
                      />
                    ))
                  )}
                </RecruitmentSchoolSection>
              )
            },
          )}
        </div>
      ) : (
        <div className="divide-teal-gray-100 mt-1.125 flex flex-col divide-y">
          {visiblePosts.map((post) => (
            <PostRow
              key={post.postId}
              post={post}
              permittedSeasonIds={permittedSeasonIds}
              onPrivatize={onPrivatize}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onUndoDelete={onUndoDelete}
              onNavigateToArchive={onNavigateToArchive}
              archiveVisibleOnPage={archiveVisibleOnPage}
            />
          ))}
        </div>
      )}
    </section>
  )
}
