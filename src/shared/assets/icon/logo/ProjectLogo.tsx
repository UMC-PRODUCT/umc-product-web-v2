/** 프로젝트 상세 카드 중 프로젝트 로고 이미지 */
/** 피그마 기준 40 Logo Frame */
import { useState } from "react"

import { trackEvent } from "@/shared/analytics"
import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"
import { cn } from "@/shared/lib/utils"

type ProjectLogoSize = 30 | 32 | 40 | 50

type ProjectLogoSizeConfig = {
  box: string
  logo: string
  padding: string
}

const sizeConfig: Record<ProjectLogoSize, ProjectLogoSizeConfig> = {
  30: {
    box: "h-[1.875rem] w-[1.875rem]",
    logo: "h-[6px] w-[20px]",
    padding: "px-[5px]",
  },
  32: {
    box: "h-8 w-8",
    logo: "h-[7px] w-[24px]",
    padding: "px-[4px]",
  },
  40: {
    box: "h-10 w-10",
    logo: "h-[9px] w-[30px]",
    padding: "px-[5px]",
  },
  50: {
    box: "h-[3.125rem] w-[3.125rem]",
    logo: "h-[10px] w-[33.636px]",
    padding: "pr-[8.365px] pl-[7.999px]",
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
  const { box, logo, padding } = sizeConfig[size]

  return (
    <div
      className={cn(
        "bg-teal-gray-200 flex shrink-0 items-center justify-center overflow-hidden rounded-lg",
        box,
        showFallback && padding,
      )}
    >
      {showFallback ? (
        <UmcLogo className={cn("text-teal-gray-300 shrink-0", logo)} />
      ) : (
        <img
          src={src}
          alt="project logo"
          onError={() => {
            trackEvent("image_load_error", {
              image_type: "project_logo",
            })
            setErroredSrc(src ?? null)
          }}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
