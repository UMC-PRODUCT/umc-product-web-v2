import { useQuery } from "@tanstack/react-query"

import { getMyInfo } from "../api/me"

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMyInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
