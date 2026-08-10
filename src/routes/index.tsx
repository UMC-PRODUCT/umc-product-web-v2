import { createFileRoute, redirect } from "@tanstack/react-router"

import { ROOT_LANDING_PATH } from "@/shared/config/landingPolicy"

export const Route = createFileRoute("/")({
  // 로그인 여부도 역할도 보지 않는다. 주소만 치고 들어온 사람에게는 소개 랜딩이
  // 첫 화면이고, 나머지는 헤더 탭으로 들어간다.
  beforeLoad: () => {
    throw redirect({ to: ROOT_LANDING_PATH })
  },
})
