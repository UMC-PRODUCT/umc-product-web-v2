import { useEffect, useState } from "react"

import bgGraphic from "@/shared/assets/image/about/bg-graphic.svg"

export function LandingBackground() {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const updateOpacity = () => {
      setOpacity(Math.max(0.35, 1 - window.scrollY / 700))
    }

    updateOpacity()
    window.addEventListener("scroll", updateOpacity, { passive: true })

    return () => window.removeEventListener("scroll", updateOpacity)
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ease-out"
      style={{ opacity }}
    >
      <img
        src={bgGraphic}
        alt=""
        className="absolute top-0 left-1/2 h-354 w-360 origin-top -translate-x-1/2 scale-90"
      />
    </div>
  )
}
