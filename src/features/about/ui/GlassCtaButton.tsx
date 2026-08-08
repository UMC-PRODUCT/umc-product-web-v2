import { cn } from "@/shared/lib/utils"

import type { ComponentPropsWithoutRef } from "react"

// 랜딩 전용 CTA. 공용 Button 은 밝은 배경용 fill/weak 조합만 있어서 시안의
// 반투명 글래스 스타일을 표현할 수 없다. 랜딩 여러 섹션에서 같은 모양을 쓰므로
// 여기 하나로 모아 둔다.
// 시안의 CTA 는 겉모양은 같고 위에 덮는 색만 다르다. 히어로·모집 분야는 옅은
// 민트, 하단 마무리는 진한 청록이다.
const TONE_OVERLAY = {
  subtle: "bg-[rgba(199,235,230,0.1)] group-hover:bg-[rgba(199,235,230,0.16)]",
  primary: "bg-[rgba(14,129,121,0.6)] group-hover:bg-[rgba(14,129,121,0.75)]",
} as const

interface GlassCtaButtonProps extends ComponentPropsWithoutRef<"button"> {
  tone?: keyof typeof TONE_OVERLAY
}

export function GlassCtaButton({
  className,
  children,
  tone = "subtle",
  ...props
}: GlassCtaButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative flex h-16.75 shrink-0 cursor-pointer items-center justify-center rounded-2xl px-12",
        "text-2xl leading-[1.3] font-bold text-white",
        className,
      )}
      {...props}
    >
      {/* 시안의 배경은 세 겹이다. 가운데 레이어의 color-dodge 가 아래 배경색을
          끌어올려서 어두운 곳에서만 은은하게 떠 보인다. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
      >
        <span className="absolute inset-0 rounded-2xl bg-[#262626] mix-blend-color-dodge" />
        <span
          className={cn(
            "absolute inset-0 rounded-2xl transition-colors duration-200",
            TONE_OVERLAY[tone],
          )}
        />
      </span>
      <span className="relative">{children}</span>
    </button>
  )
}
