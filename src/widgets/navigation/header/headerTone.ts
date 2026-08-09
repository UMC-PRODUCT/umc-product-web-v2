/**
 * 헤더의 두 가지 톤.
 *
 * `light` 는 앱 안쪽(밝은 배경), `glass` 는 소개 랜딩(검은 배경)이다. 시안에서
 * 랜딩 헤더는 배경을 깔지 않고 페이지 위에 떠 있으며, 탭 묶음과 지원하기 버튼만
 * 반투명 유리로 그린다.
 *
 * 유리 표면은 랜딩 CTA 버튼과 같은 방식이다. 테두리는 stroke 가 아니라 Figma 의
 * 유리 효과라 GlassRim 으로 따로 얹는다.
 *
 * 값은 시안 헤더(11394:111975)에서 옮겼다.
 */
export type HeaderTone = "light" | "glass"

export const HEADER_TONE = {
  light: {
    root: "bg-teal-gray-50 shadow-drop-neutral-3",
    logo: "text-teal-gray-700",
    nav: "bg-teal-gray-50 border-teal-gray-100 border drop-shadow-[0_0_8px_rgba(10,86,80,0.04)]",
    inquiry:
      "text-teal-gray-600 hover:bg-teal-gray-100 border-teal-gray-150 border",
  },
  glass: {
    // 배경을 깔지 않는다. 랜딩 히어로 위에 그대로 얹힌다.
    root: "bg-transparent",
    logo: "text-white",
    nav: "backdrop-blur-[21px] bg-[rgba(251,252,252,0.2)]",
    inquiry:
      "backdrop-blur-[21px] bg-[rgba(251,252,252,0.2)] text-white hover:bg-[rgba(251,252,252,0.3)]",
  },
} as const

/** 우측 진입 버튼(지원하기)의 유리 fill. 시안은 탭 묶음보다 조금 진하다. */
export const GLASS_ENTRY_BUTTON =
  "backdrop-blur-[21px] bg-[rgba(251,252,252,0.3)] text-white transition-colors hover:bg-[rgba(251,252,252,0.4)]"

/** 유리 테두리 밝기. 랜딩 CTA 버튼과 같은 값이다. 지원하기 버튼에 쓴다. */
export const GLASS_RIM = {
  from: 0.39,
  to: 0.35,
  topLeft: 0.698,
  bottomRight: 0.459,
} as const

/**
 * 탭 묶음용. 시안 페이지 렌더에서 알약 테두리는 상 0.322 / 하 0.286 이고 양 끝은
 * 비어 있다. 코너 하이라이트 없이 고르게 도는 형태라 corners 를 끄고 쓴다.
 */
export const GLASS_RIM_PILL = { from: 0.33, to: 0.29 } as const
