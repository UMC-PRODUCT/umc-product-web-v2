import { HeroSection } from "./sections/HeroSection"

// 앱 전체는 밝은 배경(__root 의 bg-teal-gray-50)인데 이 페이지만 다크다.
// 라우트 안에서 자체 배경을 깐다.
//
// 시안 배경은 검정 위에 두 덩어리다. 히어로 구간을 가로지르는 큰 청록 호와,
// 페이지 중간까지만 왼쪽 가장자리에 남는 은은한 글로우.
//
// TODO: 아래는 근사다. 블러가 깊게 걸린 유기적 형태라 CSS 그라디언트로는
// 정확히 재현되지 않는다. 배경만 담은 1440x5985 프레임을 이미지로 받아
// 이 두 레이어를 통째로 교체할 것.
const HERO_GLOW =
  "radial-gradient(120% 85% at 18% 62%, rgba(46, 209, 190, 0.30) 0%, rgba(46, 209, 190, 0.12) 38%, rgba(46, 209, 190, 0) 72%)"

const SIDE_GLOW =
  "linear-gradient(90deg, rgba(46, 209, 190, 0.12) 0%, rgba(46, 209, 190, 0.04) 30%, rgba(46, 209, 190, 0) 60%)"

export function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 상단 호. 히어로 구간에서 끝난다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-233"
        style={{ background: HERO_GLOW }}
      />
      {/* 왼쪽 글로우. 페이지 중간쯤에서 사라지도록 세로 마스크를 겹친다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-675"
        style={{
          background: SIDE_GLOW,
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="relative mx-auto w-300">
        <HeroSection />
      </div>
    </div>
  )
}
