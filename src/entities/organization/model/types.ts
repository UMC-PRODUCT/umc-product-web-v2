// 조직 구조 도메인 타입(기수/지부/학교).

export interface GisuNameItem {
  gisuId: string
  generation: string
  gisu: string
  isActive: boolean
}

export interface GisuNameListResponse {
  gisuList: GisuNameItem[]
}

export interface ChapterItem {
  id: string
  name: string
}

export interface ChapterListResponse {
  chapters: ChapterItem[]
}

export interface SchoolItem {
  schoolId: string
  schoolName: string
}

export interface ChapterWithSchools {
  chapterId: string
  chapterName: string
  schools: SchoolItem[]
}

export interface ChapterWithSchoolsResponse {
  chapters: ChapterWithSchools[]
}

export interface SchoolNameListResponse {
  schools: SchoolItem[]
}
