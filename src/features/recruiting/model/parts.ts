import type { RecruitingTrack } from "../api/types"

// 리크루팅 파트(트랙) 메타 단일 소스. 키/라벨/색을 여기서만 정의해
// 카드마다 색이 어긋나거나 중복 정의되는 드리프트를 막는다.
export type PartKey = "pm" | "design" | "webPe" | "mobilePe"

// 파트별 상세: 지원 수(applied)는 항상, 평가 수(evaluated)는 평가현황에서만.
// 툴팁 컴포넌트가 쓰지만 집계(model)도 이 형태로 만들기 때문에 model 에 둔다.
// ui 에 두면 model -> ui 방향 의존이 생긴다.
export type PartBreakdown = Record<
  PartKey,
  { applied: number; evaluated?: number }
>

export interface PartMeta {
  key: PartKey
  label: string
  // 막대 그래프/툴팁 점에 쓰는 진한 액센트. "r, g, b" 성분 문자열(rgba 합성용).
  accent: string
  // 도넛 세그먼트/막대 베이스/범례에 쓰는 파스텔 토큰.
  chip300: string
  // 도넛 호버 강조에 쓰는 진한 토큰.
  chip500: string
}

export const PARTS: PartMeta[] = [
  {
    key: "pm",
    label: "PM",
    accent: "167, 108, 222",
    chip300: "var(--color-chip-pm-300)",
    chip500: "var(--color-chip-pm-500)",
  },
  {
    key: "design",
    label: "Design",
    accent: "226, 107, 167",
    chip300: "var(--color-chip-design-300)",
    chip500: "var(--color-chip-design-500)",
  },
  {
    key: "webPe",
    label: "Web PE",
    accent: "216, 178, 77",
    chip300: "var(--color-chip-web-pe-300)",
    chip500: "var(--color-chip-web-pe-500)",
  },
  {
    key: "mobilePe",
    label: "Mobile PE",
    accent: "110, 143, 245",
    chip300: "var(--color-chip-mobile-pe-300)",
    chip500: "var(--color-chip-mobile-pe-500)",
  },
]

// INFRA_PLUS는 제외 (기획)
export const PART_KEY_TO_TRACK: Record<PartKey, RecruitingTrack> = {
  pm: "PLAN",
  design: "DESIGN",
  webPe: "WEB_PRODUCT_ENGINEER",
  mobilePe: "MOBILE_PRODUCT_ENGINEER",
}

export function getRecruitableTracks(
  enabledParts: Record<PartKey, boolean>,
): RecruitingTrack[] {
  return PARTS.filter((part) => enabledParts[part.key]).map(
    (part) => PART_KEY_TO_TRACK[part.key],
  )
}
