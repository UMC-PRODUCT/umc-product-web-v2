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

interface RecruitmentPostListCardProps {
  chapter: Chapter
  posts: RecruitmentPost[]
  role: RecruitingListRole
  editScope: RecruitmentEditScope
  schoolFilterActive?: boolean
  className?: string
}

function PostRow({
  post,
  role,
  editScope,
}: {
  post: RecruitmentPost
  role: RecruitingListRole
  editScope: RecruitmentEditScope
}) {
  const editable = canEditRecruitmentPost(role, post, editScope)

  return (
    <RecruitmentPostRow
      title={post.title}
      startLabel={post.startLabel}
      endLabel={post.endLabel}
      dateLabel={post.dateLabel}
      authorLabel={post.authorLabel}
      done={post.status === "CLOSED"}
      editable={editable}
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

export function RecruitmentPostListCard({
  chapter,
  posts,
  role,
  editScope,
  schoolFilterActive = false,
  className,
}: RecruitmentPostListCardProps) {
  const [recruitingOnly, setRecruitingOnly] = useState(false)
  const [bySchool, setBySchool] = useState(false)
  const showBySchool = !schoolFilterActive && bySchool
  // TODO: API 연동 시 sort=NEWEST|REGISTERED|RECRUITMENT 쿼리 파라미터로 서버 정렬 연결 (RECRUITING-PUBLIC-001/ADMIN-011)
  const [sort, setSort] = useState<RecruitmentSort>("NEWEST")
  const [sortOpen, setSortOpen] = useState(false)

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
                        role={role}
                        editScope={editScope}
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
              role={role}
              editScope={editScope}
            />
          ))}
        </div>
      )}
    </section>
  )
}
