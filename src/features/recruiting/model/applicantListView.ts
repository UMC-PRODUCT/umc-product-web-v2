import {
  type Chapter,
  CHAPTERS,
  isChapter,
} from "@/entities/organization/model/chapters"
import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

import type { ApplicantListFilters, ApplicantRow } from "./applicantListTypes"

export type ApplicantListViewKind = "single" | "chapterGroups" | "schoolGroups"

export function resolveApplicantListViewKind(
  filters: ApplicantListFilters,
): ApplicantListViewKind {
  if (filters.chapterTab !== "all") return "schoolGroups"
  if (filters.bySchool) return "schoolGroups"
  if (filters.chapters.length > 0) return "chapterGroups"
  return "single"
}

export function resolveScopeChapters(filters: ApplicantListFilters): Chapter[] {
  if (filters.chapterTab !== "all") {
    return isChapter(filters.chapterTab) ? [filters.chapterTab] : []
  }
  const selected = filters.chapters.filter(isChapter)
  return selected.length > 0
    ? CHAPTERS.filter((chapter) => selected.includes(chapter))
    : [...CHAPTERS]
}

export interface ChapterGroup {
  chapter: Chapter
  rows: ApplicantRow[]
}

export function groupRowsByChapter(
  rows: ApplicantRow[],
  chapters: Chapter[],
): ChapterGroup[] {
  return chapters
    .map((chapter) => ({
      chapter,
      rows: rows.filter((row) => row.chapter === chapter),
    }))
    .filter((group) => group.rows.length > 0)
}

export interface SchoolGroup {
  school: string
  rows: ApplicantRow[]
}

export interface ChapterSchoolGroup {
  chapter: Chapter
  schools: SchoolGroup[]
}

export function groupRowsBySchool(
  rows: ApplicantRow[],
  chapters: Chapter[],
): ChapterSchoolGroup[] {
  return groupRowsByChapter(rows, chapters)
    .map(({ chapter, rows: chapterRows }) => ({
      chapter,
      schools: SCHOOLS_BY_BRANCH[chapter]
        .map((school) => ({
          school,
          rows: chapterRows.filter((row) => row.school === school),
        }))
        .filter((group) => group.rows.length > 0),
    }))
    .filter((group) => group.schools.length > 0)
}
