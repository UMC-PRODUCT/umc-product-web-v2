import { useMemo } from "react"

import { useAllSchools } from "@/entities/organization/hooks/useAllSchools"
import { formatSchoolName } from "@/shared/lib/formatSchoolName"

export interface UseSchoolsOptions {
  nameType?: "full" | "short"
}

export function useSchools(options: UseSchoolsOptions = {}) {
  const { nameType = "short" } = options

  const query = useAllSchools()

  const schools = useMemo(() => {
    return (
      query.data?.schools.map((school) => {
        const shortName = formatSchoolName(school.schoolName)
        return {
          schoolId: school.schoolId,
          schoolName: nameType === "short" ? shortName : school.schoolName,
          originalName: school.schoolName,
          shortName,
        }
      }) ?? []
    )
  }, [query.data, nameType])

  return {
    ...query,
    schools,
  }
}
