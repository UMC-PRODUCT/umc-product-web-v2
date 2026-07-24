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
