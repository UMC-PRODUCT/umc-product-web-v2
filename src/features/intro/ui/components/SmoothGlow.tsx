type SmoothGlowProps = {
  left: number
  top: number
  width: number
  height: number
  color?: string
  opacity?: number
  scale?: number
}

export function SmoothGlow({
  left,
  top,
  width,
  height,
  color = "54, 211, 192",
  opacity = 0.22,
  scale = 1,
}: SmoothGlowProps) {
  return (
    <div
      className="pointer-events-none absolute will-change-transform"
      style={{
        left,
        top,
        width,
        height,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center",
        background: `radial-gradient(ellipse at center, rgba(${color}, 0.42) 0%, rgba(${color}, 0.22) 26%, rgba(${color}, 0.12) 42%, rgba(${color}, 0.055) 58%, rgba(${color}, 0.02) 72%, rgba(${color}, 0) 86%)`,
      }}
      aria-hidden="true"
    />
  )
}
