import { ProjectLogo } from "@/shared/assets/icon/logo/ProjectLogo"
import { cn } from "@/shared/lib/utils"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import MemberCount from "@/shared/ui/MemberCount"

import type { ReactNode } from "react"

export interface ApplicationProjectCardPart {
  label: string
  current: number
  total: number
  done: boolean
}

interface ApplicationProjectCardProps {
  thumbnailUrl?: string
  thumbnailAlt?: string
  projectName: string
  pmInfo: string
  parts: ApplicationProjectCardPart[]
  rightAction?: ReactNode
  onClick?: () => void
  className?: string
}

export function ApplicationProjectCard({
  thumbnailUrl,
  thumbnailAlt,
  projectName,
  pmInfo,
  parts,
  rightAction,
  onClick,
  className,
}: ApplicationProjectCardProps) {
  return (
    <div
      className={cn(
        "border-teal-gray-100 shadow-drop-neutral-2 flex items-center gap-7 rounded-2xl border bg-white py-2.5 pr-5 pl-2.5 transition-colors",
        onClick &&
          "[&:hover:not(:has(button:hover))]:bg-teal-gray-100 cursor-pointer",
        className,
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick()
            }
          : undefined
      }
    >
      <div className="bg-teal-gray-200 flex h-[10.5625rem] w-80 shrink-0 overflow-hidden rounded-[0.625rem]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={thumbnailAlt ?? `${projectName} 대표 이미지`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="text-body-2-medium text-teal-gray-400 flex h-full w-full items-center justify-center text-center">
            프로젝트 대표 이미지
            <br />
            320*169
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-end gap-4">
        <div className="flex flex-col items-start gap-2 self-stretch">
          <div className="flex items-center justify-between self-stretch">
            <div className="flex items-center gap-2">
              <ProjectLogo size={30} />
              <span className="text-heading-7-semibold text-teal-gray-900">
                {projectName}
              </span>
            </div>
            {rightAction && (
              <div onClick={(e) => e.stopPropagation()}>{rightAction}</div>
            )}
          </div>
          <p className="text-body-2-medium text-teal-gray-500">{pmInfo}</p>
        </div>

        <div className="flex flex-col items-start gap-1.25 self-stretch">
          {parts.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between self-stretch"
            >
              <div className="flex w-[7.3125rem] items-center justify-between">
                <span className="text-body-2-medium text-teal-gray-700">
                  {row.label}
                </span>
                <MemberCount
                  size="xs"
                  current={row.current}
                  total={row.total}
                />
              </div>
              <RecruitStatusChip
                done={row.done}
                className="w-[3.875rem] text-xs leading-[150%] font-medium shadow-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
