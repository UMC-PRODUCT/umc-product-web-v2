import { useEffect, useRef } from "react"

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: (event: PointerEvent) => void,
  enabled = true,
) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const handler = (event: PointerEvent) => {
      const element = ref.current
      const target = event.target
      if (!element || !(target instanceof Node) || element.contains(target)) {
        return
      }
      savedCallback.current(event)
    }

    document.addEventListener("pointerdown", handler)

    return () => {
      document.removeEventListener("pointerdown", handler)
    }
  }, [ref, enabled])
}
