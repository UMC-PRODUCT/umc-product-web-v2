import PersonGraphicIcon from "@/shared/assets/icon/people/PersonGraphicIcon"
import { cn } from "@/shared/lib/utils"

import type { PartCounts } from "../model/recruitmentQuota"

const STAT_CARD_BACKGROUND =
  "linear-gradient(292.2deg, rgba(34, 144, 132, 0.015) -16.53%, rgba(255, 255, 255, 0.05) 30.04%), linear-gradient(119.5deg, rgba(34, 144, 132, 0.025) 8.35%, rgba(255, 255, 255, 0.05) 46.69%), linear-gradient(0deg, rgba(143, 255, 243, 0.08), rgba(143, 255, 243, 0.08)), #FFFFFF"

interface QuotaApplicantStatusCardProps {
  title: string
  updatedDate?: string
  updatedTime?: string
  partCounts: PartCounts
  className?: string
}

export function QuotaApplicantStatusCard({
  title,
  updatedDate = "26-07-04",
  updatedTime = "02:48",
  partCounts,
  className,
}: QuotaApplicantStatusCardProps) {
  const parts: { label: string; count: number }[] = [
    { label: "PM", count: partCounts.pm },
    { label: "Design", count: partCounts.design },
    { label: "Web PE", count: partCounts.webPe },
    { label: "Mobile PE", count: partCounts.mobilePe },
  ]

  return (
    <div
      className={cn(
        "border-teal-gray-100 shadow-drop-neutral-3 box-border flex w-full flex-col gap-8.5 rounded-[12px] border bg-white px-8 pt-7 pb-8",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-heading-6-semibold text-teal-700">{title}</span>

        <div className="text-body-1-regular text-teal-gray-400 flex items-center gap-0.5">
          <div className="flex items-center gap-1">
            <span>{updatedDate}</span>
            <span>{updatedTime}</span>
          </div>

          <span>기준</span>
        </div>
      </div>

      <div className="flex w-full items-center gap-4">
        {parts.map(({ label, count }) => (
          <div
            key={label}
            className="border-teal-gray-100 shadow-drop-neutral-3 box-border flex flex-1 shrink-0 flex-col gap-3 rounded-[12px] border px-8 pt-4.5 pb-8"
            style={{ background: STAT_CARD_BACKGROUND }}
          >
            <span className="text-subtitle-3-semibold text-teal-700">
              {label}
            </span>

            <div className="flex items-center justify-center gap-[11.76px]">
              <PersonGraphicIcon className="size-9 text-teal-500" />
              <div className="text-heading-3-semibold flex items-center gap-1.5 text-teal-500">
                <p>{count}</p>
                <p>명</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
