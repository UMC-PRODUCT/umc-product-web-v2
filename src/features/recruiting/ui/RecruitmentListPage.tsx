import { useState } from "react"

import { CHAPTERS, isChapter } from "@/entities/organization/model/chapters"
import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"
import { IconButton } from "@/shared/ui/button/IconButton"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { groupPostsByChapter } from "../model/recruitmentList"
import {
  RECRUITING_MY_CHAPTER_MOCK,
  RECRUITING_MY_SCHOOL_MOCK,
  RECRUITMENT_LIST_MOCK,
} from "../model/recruitmentList.mock"
import { ChapterTabs } from "./ChapterTabs"
import { RecruitmentCreateButton } from "./RecruitmentCreateButton"
import { RecruitmentDraftArchiveCard } from "./RecruitmentDraftArchiveCard"
import { RecruitmentPostListCard } from "./RecruitmentPostListCard"
import { RecruitmentSchoolSearchDropdown } from "./RecruitmentSchoolSearchDropdown"
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
  const [schoolSearchOpen, setSchoolSearchOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)

  const scopeChapters =
    chapterTab === "all"
      ? [...CHAPTERS]
      : isChapter(chapterTab)
        ? [chapterTab]
        : []
  const chapterGroups = groupPostsByChapter(posts, scopeChapters)
  const myChapterPosts = posts.filter(
    (post) => post.chapter === RECRUITING_MY_CHAPTER_MOCK,
  )
  const myScopedPosts =
    schoolTab === "all"
      ? myChapterPosts
      : myChapterPosts.filter((post) => post.school === schoolTab)
  const editScope = {
    myChapter: RECRUITING_MY_CHAPTER_MOCK,
    mySchool: RECRUITING_MY_SCHOOL_MOCK,
  }

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
          onValueChange={(value) => {
            setChapterTab(value)
            setSelectedSchool(null)
          }}
          className="mt-8"
        />
      )}
      {(role === "chapterAdmin" || role === "schoolStaff") && (
        <SchoolTabs
          schools={SCHOOLS_BY_BRANCH[RECRUITING_MY_CHAPTER_MOCK]}
          value={schoolTab}
          onValueChange={setSchoolTab}
          className="mt-8"
        />
      )}

      {role === "central" && (
        <div className="mt-8 flex flex-col gap-11">
          {chapterGroups.map(({ chapter, posts: chapterPosts }) => {
            const scopedPosts = selectedSchool
              ? chapterPosts.filter((post) => post.school === selectedSchool)
              : chapterPosts

            return (
              <section key={chapter} className="flex flex-col">
                <div className="flex items-end justify-between px-3">
                  <div className="relative flex items-center gap-2.5">
                    <h2 className="text-heading-5-semibold text-teal-700">
                      {selectedSchool ?? chapter}
                    </h2>
                    {chapterTab !== "all" && (
                      <IconButton
                        variant="weak"
                        aria-label="학교 검색"
                        onClick={() => setSchoolSearchOpen((prev) => !prev)}
                        className="bg-teal-gray-100 text-teal-gray-700 hover:bg-teal-gray-150 h-7.5 min-h-7.5 w-7.5 min-w-0 rounded-[0.625rem] p-0"
                      >
                        <DownChevronIcon className="h-4 w-4" />
                      </IconButton>
                    )}
                    <RecruitmentSchoolSearchDropdown
                      open={schoolSearchOpen}
                      chapter={chapter}
                      onOpenChange={setSchoolSearchOpen}
                      onSelect={(school) => setSelectedSchool(school)}
                    />
                  </div>
                  {chapterTab !== "all" && (
                    <RecruitmentCreateButton
                      onClick={() => alert("모집 공고")}
                      className="translate-y-1"
                    />
                  )}
                </div>
                <RecruitmentPostListCard
                  chapter={chapter}
                  posts={scopedPosts}
                  role={role}
                  editScope={editScope}
                  schoolFilterActive={selectedSchool !== null}
                  className="mt-5"
                />
                {chapterTab !== "all" && (
                  <div className="mt-11 flex flex-col gap-5">
                    <h2 className="text-heading-5-semibold pl-3 text-teal-700">
                      {chapter}
                    </h2>
                    <RecruitmentDraftArchiveCard
                      chapter={chapter}
                      posts={scopedPosts}
                      role={role}
                      editScope={editScope}
                      selectedSchool={selectedSchool}
                    />
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {role === "chapterAdmin" && (
        <section className="mt-8 flex flex-col">
          <h2 className="text-heading-5-semibold pl-3 text-teal-700">
            {schoolTab === "all" ? RECRUITING_MY_CHAPTER_MOCK : schoolTab}
          </h2>
          <RecruitmentPostListCard
            chapter={RECRUITING_MY_CHAPTER_MOCK}
            posts={myScopedPosts}
            role={role}
            editScope={editScope}
            schoolFilterActive={schoolTab !== "all"}
            className="mt-5"
          />
          <div className="mt-11 flex flex-col gap-5">
            <h2 className="text-heading-5-semibold pl-3 text-teal-700">
              {schoolTab === "all" ? RECRUITING_MY_CHAPTER_MOCK : schoolTab}
            </h2>
            <RecruitmentDraftArchiveCard
              chapter={RECRUITING_MY_CHAPTER_MOCK}
              posts={myScopedPosts}
              role={role}
              editScope={editScope}
              selectedSchool={schoolTab === "all" ? null : schoolTab}
            />
          </div>
        </section>
      )}

      {role === "schoolStaff" && (
        <section className="mt-8 flex flex-col">
          <h2 className="text-heading-5-semibold pl-3 text-teal-700">
            {schoolTab === "all" ? RECRUITING_MY_CHAPTER_MOCK : schoolTab}
          </h2>
          <RecruitmentPostListCard
            chapter={RECRUITING_MY_CHAPTER_MOCK}
            posts={myScopedPosts}
            role={role}
            editScope={editScope}
            schoolFilterActive={schoolTab !== "all"}
            className="mt-5"
          />
          {schoolTab === RECRUITING_MY_SCHOOL_MOCK && (
            <div className="mt-11 flex flex-col gap-5">
              <h2 className="text-heading-5-semibold pl-3 text-teal-700">
                {schoolTab}
              </h2>
              <RecruitmentDraftArchiveCard
                chapter={RECRUITING_MY_CHAPTER_MOCK}
                posts={myScopedPosts}
                role={role}
                editScope={editScope}
                selectedSchool={schoolTab}
                title="공유 보관함"
              />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
