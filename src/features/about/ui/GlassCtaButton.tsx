import { Link } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

import type { ComponentProps } from "react"
import type { ComponentPropsWithoutRef, CSSProperties } from "react"

const TONE_OVERLAY = {
  subtle: "bg-[rgba(199,235,230,0.1)] group-hover:bg-[rgba(199,235,230,0.16)]",
  primary: "bg-[rgba(14,129,121,0.6)] group-hover:bg-[rgba(14,129,121,0.75)]",
} as const

// 시안의 테두리는 stroke 가 아니라 Figma 의 "유리" 효과다. CSS 에 대응물이 없어
// 시안 캡처에서 둘레 밝기를 재서 근사한다.
//
// 시안의 테두리는 흰색을 덮은 것이 아니다. 안쪽 면과의 차이를 재보면 R·G·B 가
// 같은 양만큼 올라간다(예: 하단 CTA 는 Δ 25,26,26). 그래서 테두리가 버튼 자기
// 색을 그대로 띤다. plus-lighter 로 흰색을 더해 같은 성질을 만든다.
//
// 각도(conic)로 잡으면 버튼 폭마다 코너 위치가 달라진다. 위아래 밝기 차이는 세로
// 그라데이션으로, 네 코너는 코너에 고정한 radial 로 준다. 그러면 폭과 무관하다.
//
// 반경 16 코너 호는 모서리 점에서 16px 안에 전부 들어온다. 변의 짧은 쪽이 68 뿐이라
// 이보다 넓게 잡으면 좌우 변이 통째로 먹힌다.
const GLOW = "34px 34px"
const FADE = "24px 24px"

// 더해지는 양(0~1). 시안 캡처 실측이다.
const TOP = 0.378
const BOTTOM = 0.359
const TOP_LEFT = 0.698
const BOTTOM_RIGHT = 0.459

// 코너 radial 은 아래 세로 그라데이션 위에 얹히므로, 합쳐서 목표값이 되게 역산한다.
const over = (target: number, base: number) => (target - base) / (1 - base)

const rimGradient = (k: number) =>
  `radial-gradient(${GLOW} at 0% 0%, rgba(255, 255, 255, ${over(TOP_LEFT * k, TOP * k)}) 0%, rgba(255, 255, 255, ${over(TOP_LEFT * k, TOP * k)}) 47%, rgba(255, 255, 255, 0) 100%),
  radial-gradient(${GLOW} at 100% 100%, rgba(255, 255, 255, ${over(BOTTOM_RIGHT * k, BOTTOM * k)}) 0%, rgba(255, 255, 255, ${over(BOTTOM_RIGHT * k, BOTTOM * k)}) 47%, rgba(255, 255, 255, 0) 100%),
  linear-gradient(180deg, rgba(255, 255, 255, ${TOP * k}) 0%, rgba(255, 255, 255, ${BOTTOM * k}) 100%)`

// 어두운 청록 위에 놓이는 하단 CTA 는 시안에서 림이 절반쯤으로 약하다.
// 노드 렌더의 변 평균이 subtle 0.201 / primary 0.096 이라 그 비를 쓴다.
const TONE_RIM_SCALE = { subtle: 1, primary: 0.478 } as const

// 안쪽을 도려내 1px 테두리만 남긴다. 실제 border 는 버튼을 2px 키운다.
//
// 여러 마스크 레이어를 mask-composite 로 합치지 않는다. 표준 키워드(exclude,
// intersect)와 -webkit- 키워드(xor, source-in)가 서로 달라서, 한쪽만 이해하는
// 브라우저에서 합성이 통째로 풀리고 림이 버튼 전체를 덮는다. 대신 마스크를 한 겹씩
// 나눠 중첩한다. 겹칠수록 곱해지므로 결과는 같고, 각 겹은 어디서나 지원되는
// 형태만 쓴다.
const rimStyle = (tone: keyof typeof TONE_RIM_SCALE): CSSProperties => ({
  background: rimGradient(TONE_RIM_SCALE[tone]),
  mixBlendMode: "plus-lighter",
  WebkitMask:
    "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
  maskComposite: "exclude",
})
const RIM_STYLE = {
  subtle: rimStyle("subtle"),
  primary: rimStyle("primary"),
} as const

// 우상·좌하 코너를 지우는 겹. 레이어가 하나뿐이라 합성 키워드가 필요 없다.
const cornerFade = (at: string): CSSProperties => {
  const image = `radial-gradient(${FADE} at ${at}, transparent 0%, transparent 67%, #fff 100%)`
  return { WebkitMaskImage: image, maskImage: image }
}
const FADE_TOP_RIGHT = cornerFade("100% 0%")
const FADE_BOTTOM_LEFT = cornerFade("0% 100%")

interface GlassCtaButtonProps extends ComponentPropsWithoutRef<"button"> {
  tone?: keyof typeof TONE_OVERLAY
  /** 주면 링크로 그린다. 없으면 버튼 그대로다. */
  to?: ComponentProps<typeof Link>["to"]
}

export function GlassCtaButton({
  className,
  children,
  tone = "subtle",
  to,
  ...props
}: GlassCtaButtonProps) {
  // rounded-2xl 은 이 레포에서 18px 이라 시안의 16px 과 다르다.
  const shared = cn(
    "group relative flex shrink-0 cursor-pointer items-center justify-center rounded-[16px] px-12 py-4.5",
    "text-2xl leading-[1.35] font-bold tracking-[-0.48px] whitespace-nowrap text-white",
    className,
  )

  const body = (
    <>
      {/* color-dodge 가 버튼 뒤 페이지 배경을 끌어올린다. 시안 캡처의 버튼
          안팎을 재보면 배경에 이 순서를 적용한 값과 일치한다. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px]"
      >
        <span className="absolute inset-0 rounded-[16px] bg-[#262626] mix-blend-color-dodge" />
        <span
          className={cn(
            "absolute inset-0 rounded-[16px] transition-colors duration-200",
            TONE_OVERLAY[tone],
          )}
        />
        <span className="absolute inset-0" style={FADE_TOP_RIGHT}>
          <span className="absolute inset-0" style={FADE_BOTTOM_LEFT}>
            <span
              className="absolute inset-0 rounded-[16px] border-[0.5px] border-transparent"
              style={RIM_STYLE[tone]}
            />
          </span>
        </span>
      </span>
      <span className="relative">{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={shared}>
        {body}
      </Link>
    )
  }

  return (
    <button type="button" className={shared} {...props}>
      {body}
    </button>
  )
}
