import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createChapter,
  createChaptersBulk,
  deleteChapter,
} from "@/entities/organization/api/chapterApi"

import type {
  CreateChapterBulkRequest,
  CreateChapterRequest,
} from "@/entities/organization/model/chapterTypes"

/** 지부 생성 뮤테이션 훅 */
export function useCreateChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateChapterRequest) => createChapter(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}

/** 지부 일괄 생성 뮤테이션 훅 */
export function useCreateChaptersBulk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateChapterBulkRequest) => createChaptersBulk(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}

/** 지부 삭제 뮤테이션 훅 */
export function useDeleteChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chapterId: string | number) => deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] })
      queryClient.invalidateQueries({ queryKey: ["chaptersWithSchools"] })
    },
  })
}
