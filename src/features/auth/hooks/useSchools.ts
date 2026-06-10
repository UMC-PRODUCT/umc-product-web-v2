import { useQuery } from "@tanstack/react-query"

import { formatSchoolName } from "@/shared/lib/formatSchoolName"

import { getAllSchools } from "../api/school"

export interface UseSchoolsOptions {
  nameType?: "full" | "short"
}

export function useSchools(options: UseSchoolsOptions = {}) {
  const { nameType = "short" } = options

  const query = useQuery({
    queryKey: ["schools"],
    queryFn: getAllSchools,
  })

  const schools =
    query.data?.schools.map((school) => {
      const shortName = formatSchoolName(school.schoolName)
      return {
        schoolId: school.schoolId,
        schoolName: nameType === "short" ? shortName : school.schoolName,
        originalName: school.schoolName,
        shortName,
      }
    }) ?? []

  return {
    ...query,
    schools,
  }
}
