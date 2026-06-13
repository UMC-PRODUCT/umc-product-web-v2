import { api } from "@/shared/lib/axios"

export async function abortProject(
  projectId: number,
  reason: string,
): Promise<void> {
  await api.post(`/v1/projects/${projectId}/abort`, { reason })
}
