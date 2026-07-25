import { cn } from "@/shared/lib/utils"

import type { ChapterQuotaData } from "../model/recruitmentQuota"

interface ChapterQuotaTableCardProps {
  data: ChapterQuotaData
  className?: string
}

export function ChapterQuotaTableCard({
  data,
  className,
}: ChapterQuotaTableCardProps) {
  const hasApplicants = data.schools.length > 0

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex w-full justify-between">
        <div />
        <div className="flex items-center gap-3 px-1">
          <p className="text-body-1-regular text-teal-gray-400">
            <span>{data.updatedDate}</span>
            <span className="pl-1">{data.updatedTime}</span>
            <span className="pl-0.5">기준</span>
          </p>

          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-teal-500" />
            <span className="text-label-2-medium text-teal-500">
              {data.status}
            </span>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="border-teal-gray-200 divide-teal-gray-300 box-border flex w-full flex-col divide-y overflow-hidden rounded-[8px] border">
        {/* row - 제목 */}
        <div className="divide-teal-gray-300 flex h-22 w-full divide-x">
          <div className="flex w-42.5 flex-col items-center justify-center bg-teal-50">
            <p>
              <span className="text-heading-6-semibold text-teal-500">
                {data.chapter}
              </span>
              <span className="text-subtitle-1-medium text-teal-gray-400 pl-1">
                지부
              </span>
            </p>
            <p className="text-body-1-medium text-teal-gray-400">
              총 {data.schoolCount}개 학교
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">PM</p>
            <p className="text-subtitle-2-medium text-teal-700">
              {data.totals.pm}명
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">Design</p>
            <p className="text-subtitle-2-medium text-teal-700">
              {data.totals.design}명
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">Web PE</p>
            <p className="text-subtitle-2-medium text-teal-700">
              {data.totals.webPe}명
            </p>
          </div>
          <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 bg-teal-50 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-teal-400">
            <p className="text-heading-6-semibold text-teal-gray-800">
              Mobile PE
            </p>
            <p className="text-subtitle-2-medium text-teal-700">
              {data.totals.mobilePe}명
            </p>
          </div>
          <div className="bg-teal-gray-150 flex w-35 items-center justify-center">
            <p className="text-heading-6-semibold text-teal-gray-800">
              합계 인원
            </p>
          </div>
        </div>

        {!hasApplicants ? (
          /* row - 지원자가 없을 때 */
          <div className="flex h-65 w-full items-center justify-center">
            <p className="text-body-2-medium text-teal-gray-400">
              현재 TO를 정할 지원자가 없습니다.
            </p>
          </div>
        ) : (
          <>
            {/* School rows */}
            {data.schools.map((school) => (
              <div
                key={school.schoolName}
                className="divide-teal-gray-300 flex h-14 w-full divide-x"
              >
                <div className="bg-teal-gray-50 flex w-42.5 items-center justify-center">
                  <p className="text-heading-7-semibold text-teal-gray-700">
                    {school.schoolName}
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  <p>
                    <span className="text-heading-6-semibold text-teal-500">
                      {school.pm}
                    </span>
                    <span className="text-subtitle-1-medium text-teal-gray-400 pl-px">
                      명
                    </span>
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  <p>
                    <span className="text-heading-6-semibold text-teal-500">
                      {school.design}
                    </span>
                    <span className="text-subtitle-1-medium text-teal-gray-400 pl-px">
                      명
                    </span>
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  <p>
                    <span className="text-heading-6-semibold text-teal-500">
                      {school.webPe}
                    </span>
                    <span className="text-subtitle-1-medium text-teal-gray-400 pl-px">
                      명
                    </span>
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  <p>
                    <span className="text-heading-6-semibold text-teal-500">
                      {school.mobilePe}
                    </span>
                    <span className="text-subtitle-1-medium text-teal-gray-400 pl-px">
                      명
                    </span>
                  </p>
                </div>
                <div className="bg-teal-gray-100 relative w-35">
                  <p className="text-body-2-medium text-teal-gray-400 absolute inset-x-0 top-[3.5px] text-center">
                    {school.schoolName}
                  </p>
                  <p className="absolute inset-x-0 bottom-[3.5px] text-center">
                    <span className="text-heading-6-semibold text-teal-500">
                      {school.total}
                    </span>
                    <span className="text-subtitle-1-medium text-teal-gray-400 pl-px">
                      명
                    </span>
                  </p>
                </div>
              </div>
            ))}

            {/* Remaining row */}
            {data.remaining && (
              <div className="divide-teal-gray-300 flex h-11 w-full divide-x">
                <div className="bg-warning-50 flex w-42.5 items-center justify-center">
                  <p className="text-subtitle-1-medium text-warning-500">
                    잔여
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  {typeof data.remaining.pm === "number" ? (
                    <p>
                      <span className="text-subtitle-1-medium text-warning-500">
                        {data.remaining.pm}
                      </span>
                      <span className="text-subtitle-1-medium text-warning-500 pl-px">
                        명
                      </span>
                    </p>
                  ) : (
                    <p className="text-subtitle-1-medium text-teal-gray-700">
                      {data.remaining.pm ?? "-"}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  {typeof data.remaining.design === "number" ? (
                    <p>
                      <span className="text-subtitle-1-medium text-warning-500">
                        {data.remaining.design}
                      </span>
                      <span className="text-subtitle-1-medium text-warning-500 pl-px">
                        명
                      </span>
                    </p>
                  ) : (
                    <p className="text-subtitle-1-medium text-teal-gray-700">
                      {data.remaining.design ?? "-"}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  {typeof data.remaining.webPe === "number" ? (
                    <p>
                      <span className="text-subtitle-1-medium text-warning-500">
                        {data.remaining.webPe}
                      </span>
                      <span className="text-subtitle-1-medium text-warning-500 pl-px">
                        명
                      </span>
                    </p>
                  ) : (
                    <p className="text-subtitle-1-medium text-teal-gray-700">
                      {data.remaining.webPe ?? "-"}
                    </p>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-center bg-white">
                  {typeof data.remaining.mobilePe === "number" ? (
                    <p>
                      <span className="text-subtitle-1-medium text-warning-500">
                        {data.remaining.mobilePe}
                      </span>
                      <span className="text-subtitle-1-medium text-warning-500 pl-px">
                        명
                      </span>
                    </p>
                  ) : (
                    <p className="text-subtitle-1-medium text-teal-gray-700">
                      {data.remaining.mobilePe ?? "-"}
                    </p>
                  )}
                </div>
                <div className="bg-warning-50 text-subtitle-1-medium text-warning-500 flex w-35 items-center justify-center gap-1">
                  <p>총</p>
                  <p>{data.remaining.total}</p>
                  <p>명</p>
                </div>
              </div>
            )}

            {/* Totals row */}
            <div className="divide-teal-gray-300 flex h-14 w-full divide-x">
              <div className="bg-teal-gray-50 flex w-42.5 items-center justify-center">
                <p className="text-subtitle-1-medium text-teal-gray-900">
                  지부 전체
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center bg-teal-100">
                <p>
                  <span className="text-heading-6-semibold text-teal-600">
                    {data.totals.pm}
                  </span>
                  <span className="text-subtitle-1-medium text-teal-gray-400 pl-0.5">
                    명
                  </span>
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center bg-teal-100">
                <p>
                  <span className="text-heading-6-semibold text-teal-600">
                    {data.totals.design}
                  </span>
                  <span className="text-subtitle-1-medium text-teal-gray-400 pl-0.5">
                    명
                  </span>
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center bg-teal-100">
                <p>
                  <span className="text-heading-6-semibold text-teal-600">
                    {data.totals.webPe}
                  </span>
                  <span className="text-subtitle-1-medium text-teal-gray-400 pl-0.5">
                    명
                  </span>
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center bg-teal-100">
                <p>
                  <span className="text-heading-6-semibold text-teal-600">
                    {data.totals.mobilePe}
                  </span>
                  <span className="text-subtitle-1-medium text-teal-gray-400 pl-0.5">
                    명
                  </span>
                </p>
              </div>

              <div
                className="flex h-14 w-35 shrink-0 items-center justify-center gap-1"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(199, 235, 230, 0.4), rgba(199, 235, 230, 0.4)), #E5F5F2",
                }}
              >
                <p className="text-heading-6-semibold text-teal-600">총</p>
                <p className="text-heading-6-semibold text-teal-600">
                  {data.totals.total}
                </p>
                <p className="text-subtitle-1-medium text-teal-gray-400">명</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
