import { useState } from "react"

import { cn } from "@/shared/lib/utils"
import { FilterDropdown } from "@/shared/ui/FilterDropDown"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"

import {
  canEditRecruitmentPost,
  groupPostsBySchool,
  RECRUITMENT_SORT_OPTIONS,
} from "../model/recruitmentList"
import { RecruitmentPostMoreMenu } from "./RecruitmentPostMoreMenu"
import { RecruitmentPostRow } from "./RecruitmentPostRow"
import { RecruitmentSchoolSection } from "./RecruitmentSchoolSection"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingListRole } from "../model/recruitingListRole"
import type {
  RecruitmentEditScope,
  RecruitmentPost,
  RecruitmentSort,
} from "../model/recruitmentList"

interface RecruitmentDraftArchiveCardProps {
  chapter: Chapter
  posts: RecruitmentPost[]
  role: RecruitingListRole
  editScope: RecruitmentEditScope
  selectedSchool?: string | null
  title?: string
  className?: string
}

function DraftPostRow({
  post,
  role,
  editScope,
}: {
  post: RecruitmentPost
  role: RecruitingListRole
  editScope: RecruitmentEditScope
}) {
  return (
    <RecruitmentPostRow
      title={post.title}
      startLabel={post.startLabel}
      endLabel={post.endLabel}
      dateLabel={post.dateLabel}
      authorLabel={post.authorLabel}
      done={post.status === "CLOSED"}
      editable={canEditRecruitmentPost(role, post, editScope)}
      rightAction={
        <RecruitmentPostMoreMenu
          status={post.status}
          onPublish={() => alert("공개하기")}
          onPrivatize={() => alert("비공개하기")}
          onEdit={() => alert("수정하기")}
          onDuplicate={() => alert("복제하기")}
          onDelete={() => alert("삭제")}
        />
      }
    />
  )
}

export function RecruitmentDraftArchiveCard({
  chapter,
  posts,
  role,
  editScope,
  selectedSchool = null,
  title = "학교별 공유 보관함",
  className,
}: RecruitmentDraftArchiveCardProps) {
  // TODO: API 연동 시 "내가 쓴 글"을 작성자 기준으로 실제 필터링
  const [myPostsOnly, setMyPostsOnly] = useState(false)
  const [sort, setSort] = useState<RecruitmentSort>("NEWEST")
  const [sortOpen, setSortOpen] = useState(false)

  // 임시 보관함(공유 보관함)에는 비공개 처리된 DRAFT 상태 글만 노출
  const draftPosts = posts.filter((post) => post.status === "DRAFT")

  return (
    <section
      className={cn(
        "border-teal-gray-200 flex w-full flex-col rounded-xl border bg-white px-3 pt-5 pb-8",
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
          <FilterDropdown
            label="최신 순"
            multiSelect={false}
            className="border-teal-gray-300 text-teal-gray-900 hover:bg-teal-gray-50 h-10 bg-white"
            open={sortOpen}
            onClick={() => setSortOpen((prev) => !prev)}
            onRequestClose={() => setSortOpen(false)}
            options={RECRUITMENT_SORT_OPTIONS}
            selectedValue={sort}
            selectedLabel={
              RECRUITMENT_SORT_OPTIONS.find((option) => option.value === sort)
                ?.label
            }
            onSelect={(value) => setSort(value as RecruitmentSort)}
          />
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-8 px-5">
        {selectedSchool ? (
          <RecruitmentSchoolSection schoolName={selectedSchool}>
            {draftPosts.length === 0 ? (
              <div className="flex w-full items-center justify-center bg-white py-10">
                <p className="text-body-2-regular text-teal-gray-400">
                  등록된 임시 보관글이 없습니다.
                </p>
              </div>
            ) : (
              draftPosts.map((post) => (
                <DraftPostRow
                  key={post.postId}
                  post={post}
                  role={role}
                  editScope={editScope}
                />
              ))
            )}
          </RecruitmentSchoolSection>
        ) : (
          groupPostsBySchool(draftPosts, chapter).map(
            ({ school, posts: schoolPosts }) => (
              <RecruitmentSchoolSection key={school} schoolName={school}>
                {schoolPosts.length === 0 ? (
                  <div className="flex w-full items-center justify-center bg-white py-10">
                    <p className="text-body-2-regular text-teal-gray-400">
                      등록된 임시 보관글이 없습니다.
                    </p>
                  </div>
                ) : (
                  schoolPosts.map((post) => (
                    <DraftPostRow
                      key={post.postId}
                      post={post}
                      role={role}
                      editScope={editScope}
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
