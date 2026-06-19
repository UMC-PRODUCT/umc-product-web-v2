const STRIP_GRADIENT =
  "linear-gradient(-90deg, rgba(255,255,255,0) 26.786%, rgba(0,0,0,0.2) 6.8205%, rgba(22,22,22,0.183) 11.148%, rgba(255,255,255,0.04) 123.81%)"

const STRIP_OPACITIES = [1, 1, 1, 1, 0.9, 0.8, 0.7, 0.5]

interface LightStripTextureProps {
  className?: string
}

export function LightStripTexture({ className = "" }: LightStripTextureProps) {
  return (
    <div
      className={`pointer-events-none absolute flex h-[2430px] w-[553px] rotate-180 opacity-[0.07] ${className}`}
      aria-hidden="true"
    >
      {STRIP_OPACITIES.map((opacity, index) => (
        <span
          key={index}
          className="h-full w-[69.14px] shrink-0"
          style={{ opacity, backgroundImage: STRIP_GRADIENT }}
        />
      ))}
    </div>
  )
}
