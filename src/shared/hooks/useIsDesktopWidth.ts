import { useEffect, useState } from "react"

// 헤더가 모바일 판을 접는 기준(RecruitingHeader)과 같은 값을 쓴다. 두 값이
// 어긋나면 안내가 뜬 화면 뒤에서 헤더만 데스크톱 모양으로 남는다.
const DESKTOP_MIN_WIDTH = "(min-width: 64rem)"

// 초기값은 데스크톱이다. 프리렌더(scripts/prerender.mjs)가 만드는 HTML 에 안내
// 화면이 박히면 안 되므로, 좁은지 여부는 마운트 뒤에만 판단한다.
export function useIsDesktopWidth() {
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_MIN_WIDTH)
    const sync = () => setIsDesktop(desktop.matches)
    sync()
    desktop.addEventListener("change", sync)
    return () => desktop.removeEventListener("change", sync)
  }, [])

  return isDesktop
}
