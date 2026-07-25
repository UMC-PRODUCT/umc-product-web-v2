import { useState } from "react"

import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import {
  getAllChaptersQuotaData,
  getChapterQuotaData,
  RECRUITMENT_QUOTA_MOCK,
} from "../model/recruitmentQuota.mock"
import { ChapterQuotaTableCard } from "./ChapterQuotaTableCard"
import { ChapterTabs } from "./ChapterTabs"
import { QuotaApplicantStatusCard } from "./QuotaApplicantStatusCard"

export function RecruitmentQuotaPage() {
  const [chapterTab, setChapterTab] = useState("all")

  const isAll = chapterTab === "all"

  const allChaptersData = getAllChaptersQuotaData(RECRUITMENT_QUOTA_MOCK)

  const selectedChapterData = isAll
    ? null
    : getChapterQuotaData(RECRUITMENT_QUOTA_MOCK, chapterTab)

  const currentPartCounts = isAll
    ? allChaptersData.reduce(
        (acc, item) => ({
          pm: acc.pm + item.totals.pm,
          design: acc.design + item.totals.design,
          webPe: acc.webPe + item.totals.webPe,
          mobilePe: acc.mobilePe + item.totals.mobilePe,
        }),
        { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
      )
    : selectedChapterData!.totals

  const totalApplicants = isAll
    ? allChaptersData.reduce((acc, item) => acc + item.totals.total, 0)
    : selectedChapterData!.totals.total

  const hasApplicants = totalApplicants > 0

  const showAutoAllocateButton = !isAll && hasApplicants
  const showSaveButton = hasApplicants

  const pageTitle = isAll ? "UMC 11th" : chapterTab
  const statusCardTitle = isAll ? "전체 지원자 현황" : "지부 지원자 현황"

  return (
    <div className="flex w-full max-w-263 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "recruitment-management", label: "모집 관리" },
          { id: "quota-setting", label: "모집 인원 설정" },
        ]}
        title="모집 인원 설정"
        description="지원 현황을 보며 학교별 모집 인원을 확정합니다."
        className="pl-3"
      />

      <ChapterTabs value={chapterTab} onValueChange={setChapterTab} />

      <div className="flex w-full flex-col gap-6">
        <p className="text-heading-3-semibold px-3 text-teal-700">
          {pageTitle}
        </p>

        <div className="flex w-full flex-col gap-4">
          {/* 지원자 현황 */}
          <QuotaApplicantStatusCard
            title={statusCardTitle}
            updatedDate="26-07-04"
            updatedTime="02:48"
            partCounts={currentPartCounts}
          />

          {/* 학교별 파트 TO */}
          <div className="border-teal-gray-100 shadow-drop-neutral-3 flex w-full flex-col rounded-[12px] border bg-white px-8 pt-7 pb-8">
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-6-semibold text-teal-700">
                  학교별 파트 TO
                </span>

                {(showAutoAllocateButton || showSaveButton) && (
                  <div className="flex items-center gap-3">
                    {showAutoAllocateButton && (
                      <button
                        type="button"
                        className="border-teal-gray-400/15 box-border flex h-8.5 items-center gap-1 rounded-[10px] border bg-white pr-3 pl-2"
                      >
                        <ResetIcon className="text-teal-gray-400 size-4" />
                        <span className="text-label-1-medium text-teal-gray-700">
                          자동 배정
                        </span>
                      </button>
                    )}

                    {showSaveButton && (
                      <Button size="xs" color="primary" variant="fill">
                        저장
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-body-2-medium text-teal-gray-600">
                초기 TO는{" "}
                <span className="text-teal-500">
                  PM : Design : PE = 1 : 1 : 5
                </span>{" "}
                비율로 자동 배정됩니다.
                <br />
                이후 지부 상황에 맞게 직접 수정할 수 있습니다.
              </p>
            </div>

            {!isAll && !hasApplicants ? (
              <div className="flex h-65 w-full items-center justify-center">
                <p className="text-body-2-medium text-teal-gray-400">
                  현재 TO를 정할 지원자가 없습니다.
                </p>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-10">
                {isAll ? (
                  allChaptersData.map((chapterData) => (
                    <ChapterQuotaTableCard
                      key={chapterData.chapter}
                      data={chapterData}
                    />
                  ))
                ) : (
                  <ChapterQuotaTableCard data={selectedChapterData!} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
