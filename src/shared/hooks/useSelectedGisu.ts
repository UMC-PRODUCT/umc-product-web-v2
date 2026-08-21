import { useActiveGisu } from "@/shared/hooks/useActiveGisu"
import { useSelectedGisuStore } from "@/shared/model/useSelectedGisuStore"

interface SelectedGisuResult {
  data: number | null
  isLoading: boolean
}

export function useSelectedGisuId(): SelectedGisuResult {
  const selected = useSelectedGisuStore((s) => s.selected)
  const { data: activeGisu, isLoading } = useActiveGisu({
    enabled: selected == null,
  })

  if (selected?.gisuId != null) {
    return { data: Number(selected.gisuId), isLoading: false }
  }
  return {
    data: activeGisu?.gisuId != null ? Number(activeGisu.gisuId) : null,
    isLoading,
  }
}

export function useSelectedGeneration(): SelectedGisuResult {
  const selected = useSelectedGisuStore((s) => s.selected)
  const { data: activeGisu, isLoading } = useActiveGisu({
    enabled: selected == null,
  })

  if (selected?.generation != null) {
    return { data: Number(selected.generation), isLoading: false }
  }
  return {
    data: activeGisu?.generation != null ? Number(activeGisu.generation) : null,
    isLoading,
  }
}
