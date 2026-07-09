import { useEffect } from "react"

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      if (!element || element.contains(event.target as Node)) {
        return
      }
      callback(event)
    }

    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)

    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [ref, callback])
}
