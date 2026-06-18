import { useQuery } from "@tanstack/react-query"

import { getActiveGisu } from "@/shared/api/gisu"

export const gisuKeys = {
  active: ["gisu", "active"] as const,
}

export function useActiveGisu(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useActiveGisuId(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
    staleTime: 5 * 60 * 1000,
    select: (data) => (data?.gisuId != null ? Number(data.gisuId) : null),
    ...options,
  })
}
