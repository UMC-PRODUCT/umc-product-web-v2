type SmoothGlowProps = {
  left: number
  top: number
  width: number
  height: number
  color?: string
  opacity?: number
  blur?: number
  scale?: number
}

export function SmoothGlow({
  left,
  top,
  width,
  height,
  color = "54, 211, 192",
  opacity = 0.22,
  blur = 120,
  scale = 1,
}: SmoothGlowProps) {
  return (
    <div
      className="pointer-events-none absolute rounded-full will-change-transform"
      style={{
        left,
        top,
        width,
        height,
        opacity,
        filter: `blur(${blur}px)`,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        background: `radial-gradient(ellipse at center, rgba(${color}, 0.95) 0%, rgba(${color}, 0.34) 38%, rgba(${color}, 0) 72%)`,
      }}
      aria-hidden="true"
    />
  )
}
