export interface School {
  id: string
  name: string
}

export interface ChapterData {
  id: string
  name: string
  assignedSchools: School[]
}

export const INITIAL_UNASSIGNED_SCHOOLS: School[] = [
  { id: "school-1", name: "경희대학교" },
  { id: "school-2", name: "서울시립대학교" },
  { id: "school-3", name: "인하대학교" },
  { id: "school-4", name: "국민대학교" },
]

export const INITIAL_CHAPTERS: ChapterData[] = [
  {
    id: "chapter-chromium",
    name: "Chromium",
    assignedSchools: [
      { id: "school-5", name: "중앙대학교" },
      { id: "school-6", name: "홍익대학교" },
    ],
  },
  {
    id: "chapter-ferrum",
    name: "Ferrum",
    assignedSchools: [
      { id: "school-7", name: "연세대학교" },
      { id: "school-8", name: "고려대학교" },
    ],
  },
  {
    id: "chapter-neon",
    name: "Neon",
    assignedSchools: [
      { id: "school-9", name: "서울대학교" },
      { id: "school-10", name: "성균관대학교" },
    ],
  },
  {
    id: "chapter-platinum",
    name: "Platinum",
    assignedSchools: [
      { id: "school-11", name: "한양대학교" },
      { id: "school-12", name: "서강대학교" },
    ],
  },
  {
    id: "chapter-selenium",
    name: "Selenium",
    assignedSchools: [
      { id: "school-13", name: "이화여자대학교" },
      { id: "school-14", name: "건국대학교" },
    ],
  },
  {
    id: "chapter-xenon",
    name: "Xenon",
    assignedSchools: [
      { id: "school-15", name: "동국대학교" },
      { id: "school-16", name: "숭실대학교" },
    ],
  },
]

export const UNASSIGNED_PANEL_ID = "unassigned-schools-panel"
export const ASSIGNED_CHIP_PREFIX = "chapter-assigned-"

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
    overId.startsWith("waiting-") ||
    overId.startsWith("panel-assigned-") ||
    unassignedSchools.some((school) => school.id === overId)
  ) {
    return UNASSIGNED_PANEL_ID
  }

  return null
}
