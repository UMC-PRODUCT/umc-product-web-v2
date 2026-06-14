/** 프로젝트 상세 카드 중 프로젝트 로고 이미지 */
/** 피그마 기준 40 Logo Frame */
import { useState } from "react"

import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { cn } from "@/shared/lib/utils"

type ProjectLogoSize = 30 | 32 | 40 | 50

type ProjectLogoSizeConfig = {
  box: string
  logo: string
}

const sizeConfig: Record<ProjectLogoSize, ProjectLogoSizeConfig> = {
  30: {
    box: "h-[1.875rem] w-[1.875rem] px-[5px]",
    logo: "h-[6px] w-[20px]",
  },
  32: {
    box: "h-8 w-8 px-[4px]",
    logo: "h-[7px] w-[24px]",
  },
  40: {
    box: "h-10 w-10 px-[5px]",
    logo: "h-[9px] w-[30px]",
  },
  50: {
    box: "h-[3.125rem] w-[3.125rem] pr-[8.365px] pl-[7.999px]",
    logo: "h-[10px] w-[33.636px]",
  },
}

export function ProjectLogo({
  src,
  size = 40,
}: {
  src?: string
  size?: ProjectLogoSize
}) {
  const [erroredSrc, setErroredSrc] = useState<string | null>(null)
  const showFallback = !src || erroredSrc === src
  const { box, logo } = sizeConfig[size]

  return (
    <div
      className={cn(
        "bg-teal-gray-200 flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
        box,
      )}
    >
      {showFallback ? (
        <UmcLogo className={cn("text-teal-gray-300 shrink-0", logo)} />
      ) : (
        <img
          src={src}
          alt="project logo"
          onError={() => setErroredSrc(src)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
