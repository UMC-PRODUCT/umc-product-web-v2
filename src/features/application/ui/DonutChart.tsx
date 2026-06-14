import { cn } from "@/shared/lib/utils"

interface DonutChartProps {
  percentage: number
  size?: number
  trackWidth?: number
  progressWidth?: number
  cornerRadius?: number
  className?: string
}

// 도넛 아크를 filled path로 그려서 끝부분에 살짝 둥근 모서리 적용
function arcSegmentPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  sweepDeg: number,
  cr: number,
): string {
  if (sweepDeg <= 0) return ""

  // 360도 이상이면 완전한 도넛 링
  if (sweepDeg >= 360) {
    return [
      `M ${cx} ${cy - rOuter}`,
      `A ${rOuter} ${rOuter} 0 1 1 ${cx} ${cy + rOuter}`,
      `A ${rOuter} ${rOuter} 0 1 1 ${cx} ${cy - rOuter}`,
      `Z`,
      `M ${cx} ${cy - rInner}`,
      `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy + rInner}`,
      `A ${rInner} ${rInner} 0 1 0 ${cx} ${cy - rInner}`,
      `Z`,
    ].join(" ")
  }

  const DEG = Math.PI / 180
  // 0도 = 12시 방향 (SVG에서 -90도 오프셋)
  const startRad = -Math.PI / 2
  const endRad = (sweepDeg - 90) * DEG

  const thickness = rOuter - rInner
  const r = Math.min(cr, thickness / 2)

  const px = (radius: number, angle: number) => cx + radius * Math.cos(angle)
  const py = (radius: number, angle: number) => cy + radius * Math.sin(angle)

  // corner radius가 0이면 단순 annular sector
  if (r <= 0) {
    const lg = sweepDeg > 180 ? 1 : 0
    return [
      `M ${px(rOuter, startRad)} ${py(rOuter, startRad)}`,
      `A ${rOuter} ${rOuter} 0 ${lg} 1 ${px(rOuter, endRad)} ${py(rOuter, endRad)}`,
      `L ${px(rInner, endRad)} ${py(rInner, endRad)}`,
      `A ${rInner} ${rInner} 0 ${lg} 0 ${px(rInner, startRad)} ${py(rInner, startRad)}`,
      `Z`,
    ].join(" ")
  }

  // corner radius 적용 - 각 모서리에서 arc를 살짝 줄이고 작은 원호로 연결
  const outerOff = r / rOuter
  const innerOff = r / rInner

  // sweep가 너무 작아서 corner가 겹치면 비율로 축소
  const totalAngularNeed = (outerOff + innerOff) * 2
  const availableAngle = sweepDeg * DEG
  const scale =
    availableAngle < totalAngularNeed ? availableAngle / totalAngularNeed : 1
  const oOff = outerOff * scale
  const iOff = innerOff * scale
  const effectiveR = r * scale

  const outerStart = startRad + oOff
  const outerEnd = endRad - oOff
  const innerStart = startRad + iOff
  const innerEnd = endRad - iOff

  const outerSweepDeg = ((outerEnd - outerStart) * 180) / Math.PI
  const innerSweepDeg = ((innerEnd - innerStart) * 180) / Math.PI
  const outerLg = outerSweepDeg > 180 ? 1 : 0
  const innerLg = innerSweepDeg > 180 ? 1 : 0

  return [
    // 시작점: 시작 radial line의 outer 쪽 (corner 안쪽)
    `M ${px(rOuter - effectiveR, startRad)} ${py(rOuter - effectiveR, startRad)}`,
    // 시작-외곽 코너: 작은 원호
    `A ${effectiveR} ${effectiveR} 0 0 1 ${px(rOuter, outerStart)} ${py(rOuter, outerStart)}`,
    // 외곽 아크
    `A ${rOuter} ${rOuter} 0 ${outerLg} 1 ${px(rOuter, outerEnd)} ${py(rOuter, outerEnd)}`,
    // 끝-외곽 코너: 작은 원호
    `A ${effectiveR} ${effectiveR} 0 0 1 ${px(rOuter - effectiveR, endRad)} ${py(rOuter - effectiveR, endRad)}`,
    // 끝 radial line (outer -> inner)
    `L ${px(rInner + effectiveR, endRad)} ${py(rInner + effectiveR, endRad)}`,
    // 끝-내곽 코너: 작은 원호
    `A ${effectiveR} ${effectiveR} 0 0 1 ${px(rInner, innerEnd)} ${py(rInner, innerEnd)}`,
    // 내곽 아크 (반시계)
    `A ${rInner} ${rInner} 0 ${innerLg} 0 ${px(rInner, innerStart)} ${py(rInner, innerStart)}`,
    // 시작-내곽 코너: 작은 원호
    `A ${effectiveR} ${effectiveR} 0 0 1 ${px(rInner + effectiveR, startRad)} ${py(rInner + effectiveR, startRad)}`,
    `Z`,
  ].join(" ")
}

export function DonutChart({
  percentage,
  size = 142,
  trackWidth = 8,
  progressWidth = 20,
  cornerRadius = 5,
  className,
}: DonutChartProps) {
  const center = size / 2
  const rOuter = center
  const rInner = center - progressWidth
  const trackR = center - progressWidth / 2
  const sweepDeg = (percentage / 100) * 360

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 트랙 (배경 원) */}
        <circle
          cx={center}
          cy={center}
          r={trackR}
          fill="none"
          stroke="var(--color-teal-gray-150)"
          strokeWidth={trackWidth}
        />
        {/* 프로그레스 (filled path - 살짝 둥근 모서리) */}
        <path
          d={arcSegmentPath(
            center,
            center,
            rOuter,
            rInner,
            sweepDeg,
            cornerRadius,
          )}
          fill="#81D3C9"
          fillRule="evenodd"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center gap-px pl-0.5">
        <span className="text-[1.625rem] leading-[1.3] font-semibold text-teal-600">
          {percentage}
        </span>
        <span className="text-[1.25rem] leading-[1.4] font-semibold tracking-[-0.01em] text-teal-600">
          %
        </span>
      </div>
    </div>
  )
}
