import { useCallback, useMemo, useState } from "react"

import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import { useAdminRecruitingRounds } from "../hooks/useAdminRecruitingRounds"
import { useRecruitingPermissions } from "../hooks/useRecruitingPermissions"
import { useRecruitingSeasonQuotas } from "../hooks/useRecruitingSeasonQuotas"
import { hasAnyEditableSeason } from "../model/recruitingEditLock"
import { mapGroupsToChapterQuotaData } from "../model/recruitmentQuotaMapper"
import {
  type AllocationStatus,
  ChapterQuotaTableCard,
} from "./ChapterQuotaTableCard"
import { ChapterTabs } from "./ChapterTabs"
import { QuotaApplicantStatusCard } from "./QuotaApplicantStatusCard"

import type { SchoolQuotaRow } from "../model/recruitmentQuota"

export function RecruitmentQuotaPage() {
  const [chapterTab, setChapterTab] = useState("all")
  const [isDirty, setIsDirty] = useState(false)
  const [allocationStatus, setAllocationStatus] =
    useState<AllocationStatus>("TO 설정 전")
  const [autoModalOpen, setAutoModalOpen] = useState(false)
  const [autoAllocateTrigger, setAutoAllocateTrigger] = useState(0)

  const [editedSchoolsMap, setEditedSchoolsMap] = useState<
    Map<string, SchoolQuotaRow[]>
  >(new Map())

  const addToast = useToastStore((state) => state.addToast)

  const { groups } = useAdminRecruitingRounds()
  const activeTabGroups = useMemo(
    () =>
      chapterTab === "all"
        ? groups
        : groups.filter((g) => g.chapterName === chapterTab),
    [groups, chapterTab],
  )
  const seasonIds = useMemo(
    () => [...new Set(activeTabGroups.map((g) => g.seasonId))],
    [activeTabGroups],
  )
  const { seasonConfigsMap, updateQuotas, isSaving } =
    useRecruitingSeasonQuotas(seasonIds)

  // 편집 권한은 시즌 단위라 서버 조회 결과를 그대로 쓴다. 권한을 확인하기
  // 전에는 잠가 둔다. 열어 두면 못 고칠 값을 고치고 저장에서야 거부당한다.
  const { permittedSeasonIds, isLoading: isPermissionLoading } =
    useRecruitingPermissions(seasonIds)
  const canEditSeason = useCallback(
    (seasonId: string | undefined) =>
      !isPermissionLoading &&
      seasonId != null &&
      permittedSeasonIds.has(String(seasonId)),
    [permittedSeasonIds, isPermissionLoading],
  )
  const canEditAny =
    !isPermissionLoading && hasAnyEditableSeason(seasonIds, permittedSeasonIds)
  // 자동 배정은 화면의 모든 학교 행을 한꺼번에 덮어쓴다. 일부만 편집 가능한
  // 지부에서 열어 두면 잠긴 행까지 값이 바뀌고 저장에 실려 나간다.
  const canEditEverySeason =
    !isPermissionLoading &&
    seasonIds.length > 0 &&
    seasonIds.every((id) => permittedSeasonIds.has(String(id)))

  const allChaptersData = useMemo(
    () => mapGroupsToChapterQuotaData(groups, seasonConfigsMap),
    [groups, seasonConfigsMap],
  )

  const chaptersDataWithEdits = useMemo(() => {
    return allChaptersData.map((chapterData) => {
      const editedSchools = editedSchoolsMap.get(chapterData.chapter)
      if (!editedSchools) return chapterData
      return {
        ...chapterData,
        schools: editedSchools,
      }
    })
  }, [allChaptersData, editedSchoolsMap])

  const isAll = chapterTab === "all"

  const handleTabChange = (nextValue: string) => {
    setChapterTab(nextValue)
  }

  const handleConfirmAutoAllocate = () => {
    setAutoModalOpen(false)
    setAutoAllocateTrigger((prev) => prev + 1)
    setAllocationStatus("자동 배정 중")
    setIsDirty(true)

    addToast({
      message: "이제부터 모집 인원이 자동으로 배정됩니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  const handleManualEdit = useCallback(() => {
    setAllocationStatus((prev) => {
      if (prev === "자동 배정 중") {
        addToast({
          message: "직접 수정되어 자동 배정이 해제되었습니다.",
          color: "primary",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
      return "임의 배정 중"
    })
  }, [addToast])

  const handleErrorExceeded = useCallback(
    (partName: string, maxAllowed: number) => {
      const particle = partName.endsWith("PE") ? "는" : "은"
      addToast({
        message: `현재 ${partName}${particle} ${maxAllowed}명까지만 배정할 수 있습니다.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
    [addToast],
  )

  const handleSchoolsDataChange = useCallback(
    (chapter: string, schools: SchoolQuotaRow[]) => {
      setEditedSchoolsMap((prev) => {
        const next = new Map(prev)
        next.set(chapter, schools)
        return next
      })
    },
    [],
  )

  const handleSave = async () => {
    const allEditedRows = Array.from(editedSchoolsMap.values()).flat()
    const payloadList = allEditedRows
      // 편집 대상은 학교 행 단위인데 저장은 지부 전체 행을 모아 보낸다.
      // 권한 없는 시즌이 섞이면 그 건은 서버가 거부해 부분 실패로 남는다.
      .filter(
        (row): row is SchoolQuotaRow & { seasonId: string } =>
          Boolean(row.seasonId) && canEditSeason(row.seasonId),
      )
      .map((row) => ({
        seasonId: row.seasonId,
        schoolName: row.schoolName,
        payload: {
          quotas: [
            { track: "PLAN" as const, targetCount: row.pm },
            { track: "DESIGN" as const, targetCount: row.design },
            { track: "WEB_PRODUCT_ENGINEER" as const, targetCount: row.webPe },
            {
              track: "MOBILE_PRODUCT_ENGINEER" as const,
              targetCount: row.mobilePe,
            },
          ],
        },
      }))

    if (payloadList.length === 0) return

    try {
      const result = await updateQuotas(payloadList)

      if (result.failedCount === 0) {
        setIsDirty(false)
        setEditedSchoolsMap(new Map())
      } else {
        const successfulSchoolNames = new Set(
          result.successfulVariables
            .map((v) => v.schoolName)
            .filter((name): name is string => Boolean(name)),
        )

        setEditedSchoolsMap((prev) => {
          const next = new Map<string, SchoolQuotaRow[]>()
          prev.forEach((rows, chapter) => {
            const remainingRows = rows.filter(
              (r) => !successfulSchoolNames.has(r.schoolName),
            )
            if (remainingRows.length > 0) {
              next.set(chapter, remainingRows)
            }
          })
          if (next.size === 0) {
            setIsDirty(false)
          }
          return next
        })
      }
    } catch {
      // 에러 토스트는 useRecruitingSeasonQuotas 훅에서 처리됨
    }
  }

  const selectedChapterData = chaptersDataWithEdits.find(
    (item) => item.chapter === chapterTab,
  ) ?? {
    chapter: chapterTab,
    schoolCount: 0,
    schools: [],
    totals: { pm: 0, design: 0, webPe: 0, mobilePe: 0, total: 0 },
  }

  const currentPartCounts = isAll
    ? chaptersDataWithEdits.reduce(
        (acc, item) => ({
          pm: acc.pm + item.totals.pm,
          design: acc.design + item.totals.design,
          webPe: acc.webPe + item.totals.webPe,
          mobilePe: acc.mobilePe + item.totals.mobilePe,
        }),
        { pm: 0, design: 0, webPe: 0, mobilePe: 0 },
      )
    : selectedChapterData.totals

  const totalApplicants = isAll
    ? chaptersDataWithEdits.reduce((acc, item) => acc + item.totals.total, 0)
    : selectedChapterData.totals.total

  const hasApplicants = totalApplicants > 0

  const showAutoAllocateButton = !isAll && hasApplicants && canEditEverySeason
  const showSaveButton = hasApplicants && canEditAny

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

      <ChapterTabs value={chapterTab} onValueChange={handleTabChange} />

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
                        onClick={() => setAutoModalOpen(true)}
                        className="border-teal-gray-400/15 hover:bg-teal-gray-50 box-border flex h-8.5 cursor-pointer items-center gap-1 rounded-[10px] border bg-white pr-3 pl-2 transition-colors"
                      >
                        <ResetIcon className="text-teal-gray-400 size-4" />
                        <span className="text-label-1-medium text-teal-gray-700">
                          자동 배정
                        </span>
                      </button>
                    )}

                    {showSaveButton && (
                      <Button
                        size="xs"
                        color="primary"
                        variant="fill"
                        disabled={!isDirty || isSaving}
                        className="w-auto px-3"
                        onClick={handleSave}
                      >
                        {isSaving
                          ? "저장 중..."
                          : isDirty
                            ? "저장"
                            : "저장 완료"}
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
                  chaptersDataWithEdits.map((chapterData) => (
                    <ChapterQuotaTableCard
                      key={chapterData.chapter}
                      data={chapterData}
                      status={allocationStatus}
                      onDirtyChange={() => setIsDirty(true)}
                      onManualEdit={handleManualEdit}
                      onErrorExceeded={handleErrorExceeded}
                      canEditSeason={canEditSeason}
                      onSchoolsDataChange={(schools) =>
                        handleSchoolsDataChange(chapterData.chapter, schools)
                      }
                      autoAllocateTrigger={autoAllocateTrigger}
                    />
                  ))
                ) : (
                  <ChapterQuotaTableCard
                    data={selectedChapterData}
                    status={allocationStatus}
                    onDirtyChange={() => setIsDirty(true)}
                    onManualEdit={handleManualEdit}
                    onErrorExceeded={handleErrorExceeded}
                    canEditSeason={canEditSeason}
                    onSchoolsDataChange={(schools) =>
                      handleSchoolsDataChange(
                        selectedChapterData.chapter,
                        schools,
                      )
                    }
                    autoAllocateTrigger={autoAllocateTrigger}
                  />
                )}
              </div>
            )}
          </div>

          {/* 자동 배정 확인 CtaModal */}
          <CtaModal
            open={autoModalOpen}
            title="자동 배정을 하시겠습니까?"
            content={
              <p className="w-full break-keep">
                지원자 현황에 따라 실시간으로
                <br />
                <span className="text-teal-500">
                  PM : Design : PE = 1 : 1 : 5 비율
                </span>
                로 자동 배정됩니다.
                <br />
                이후 지부 상황에 맞게 직접 수정할 수 있습니다.
              </p>
            }
            cancelText="돌아가기"
            confirmText="자동 배정하기"
            variant="warning"
            onOpenChange={setAutoModalOpen}
            onCancel={() => setAutoModalOpen(false)}
            onConfirm={handleConfirmAutoAllocate}
          />
        </div>
      </div>
    </div>
  )
}
