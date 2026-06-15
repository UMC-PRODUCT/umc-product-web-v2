type GlowImageProps = {
  src: string
  left: number
  top: number
  width: number
  height: number
  inset: string
  opacity?: number
}

export function GlowImage({
  src,
  left,
  top,
  width,
  height,
  inset,
  opacity,
}: GlowImageProps) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left, top, width, height, opacity }}
      aria-hidden="true"
    >
      <div className="absolute" style={{ inset }}>
        <img
          src={src}
          alt=""
          draggable={false}
          className="block size-full max-w-none select-none"
        />
      </div>
    </div>
  )
}
