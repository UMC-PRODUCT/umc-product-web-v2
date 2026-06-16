import heroMockup from "@/features/intro/assets/01/asset.webp"
import painpointArrow from "@/features/intro/assets/02/arrow.svg"
import painpointMockup from "@/features/intro/assets/02/mockup.png"
import solutionLineEnd from "@/features/intro/assets/03/line-end.svg"
import solutionLine from "@/features/intro/assets/03/line.svg"
import solutionMockup from "@/features/intro/assets/03/mockup.png"
import glowCircle from "@/features/intro/assets/glow/circle.svg"
import glowEllipse from "@/features/intro/assets/glow/ellipse.svg"

export const LANDING_BACKGROUND = [
  "linear-gradient(98.18deg, rgba(46, 209, 190, 0.16) 8.3483%, rgba(46, 209, 190, 0) 48.631%)",
  "linear-gradient(-84.08deg, rgba(46, 209, 190, 0.4) 16.525%, rgba(46, 209, 190, 0) 37.282%)",
  "linear-gradient(90deg, #000 0%, #000 100%)",
].join(", ")

export const LANDING_BACKGROUND_HEIGHT = 15756

export const GLOW_CIRCLE_SRC = glowCircle
export const GLOW_ELLIPSE_SRC = glowEllipse

export const HERO_TITLE = "팀 매칭 시스템 사용 가이드"
export const HERO_SUBTITLE = "UMC Demo Day Team Matching System"

export const HERO_TITLE_COLOR = "#36D3C0"

export const HERO_MOCKUP_SRC = heroMockup
export const HERO_MOCKUP_WIDTH = 975
export const HERO_MOCKUP_HEIGHT = 723

export const PAINPOINT_LABEL = "Painpoint"
export const PAINPOINT_TITLE = "매 기수 반복되던 비효율"
export const PAINPOINT_SUBTITLE =
  "노션, 구글 폼, 스프레드시트에 파편화되어 비효율적이었던 기존 방식"

export const PAINPOINT_STEPS = [
  "Notion의 프로젝트 기획서 확인",
  "구글 폼으로 지원",
  "스프레드시트로 결과 확인",
  "챌린저와 운영진에게 개별 연락",
]

export const PAINPOINT_ARROW_SRC = painpointArrow
export const PAINPOINT_MOCKUP_SRC = painpointMockup

export const SOLUTION_LABEL = "Solution"
export const SOLUTION_TITLE =
  "프로젝트 등록 및 조회, 지원 폼 제출, 실시간 매칭 결과 확인까지"
export const SOLUTION_SUBTITLE = "한 번에 해결할 수 있어요!"
export const SOLUTION_MOCKUP_SRC = solutionMockup
export const SOLUTION_STEPS = [
  "프로젝트 등록 & 확인",
  "프로젝트 지원",
  "지원 현황 확인",
  "매칭 결과 확인",
]
export const SOLUTION_LINE_SRC = solutionLine
export const SOLUTION_LINE_END_SRC = solutionLineEnd

export const MATCHING_LABEL = "UMC Matching System"
export const MATCHING_TITLE_ACCENT = "팀 매칭 시스템의 주요 플로우"
