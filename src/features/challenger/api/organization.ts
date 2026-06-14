import { api } from "@/shared/lib/axios"

import type {
  ChapterListResponse,
  ChapterWithSchoolsResponse,
  GisuNameListResponse,
  SchoolNameListResponse,
} from "@/features/challenger/model/types"
import type { ApiResponse } from "@/shared/lib/apiResponse"

/**
 * 백엔드는 ID 류를 항상 numeric string 으로 반환하지만, OpenAPI 스키마와 다르게
 * `id` / `name` 같은 축약 필드명을 쓰는 케이스가 있어 호출 측 타입으로 정규화한다.
 *
 * (근거: api-spec.json 의 GisuNameItem 설명에 "id+번호+isActive" 라고 적혀 있음.)
 */

function toStringId(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

interface RawGisuItem {
  gisuId?: string | number
  id?: string | number
  generation?: string | number
  gisu?: string | number
  isActive?: boolean
}

export async function getAllGisu(): Promise<GisuNameListResponse> {
  const { data } =
    await api.get<ApiResponse<{ gisuList?: RawGisuItem[] } | RawGisuItem[]>>(
      "/v1/gisu/all",
    )
  const raw = Array.isArray(data.result)
    ? data.result
    : (data.result?.gisuList ?? [])

  return {
    gisuList: raw
      .map((item) => ({
        gisuId: toStringId(item.gisuId ?? item.id),
        generation: toStringId(item.generation ?? item.gisu),
        gisu: toStringId(item.gisu ?? item.generation),
        isActive: item.isActive ?? false,
      }))
      .filter((item) => item.gisuId !== ""),
  }
}

export async function getAllChapters(): Promise<ChapterListResponse> {
  const { data } =
    await api.get<ApiResponse<ChapterListResponse>>("/v1/chapters")
  return data.result
}

interface RawSchoolItem {
  schoolId?: string | number
  id?: string | number
  schoolName?: string
  name?: string
}

interface RawChapterWithSchools {
  chapterId?: string | number
  id?: string | number
  chapterName?: string
  name?: string
  schools?: RawSchoolItem[]
}

export async function getChaptersWithSchools(
  gisuId: string,
): Promise<ChapterWithSchoolsResponse> {
  const { data } = await api.get<
    ApiResponse<
      { chapters?: RawChapterWithSchools[] } | RawChapterWithSchools[]
    >
  >("/v1/chapters/with-schools", { params: { gisuId } })

  const raw = Array.isArray(data.result)
    ? data.result
    : (data.result?.chapters ?? [])

  return {
    chapters: raw
      .map((chapter) => ({
        chapterId: toStringId(chapter.chapterId ?? chapter.id),
        chapterName: chapter.chapterName ?? chapter.name ?? "",
        schools: (chapter.schools ?? [])
          .map((school) => ({
            schoolId: toStringId(school.schoolId ?? school.id),
            schoolName: school.schoolName ?? school.name ?? "",
          }))
          .filter((school) => school.schoolId !== ""),
      }))
      .filter((chapter) => chapter.chapterId !== ""),
  }
}

export async function getAllSchools(): Promise<SchoolNameListResponse> {
  const { data } =
    await api.get<ApiResponse<SchoolNameListResponse>>("/v1/schools/all")
  return data.result
}
