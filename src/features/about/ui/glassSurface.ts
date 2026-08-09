import type { CSSProperties } from "react"

/**
 * 랜딩 카드의 유리 표면.
 *
 * mix-blend-mode 가 아니라 background-blend-mode 다. 전자는 뒤에 깔린 페이지
 * 배경과 섞여서 히어로 글로우 위에 놓인 카드만 밝게 뜬다. 시안은 카드가 놓인
 * 자리와 무관하게 같은 색이어야 한다.
 *
 * 카드마다 색과 정지점은 같고 각도만 다르다. 문자열을 복붙하면 어느 값이 의도된
 * 차이인지 알 수 없어 각도만 인자로 받는다.
 */
export function glassSurface(
  sheenAngle: number,
  glowAngle: number,
  sheenAlpha = 0.04,
): CSSProperties {
  return {
    background: [
      `linear-gradient(${sheenAngle}deg, rgba(46, 209, 190, ${sheenAlpha}) 8.3483%, rgba(46, 209, 190, 0) 48.631%)`,
      `linear-gradient(${glowAngle}deg, rgba(46, 209, 190, 0.1) 16.525%, rgba(46, 209, 190, 0) 37.282%)`,
      "linear-gradient(90deg, rgba(12, 42, 37, 0.3), rgba(12, 42, 37, 0.3))",
      "linear-gradient(0deg, rgba(38, 38, 38, 0.2), rgba(38, 38, 38, 0.2))",
      "rgba(0, 0, 0, 0.004)",
    ].join(", "),
    backgroundBlendMode: "normal, normal, normal, color-dodge, normal",
  }
}
