import { useState } from "react"

import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import {
  groupPostsByChapter,
  groupPostsBySchool,
} from "../model/recruitmentList"
import {
  RECRUITING_MY_CHAPTER_MOCK,
  RECRUITMENT_LIST_MOCK,
} from "../model/recruitmentList.mock"
import { ChapterTabs } from "./ChapterTabs"
import { RecruitmentPostListCard } from "./RecruitmentPostListCard"
import { RecruitmentPostRow } from "./RecruitmentPostRow"
import { RecruitmentSchoolSection } from "./RecruitmentSchoolSection"
import { SchoolTabs } from "./SchoolTabs"

import type { RecruitingListRole } from "../model/recruitingListRole"
import type { RecruitmentPost } from "../model/recruitmentList"

interface RecruitmentListPageProps {
  role?: RecruitingListRole
  posts?: RecruitmentPost[]
}

export function RecruitmentListPage({
  role = "central",
  posts = RECRUITMENT_LIST_MOCK,
}: RecruitmentListPageProps) {
  const [chapterTab, setChapterTab] = useState("all")
  const [schoolTab, setSchoolTab] = useState("all")

  const scopeChapters =
    chapterTab === "all"
      ? [...CHAPTERS]
      : isChapter(chapterTab)
        ? [chapterTab]
        : []
  const chapterGroups = groupPostsByChapter(posts, scopeChapters)
  const schoolGroups = groupPostsBySchool(posts, RECRUITING_MY_CHAPTER_MOCK)
  const visibleSchoolGroups = schoolGroups.filter(
    ({ school }) => schoolTab === "all" || school === schoolTab,
  )

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "recruitment-management", label: "모집 관리" },
          { id: "recruitment-list", label: "모집 목록" },
        ]}
        title="모집 목록"
        description="지부별, 학교별 모집 공고를 확인하고 관리합니다."
        className="pl-3"
      />
      {role === "central" && (
        <ChapterTabs
          value={chapterTab}
          onValueChange={setChapterTab}
          className="mt-8"
        />
      )}
      {role === "chapterAdmin" && (
        <SchoolTabs
          schools={SCHOOLS_BY_BRANCH[RECRUITING_MY_CHAPTER_MOCK]}
          value={schoolTab}
          onValueChange={setSchoolTab}
          className="mt-8"
        />
      )}

      {role === "central" && (
        <div className="mt-8 flex flex-col gap-11">
          {chapterGroups.map(({ chapter, posts: chapterPosts }) => (
            <section key={chapter} className="flex flex-col">
              <h2 className="text-heading-5-semibold px-3 text-teal-700">
                {chapter}
              </h2>
              <RecruitmentPostListCard
                chapter={chapter}
                posts={chapterPosts}
                className="mt-5"
              />
            </section>
          ))}
        </div>
      )}

      {role === "chapterAdmin" && (
        <section className="flex flex-col">
          <h2 className="text-heading-5-semibold mt-6 px-3 text-teal-700">
            {RECRUITING_MY_CHAPTER_MOCK}
          </h2>
          <div className="mt-4 flex flex-col gap-8">
            {visibleSchoolGroups.map(({ school, posts: schoolPosts }) => (
              <RecruitmentSchoolSection key={school} schoolName={school}>
                {schoolPosts.length === 0 ? (
                  <div className="flex w-full items-center justify-center bg-white py-10">
                    <p className="text-body-2-regular text-teal-gray-400">
                      등록된 모집 공고가 없습니다.
                    </p>
                  </div>
                ) : (
                  schoolPosts.map((post) => (
                    <RecruitmentPostRow
                      key={post.postId}
                      title={post.title}
                      startLabel={post.startLabel}
                      endLabel={post.endLabel}
                      dateLabel={post.dateLabel}
                      authorLabel={post.authorLabel}
                      done={post.status === "closed"}
                    />
                  ))
                )}
              </RecruitmentSchoolSection>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
