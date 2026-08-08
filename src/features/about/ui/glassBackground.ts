/**
 * 랜딩 카드의 유리 배경 그라디언트.
 *
 * 시안은 카드마다 같은 색·정지점에 각도만 다르게 세 겹을 겹쳐 둔다. 문자열을
 * 카드마다 복붙하면 어느 값이 의도된 차이인지 알 수 없어 각도만 인자로 받는다.
 */
export function glassBackground(sheenAngle: number, glowAngle: number) {
  return [
    `linear-gradient(${sheenAngle}deg, rgba(46, 209, 190, 0.04) 8.35%, rgba(46, 209, 190, 0) 48.63%)`,
    `linear-gradient(${glowAngle}deg, rgba(46, 209, 190, 0.1) 16.53%, rgba(46, 209, 190, 0) 37.28%)`,
    "linear-gradient(90deg, rgba(12, 42, 37, 0.3) 0%, rgba(12, 42, 37, 0.3) 100%)",
  ].join(", ")
}
