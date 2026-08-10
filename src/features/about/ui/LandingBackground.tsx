import { useEffect, useState } from "react"

import bgGraphic from "@/shared/assets/image/about/bg-graphic.svg"

const LEFT_GLOW =
  "linear-gradient(97.82deg, rgba(46, 209, 190, 0.189) 0%, rgba(46, 209, 190, 0) 48.3%)"

const RIGHT_GLOW =
  "linear-gradient(95.65deg, rgba(46, 209, 190, 0) 63.6%, rgba(46, 209, 190, 0.269) 100%)"

export function LandingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 bg-black"
      style={{ backgroundImage: `${RIGHT_GLOW}, ${LEFT_GLOW}` }}
    />
  )
}

export function LandingArtifact() {
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
      className="pointer-events-none fixed top-0 left-0 z-[1] h-screen w-full overflow-hidden transition-opacity duration-300 ease-out"
      style={{ opacity }}
    >
      <img
        src={bgGraphic}
        alt=""
        className="absolute top-[clamp(0px,calc(686px_-_47.6vw),500px)] left-1/2 h-auto w-full origin-top -translate-x-1/2 -translate-y-[23%] scale-100 blur-[10px]"
      />
    </div>
  )
}
