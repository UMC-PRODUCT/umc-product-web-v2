import { useQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { getChaptersWithSchools } from "@/entities/organization/api/organization"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

export interface SchoolChapterMapOptions {
  refetchInterval?: number | false
}

export function useSchoolChapterMap(options: SchoolChapterMapOptions = {}) {
  const { data: gisuData } = useActiveGisu()

  const activeGisuId = gisuData?.gisuId ? Number(gisuData.gisuId) : undefined

  const { data: chaptersData } = useQuery({
    queryKey: ["chaptersWithSchools", activeGisuId],
    queryFn: () => getChaptersWithSchools(String(activeGisuId!)),
    enabled: activeGisuId != null,
    staleTime: 5 * 60 * 1000,
    refetchInterval: options.refetchInterval ?? false,
  })

  const chapters = useMemo(() => chaptersData?.chapters ?? [], [chaptersData])

  const schoolToChapterId = useMemo(() => {
    const map = new Map<string, number>()
    for (const chapter of chaptersData?.chapters ?? []) {
      for (const school of chapter.schools) {
        map.set(school.schoolName, Number(chapter.chapterId))
      }
    }
    return map
  }, [chaptersData])

  const chapterNameToId = useMemo(() => {
    const map = new Map<string, number>()
    for (const chapter of chaptersData?.chapters ?? []) {
      map.set(chapter.chapterName, Number(chapter.chapterId))
    }
    return map
  }, [chaptersData])

  const getChapterIdBySchool = useCallback(
    (schoolName: string) => schoolToChapterId.get(schoolName),
    [schoolToChapterId],
  )

  const getChapterIdByName = useCallback(
    (chapterName: string) => chapterNameToId.get(chapterName),
    [chapterNameToId],
  )

  return {
    chapters,
    getChapterIdBySchool,
    getChapterIdByName,
  }
}
