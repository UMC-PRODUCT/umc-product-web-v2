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

import type { RecruitingListRole } from "../model/recruitingListRole"
import type { RecruitmentPost } from "../model/recruitmentList"

interface RecruitmentDraftArchiveCardProps {
  chapter: Chapter
  role: RecruitingListRole
  posts: RecruitmentPost[]
  permittedSeasonIds: ReadonlySet<string>
  onPublish: (postId: string) => void
  onDuplicate: (postId: string) => void
  onDelete: (postId: string) => void
  onUndoDelete: () => void
  selectedSchool?: string | null
  title?: string
  className?: string
}

function DraftPostRow({
  post,
  role,
  chapter,
  permittedSeasonIds,
  onPublish,
  onDuplicate,
  onDelete,
  onUndoDelete,
}: {
  post: RecruitmentPost
  role: RecruitingListRole
  chapter: Chapter
  permittedSeasonIds: ReadonlySet<string>
  onPublish: (postId: string) => void
  onDuplicate: (postId: string) => void
  onDelete: (postId: string) => void
  onUndoDelete: () => void
}) {
  const navigate = useNavigate()

  return (
    <RecruitmentPostRow
      title={post.title}
      startLabel={post.startLabel}
      endLabel={post.endLabel}
      dateLabel={post.dateLabel}
      authorLabel={post.authorLabel}
      status={post.status}
      editable={canEditRecruitmentPost(post, permittedSeasonIds)}
      rightAction={
        <RecruitmentPostMoreMenu
          status={post.status}
          role={role}
          ownChapter={chapter}
          onPublish={() => onPublish(post.postId)}
          // 임시 보관함 안에서는 이미 DRAFT라 비공개 액션이 노출되지 않음
          onPrivatize={() => {}}
          // DRAFT는 아직 공개된 적이 없어 처음 쓰던 흐름 그대로 이어 쓰는 편이
          // 자연스럽다. 문항만 고치는 수정 화면 대신 생성 마법사로 되돌린다.
          onEdit={() =>
            navigate({
              to: "/recruiting/recruitments/new",
              search: {
                draftRoundId: post.postId,
                draftSeasonId: post.seasonId,
              },
            })
          }
          onDuplicate={() => onDuplicate(post.postId)}
          onDelete={() => onDelete(post.postId)}
          onUndoDelete={onUndoDelete}
        />
      }
    />
  )
}

export function RecruitmentDraftArchiveCard({
  chapter,
  role,
  posts,
  permittedSeasonIds,
  onPublish,
  onDuplicate,
  onDelete,
  onUndoDelete,
  selectedSchool = null,
  title = "학교별 공유 보관함",
  className,
}: RecruitmentDraftArchiveCardProps) {
  // TODO: API 연동 시 "내가 쓴 글"을 작성자 기준으로 실제 필터링
  const [myPostsOnly, setMyPostsOnly] = useState(false)

  // 임시 보관함(공유 보관함)에는 비공개 처리된 DRAFT 상태 글만 노출
  const draftPosts = posts.filter((post) => post.status === "DRAFT")
  const selectedSchoolPosts = selectedSchool
    ? draftPosts.filter((post) => post.school === selectedSchool)
    : draftPosts

  return (
    <section
      className={cn(
        "border-teal-gray-100 flex w-full flex-col rounded-xl border bg-white px-3 pt-5 pb-8",
        className,
      )}
    >
      <div className="flex h-10 items-center justify-between px-5">
        <h3 className="text-heading-6-semibold text-teal-700">{title}</h3>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={myPostsOnly}
              onChange={setMyPostsOnly}
              variant="primary"
              aria-label="내가 쓴 글만 보기"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              내가 쓴 글
            </span>
          </label>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-8 px-5">
        {selectedSchool ? (
          <RecruitmentSchoolSection schoolName={selectedSchool}>
            {selectedSchoolPosts.length === 0 ? (
              <div className="flex w-full items-center bg-white px-5 py-4.5">
                <p className="text-body-2-medium text-teal-gray-400">
                  등록된 임시 보관글이 없습니다.
                </p>
              </div>
            ) : (
              selectedSchoolPosts.map((post) => (
                <DraftPostRow
                  key={post.postId}
                  post={post}
                  role={role}
                  chapter={chapter}
                  permittedSeasonIds={permittedSeasonIds}
                  onPublish={onPublish}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onUndoDelete={onUndoDelete}
                />
              ))
            )}
          </RecruitmentSchoolSection>
        ) : (
          groupPostsBySchool(draftPosts, chapter).map(
            ({ school, posts: schoolPosts }) => (
              <RecruitmentSchoolSection key={school} schoolName={school}>
                {schoolPosts.length === 0 ? (
                  <div className="flex w-full items-center bg-white px-5 py-4.5">
                    <p className="text-body-2-medium text-teal-gray-400">
                      등록된 임시 보관글이 없습니다.
                    </p>
                  </div>
                ) : (
                  schoolPosts.map((post) => (
                    <DraftPostRow
                      key={post.postId}
                      post={post}
                      role={role}
                      chapter={chapter}
                      permittedSeasonIds={permittedSeasonIds}
                      onPublish={onPublish}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                      onUndoDelete={onUndoDelete}
                    />
                  ))
                )}
              </RecruitmentSchoolSection>
            ),
          )
        )}
      </div>
    </section>
  )
}
