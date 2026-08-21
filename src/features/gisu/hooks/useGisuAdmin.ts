import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  activateGisu,
  createGisu,
  getGisuList,
} from "@/features/gisu/api/gisuAdmin"
import { gisuKeys } from "@/shared/hooks/useActiveGisu"

import type { CreateGisuRequest } from "@/features/gisu/api/gisuAdmin"

const gisuListKey = ["gisu", "list"] as const

export function useGisuList(params: { page: number; size: number }) {
  return useQuery({
    queryKey: [...gisuListKey, params],
    queryFn: () => getGisuList(params),
    staleTime: 30 * 1000,
  })
}

export function useCreateGisu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateGisuRequest) => createGisu(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gisuListKey })
    },
  })
}

export function useActivateGisu() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gisuId: number) => activateGisu(gisuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gisuListKey })
      queryClient.invalidateQueries({ queryKey: gisuKeys.active })
    },
  })
}
