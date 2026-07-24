import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { useEffect, useRef, useState } from "react"

const DRAG_ACTIVATION_DISTANCE = 5

interface UseChipAssignmentOptions {
  onRemoveSelected: (chipId: string) => void
}

export function useChipAssignment<T>({
  onRemoveSelected,
}: UseChipAssignmentOptions) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
  )
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<T | null>(null)

  const removeSelectedRef = useRef(onRemoveSelected)
  useEffect(() => {
    removeSelectedRef.current = onRemoveSelected
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeTag = document.activeElement?.tagName
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return

      if (event.key === "Escape") {
        setSelectedChipId(null)
        return
      }

      if (
        selectedChipId &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        removeSelectedRef.current(selectedChipId)
        setSelectedChipId(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedChipId])

  return {
    sensors,
    selectedChipId,
    setSelectedChipId,
    activeItem,
    setActiveItem,
  }
}
