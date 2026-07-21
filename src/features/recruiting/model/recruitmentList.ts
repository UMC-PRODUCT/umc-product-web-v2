import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

import type { Chapter } from "@/entities/organization/model/chapters"

export type RecruitmentPostStatus = "recruiting" | "closed" | "draft"

export interface RecruitmentPost {
  postId: string
  chapter: Chapter
  school: string
  title: string
  status: RecruitmentPostStatus
  startLabel?: string
  endLabel?: string
  dateLabel?: string
  authorLabel?: string
}

export interface ChapterPostGroup {
  chapter: Chapter
  posts: RecruitmentPost[]
}

export function groupPostsByChapter(
  posts: RecruitmentPost[],
  chapters: Chapter[],
): ChapterPostGroup[] {
  return chapters.map((chapter) => ({
    chapter,
    posts: posts.filter((post) => post.chapter === chapter),
  }))
}

export interface SchoolPostGroup {
  school: string
  posts: RecruitmentPost[]
}

export function groupPostsBySchool(
  posts: RecruitmentPost[],
  chapter: Chapter,
): SchoolPostGroup[] {
  return SCHOOLS_BY_BRANCH[chapter].map((school) => ({
    school,
    posts: posts.filter((post) => post.school === school),
  }))
}
