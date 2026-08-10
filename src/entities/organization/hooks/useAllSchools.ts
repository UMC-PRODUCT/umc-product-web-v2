import { useQuery } from "@tanstack/react-query"

import { getAllSchools } from "@/entities/organization/api/organization"

interface UseAllSchoolsOptions {
  enabled?: boolean
}

export function useAllSchools(options: UseAllSchoolsOptions = {}) {
  return useQuery({
    queryKey: ["schools", "all"],
    queryFn: getAllSchools,
    enabled: options.enabled ?? true,
    staleTime: Infinity,
  })
}
