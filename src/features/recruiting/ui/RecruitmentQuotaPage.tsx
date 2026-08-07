import { useCallback, useMemo, useState } from "react"

import { useSchoolChapterMap } from "@/entities/organization/hooks/useSchoolChapterMap"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { useActiveGisu } from "@/shared/hooks/useActiveGisu"
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
  const [autoAllocateRequest, setAutoAllocateRequest] = useState<{
    id: number
    chapter: string
  } | null>(null)

  const [editedSchoolsMap, setEditedSchoolsMap] = useState<
    Map<string, SchoolQuotaRow[]>
  >(new Map())

  const addToast = useToastStore((state) => state.addToast)

  const { groups } = useAdminRecruitingRounds()
  const { chapters: serverChapters } = useSchoolChapterMap()
  const { data: activeGisuData } = useActiveGisu()
  const activeGisuId = activeGisuData?.gisuId
    ? String(activeGisuData.gisuId)
    : undefined

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
  const { seasonConfigsMap, updateQuotas, createSeason, isSaving } =
    useRecruitingSeasonQuotas(seasonIds)

  // 편집 권한은 시즌 단위라 서버 조회 결과를 그대로 쓴다. 권한을 확인하기
  // 전에는 잠가 둔다. 열어 두면 못 고칠 값을 고치고 저장에서야 거부당한다.
  //
  // 조회 범위는 현재 탭이 아니라 지부 전체다. 저장은 탭을 옮겨 다니며 쌓인
  // editedSchoolsMap 을 통째로 보내는데, 현재 탭 시즌만 조회하면 다른 지부에서
  // 고친 값이 권한 없음으로 판정돼 조용히 빠진다.
  const allSeasonIds = useMemo(
    () => [...new Set(groups.map((g) => g.seasonId))],
    [groups],
  )
  const { permittedSeasonIds, isLoading: isPermissionLoading } =
    useRecruitingPermissions(allSeasonIds)
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
    () =>
      mapGroupsToChapterQuotaData(
        groups,
        seasonConfigsMap,
        serverChapters,
        activeGisuId,
      ),
    [groups, seasonConfigsMap, serverChapters, activeGisuId],
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
    // 지부를 옮기면 앞선 요청은 끝난 것으로 본다. 남겨 두면 새 지부 카드가
    // 마운트되면서 누른 적 없는 자동 배정이 걸린다.
    setAutoAllocateRequest(null)
  }

  const handleConfirmAutoAllocate = () => {
    setAutoModalOpen(false)
    // 자동 배정은 전체 탭에서 막혀 있어 여기서는 항상 선택된 지부가 대상이다.
    setAutoAllocateRequest((prev) => ({
      id: (prev?.id ?? 0) + 1,
      chapter: chapterTab,
    }))
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
    setIsDirty(true)
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
    const targetChapters = isAll
      ? chaptersDataWithEdits
      : chaptersDataWithEdits.filter((c) => c.chapter === chapterTab)

    const rawRows = targetChapters.flatMap(
      (c) => editedSchoolsMap.get(c.chapter) ?? [],
    )

    const existingSeasonRows = rawRows.filter(
      (row): row is SchoolQuotaRow & { seasonId: string } =>
        Boolean(row.seasonId) && canEditSeason(row.seasonId),
    )
    const newSeasonRows = rawRows.filter(
      (row): row is SchoolQuotaRow & { gisuId: string; schoolId: string } => {
        if (!row.seasonId && Boolean(row.gisuId) && Boolean(row.schoolId)) {
          const targetGroup = groups.find(
            (g) =>
              String(g.schoolId) === String(row.schoolId) &&
              String(g.gisuId) === String(row.gisuId),
          )
          return canEditEverySeason || canEditSeason(targetGroup?.seasonId)
        }
        return false
      },
    )

    const payloadList = existingSeasonRows.map((row) => ({
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

    if (payloadList.length === 0 && newSeasonRows.length === 0) return

    try {
      const successfulSchoolNames = new Set<string>()

      if (newSeasonRows.length > 0) {
        const createResults = await Promise.allSettled(
          newSeasonRows.map(async (row) => {
            await createSeason({
              gisuId: row.gisuId,
              schoolId: row.schoolId,
              quotas: [
                { track: "PLAN", targetCount: row.pm },
                { track: "DESIGN", targetCount: row.design },
                { track: "WEB_PRODUCT_ENGINEER", targetCount: row.webPe },
                { track: "MOBILE_PRODUCT_ENGINEER", targetCount: row.mobilePe },
              ],
            })
            return row
          }),
        )

        let isAlreadyExistsError = false
        const failedCreateSchoolNames: string[] = []

        createResults.forEach((result, index) => {
          const row = newSeasonRows[index]
          if (!row) return

          if (result.status === "fulfilled") {
            successfulSchoolNames.add(row.schoolName)
          } else {
            failedCreateSchoolNames.push(row.schoolName)
            const err = result.reason as {
              code?: string
              response?: { data?: { code?: string; message?: string } }
              message?: string
            }
            if (
              err?.code === "RECRUITING-0103" ||
              err?.response?.data?.code === "RECRUITING-0103" ||
              err?.response?.data?.message?.includes(
                "이미 같은 학교와 기수의 모집 시즌이 있어요",
              )
            ) {
              isAlreadyExistsError = true
            }
          }
        })

        if (failedCreateSchoolNames.length > 0) {
          const message = isAlreadyExistsError
            ? `${failedCreateSchoolNames.join(", ")} 대학교는 이미 모집 시즌이 존재합니다. 페이지를 새로고침 해주세요.`
            : `${failedCreateSchoolNames.join(", ")} 시즌 생성에 실패했습니다. 잠시 후 다시 시도해주세요.`

          addToast({
            message,
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        }
      }

      if (payloadList.length > 0) {
        const updateResult = await updateQuotas(payloadList)

        updateResult.successfulVariables.forEach((v) => {
          if (v.schoolName) {
            successfulSchoolNames.add(v.schoolName)
          }
        })
      }

      if (successfulSchoolNames.size > 0) {
        let remainingCount = 0
        const nextMap = new Map<string, SchoolQuotaRow[]>()

        editedSchoolsMap.forEach((rows, chapter) => {
          const remainingRows = rows.filter(
            (r) =>
              !successfulSchoolNames.has(r.schoolName) &&
              (canEditSeason(r.seasonId) || canEditEverySeason),
          )
          if (remainingRows.length > 0) {
            nextMap.set(chapter, remainingRows)
            remainingCount += remainingRows.length
          }
        })

        if (remainingCount === 0) {
          setIsDirty(false)
          setEditedSchoolsMap(new Map())
        } else {
          setEditedSchoolsMap(nextMap)
        }
      }
    } catch {
      addToast({
        message: "저장 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
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

  const showAutoAllocateButton = !isAll && canEditEverySeason
  const showSaveButton = canEditAny

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
                    autoAllocateRequest={autoAllocateRequest}
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
                  autoAllocateRequest={autoAllocateRequest}
                />
              )}
            </div>
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
