import { projectKeys } from "./queryKeys"

import type { QueryClient } from "@tanstack/react-query"

export function invalidateProjectSummaryQueries(
  queryClient: QueryClient,
  projectId?: number,
) {
  void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
  void queryClient.invalidateQueries({ queryKey: ["matchingProjects"] })
  void queryClient.invalidateQueries({ queryKey: projectKeys.managed() })

  if (projectId === undefined) return

  void queryClient.invalidateQueries({
    queryKey: projectKeys.detail(projectId),
  })
  void queryClient.invalidateQueries({ queryKey: ["projectDetail", projectId] })
}
