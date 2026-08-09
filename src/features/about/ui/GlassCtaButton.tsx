import { cn } from "@/shared/lib/utils"

import type { ComponentPropsWithoutRef, CSSProperties } from "react"

const TONE = {
  subtle: { base: "rgba(199,235,230,0.1)", hover: "rgba(199,235,230,0.16)" },
  primary: { base: "rgba(14,129,121,0.6)", hover: "rgba(14,129,121,0.75)" },
} as const

interface GlassCtaButtonProps extends ComponentPropsWithoutRef<"button"> {
  tone?: keyof typeof TONE
}

export function GlassCtaButton({
  className,
  children,
  tone = "subtle",
  ...props
}: GlassCtaButtonProps) {
  const { base, hover } = TONE[tone]

  return (
    <button
      type="button"
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center rounded-[16px] px-12 py-4.5",
        "text-2xl leading-[1.35] font-bold tracking-[-0.48px] whitespace-nowrap text-white",
        "hover:[--cta-tint:var(--cta-tint-hover)]",
        className,
      )}
      {...props}
      style={
        {
          "--cta-tint": base,
          "--cta-tint-hover": hover,
          background:
            "linear-gradient(0deg, var(--cta-tint), var(--cta-tint)), linear-gradient(0deg, #262626, #262626), rgba(0, 0, 0, 0.004)",
          backgroundBlendMode: "normal, color-dodge, normal",
        } as CSSProperties
      }
    >
      {children}
    </button>
  )
}
