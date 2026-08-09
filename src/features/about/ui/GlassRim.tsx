import type { CSSProperties } from "react"

/**
 * 시안의 유리 테두리.
 *
 * Figma 의 "유리" 효과라 CSS 에 대응물이 없고 코드/CSS export 에도 나오지 않는다.
 * 시안 노드를 1:1 로 받아 둘레 밝기를 재서 근사한다.
 *
 * 흰색을 덮는 것이 아니다. 안쪽 면과의 차이를 재면 R·G·B 가 같은 양만큼 올라간다.
 * 그래서 테두리가 면 자기 색을 그대로 띤다. plus-lighter 로 같은 성질을 만든다.
 *
 * 둘레는 좌상에서 밝고 우하로 가며 어두워지되, 우상·좌하 코너에서만 사라진다.
 * 각도(conic)로 잡으면 요소 비율마다 코너 위치가 달라지므로, 대각 그라데이션과
 * 코너에 고정한 radial 로 만든다. 그러면 크기·비율과 무관하다.
 */
interface GlassRimProps {
  /** 면의 모서리 반경 */
  radius: number
  /** 좌상 기준 밝기(가산 0~1) */
  from: number
  /** 우하 기준 밝기(가산 0~1) */
  to: number
  /** 우하 코너에서 도드라지는 밝기. 생략하면 기준값을 그대로 쓴다 */
  bottomRight?: number
  /** 좌상 코너에서 도드라지는 밝기. 생략하면 기준값을 그대로 쓴다 */
  topLeft?: number
}

// 코너 radial 은 대각 그라데이션 위에 얹히므로 합쳐서 목표값이 되게 역산한다.
const over = (target: number, base: number) =>
  base >= 1 ? 0 : Math.max(0, (target - base) / (1 - base))

export function GlassRim({
  radius,
  from,
  to,
  topLeft = from,
  bottomRight = to,
}: GlassRimProps) {
  // 코너 호는 모서리 점에서 radius 안에 전부 들어온다. 그 밖에서 변으로 넘어간다.
  const fade = `${radius + 14}px ${radius + 14}px`
  const glow = `${radius + 24}px ${radius + 24}px`
  const hold = `${Math.round((radius / (radius + 24)) * 100)}%`
  const fadeHold = `${Math.round((radius / (radius + 14)) * 100)}%`

  const tl = over(topLeft, from)
  const br = over(bottomRight, to)

  // 우상·좌하를 지우고(intersect) 안쪽을 도려내 테두리만 남긴다(exclude).
  // 실제 border 로 그리면 요소가 2px 커진다.
  const cut = (at: string) =>
    `radial-gradient(${fade} at ${at}, transparent 0%, transparent ${fadeHold}, #fff 100%)`
  const maskLayers = [
    cut("100% 0%"),
    cut("0% 100%"),
    "linear-gradient(#fff 0 0) padding-box",
    "linear-gradient(#fff 0 0)",
  ].join(", ")

  const rim: CSSProperties = {
    background: [
      `radial-gradient(${glow} at 0% 0%, rgba(255,255,255,${tl}) 0%, rgba(255,255,255,${tl}) ${hold}, rgba(255,255,255,0) 100%)`,
      `radial-gradient(${glow} at 100% 100%, rgba(255,255,255,${br}) 0%, rgba(255,255,255,${br}) ${hold}, rgba(255,255,255,0) 100%)`,
      `linear-gradient(135deg, rgba(255,255,255,${from}) 0%, rgba(255,255,255,${to}) 100%)`,
    ].join(", "),
    mixBlendMode: "plus-lighter",
    borderRadius: radius,
    // 마스크는 반드시 이 요소 자체에 건다. 마스크 걸린 부모로 감싸면 그 부모가
    // 스택 컨텍스트를 만들어 plus-lighter 가 면과 섞이지 못한다. 그러면 가산이
    // 아니라 일반 합성이 되어, 면이 어두운 쪽일수록 테두리가 밝아지는 반대 결과가
    // 나온다.
    //
    // 합성 키워드는 두 문법이 서로 다르다(표준 exclude/intersect,
    // -webkit- xor/source-in). 양쪽에 각자 값을 준다.
    WebkitMask: maskLayers,
    WebkitMaskComposite: "source-in, source-in, xor, source-over",
    mask: maskLayers,
    maskComposite: "intersect, intersect, exclude, add",
  }

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 border border-transparent"
      style={rim}
    />
  )
}
