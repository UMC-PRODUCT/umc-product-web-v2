// 사용자의 지부 정보 조회 가능 훅입니다. (CHAPTER-102 연결)

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { getChaptersWithSchools } from "@/features/challenger/api/organization"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"

export function useSchoolChapterMap() {
  const { data: gisuData } = useActiveGisu()

  const activeGisuId = gisuData?.gisuId ? Number(gisuData.gisuId) : undefined

  const { data: chaptersData } = useQuery({
    queryKey: ["chaptersWithSchools", activeGisuId],
    queryFn: () => getChaptersWithSchools(String(activeGisuId!)),
    enabled: activeGisuId != null,
    staleTime: 5 * 60 * 1000,
  })

  const schoolToChapterId = useMemo(() => {
    const map = new Map<string, number>()
    for (const chapter of chaptersData?.chapters ?? []) {
      for (const school of chapter.schools) {
        map.set(school.schoolName, Number(chapter.chapterId))
      }
    }
    return map
  }, [chaptersData])

  return {
    getChapterIdBySchool: (schoolName: string) =>
      schoolToChapterId.get(schoolName),
  }
}
