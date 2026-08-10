export interface School {
  id: string
  name: string
}

export interface ChapterData {
  id: string
  name: string
  assignedSchools: School[]
}

export const INITIAL_UNASSIGNED_SCHOOLS: School[] = []

export const INITIAL_CHAPTERS: ChapterData[] = []

export const UNASSIGNED_PANEL_ID = "unassigned-schools-panel"
export const ASSIGNED_CHIP_PREFIX = "chapter-assigned-"
export const WAITING_CHIP_PREFIX = "waiting-"
export const PANEL_ASSIGNED_CHIP_PREFIX = "panel-assigned-"

export function isSchool(value: unknown): value is School {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  )
}

export function withSchoolsAppended(
  schools: School[],
  added: School[],
): School[] {
  const existingIds = new Set(schools.map((school) => school.id))
  return [...schools, ...added.filter((school) => !existingIds.has(school.id))]
}

export function detachSchool(
  chapters: ChapterData[],
  schoolId: string,
): ChapterData[] {
  return chapters.map((chapter) => ({
    ...chapter,
    assignedSchools: chapter.assignedSchools.filter(
      (school) => school.id !== schoolId,
    ),
  }))
}

export function assignSchoolToChapter(
  chapters: ChapterData[],
  chapterId: string,
  school: School,
): ChapterData[] {
  return chapters.map((chapter) => {
    if (chapter.id !== chapterId) {
      return {
        ...chapter,
        assignedSchools: chapter.assignedSchools.filter(
          (assigned) => assigned.id !== school.id,
        ),
      }
    }
    if (chapter.assignedSchools.some((assigned) => assigned.id === school.id)) {
      return chapter
    }
    return {
      ...chapter,
      assignedSchools: [...chapter.assignedSchools, school],
    }
  })
}

export function clearChapterSchools(
  chapters: ChapterData[],
  chapterId: string,
): ChapterData[] {
  return chapters.map((chapter) =>
    chapter.id === chapterId ? { ...chapter, assignedSchools: [] } : chapter,
  )
}

export function clearAllChapterSchools(chapters: ChapterData[]): ChapterData[] {
  return chapters.map((chapter) => ({ ...chapter, assignedSchools: [] }))
}

export function isDuplicateChapterName(
  chapters: ChapterData[],
  chapterId: string,
  name: string,
): boolean {
  const trimmed = name.trim()
  if (trimmed === "") return false
  return chapters.some(
    (chapter) => chapter.id !== chapterId && chapter.name.trim() === trimmed,
  )
}

export function resolveDropTargetId(
  chapters: ChapterData[],
  unassignedSchools: School[],
  overId: string,
): string | null {
  if (chapters.some((chapter) => chapter.id === overId)) return overId

  const parentChapter = chapters.find((chapter) =>
    chapter.assignedSchools.some(
      (school) =>
        `${ASSIGNED_CHIP_PREFIX}${school.id}` === overId ||
        school.id === overId,
    ),
  )
  if (parentChapter) return parentChapter.id

  if (
    overId === UNASSIGNED_PANEL_ID ||
    overId.startsWith(WAITING_CHIP_PREFIX) ||
    overId.startsWith(PANEL_ASSIGNED_CHIP_PREFIX) ||
    unassignedSchools.some((school) => school.id === overId)
  ) {
    return UNASSIGNED_PANEL_ID
  }

  return null
}
