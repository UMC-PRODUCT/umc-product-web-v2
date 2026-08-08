import { useCallback, useEffect, useMemo, useState } from "react"

import { useMe } from "@/entities/member/hooks/useMe"
import {
  isCentralCore,
  isSchoolLeadership,
} from "@/entities/member/model/identity"
import { getCurrentGisuChallengerRecords } from "@/entities/member/view-mode/currentGisuRecords"
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
import {
  findMatchingSchoolQuotaRow,
  getChangedSchoolQuotaRows,
  getConflictedSchoolQuotaRows,
  getSchoolQuotaIdentity,
  mergeSchoolQuotaRows,
  type SchoolQuotaEdits,
  type SchoolQuotaRow,
} from "../model/recruitmentQuota"
import { mapGroupsToChapterQuotaData } from "../model/recruitmentQuotaMapper"
import {
  type AllocationStatus,
  ChapterQuotaTableCard,
} from "./ChapterQuotaTableCard"
import { ChapterTabs } from "./ChapterTabs"
import { QuotaApplicantStatusCard } from "./QuotaApplicantStatusCard"

const QUOTA_PAGE_REFETCH_INTERVAL = 30_000

export function RecruitmentQuotaPage() {
  const { data: me, isLoading: isMeLoading } = useMe()
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
    Map<string, SchoolQuotaEdits>
  >(new Map())

  const addToast = useToastStore((state) => state.addToast)

  const viewerChapterRecord = useMemo(
    () => getCurrentGisuChallengerRecords(me)[0],
    [me],
  )
  const viewerChapterId = viewerChapterRecord?.chapterId
  const viewerChapterName = viewerChapterRecord?.chapterName
  const isSchoolScoped = isSchoolLeadership(me) && !isCentralCore(me)
  const canLoadRounds =
    !isMeLoading &&
    (!isSchoolScoped ||
      (Boolean(viewerChapterId) && Boolean(viewerChapterName)))
  const isAll = !isSchoolScoped && chapterTab === "all"
  const activeChapter = isSchoolScoped ? viewerChapterName : chapterTab

  const { groups } = useAdminRecruitingRounds(undefined, {
    fresh: true,
    refetchInterval: QUOTA_PAGE_REFETCH_INTERVAL,
    chapterId: isSchoolScoped ? viewerChapterId : undefined,
    enabled: canLoadRounds,
  })
  const { chapters: serverChapters } = useSchoolChapterMap({
    refetchInterval: QUOTA_PAGE_REFETCH_INTERVAL,
  })
  const visibleGroups = useMemo(() => {
    if (!isSchoolScoped || !viewerChapterId) return groups
    return groups.filter(
      (group) => String(group.chapterId) === String(viewerChapterId),
    )
  }, [groups, isSchoolScoped, viewerChapterId])
  const { data: activeGisuData } = useActiveGisu()
  const activeGisuId = activeGisuData?.gisuId
    ? String(activeGisuData.gisuId)
    : undefined

  const activeTabGroups = useMemo(
    () =>
      isAll
        ? visibleGroups
        : visibleGroups.filter((g) => g.chapterName === activeChapter),
    [activeChapter, isAll, visibleGroups],
  )
  const seasonIds = useMemo(
    () => [...new Set(activeTabGroups.map((g) => g.seasonId))],
    [activeTabGroups],
  )
  const { seasonConfigsMap, updateQuotas, createSeason, isSaving } =
    useRecruitingSeasonQuotas(seasonIds, {
      fresh: true,
      refetchInterval: QUOTA_PAGE_REFETCH_INTERVAL,
    })

  const allSeasonIds = useMemo(
    () => [...new Set(visibleGroups.map((g) => g.seasonId))],
    [visibleGroups],
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

  const allChaptersData = useMemo(() => {
    const mapped = mapGroupsToChapterQuotaData(
      visibleGroups,
      seasonConfigsMap,
      serverChapters,
      activeGisuId,
    )

    if (!isSchoolScoped) return mapped
    if (!viewerChapterName) return []
    return mapped.filter(
      (chapterData) => chapterData.chapter === viewerChapterName,
    )
  }, [
    activeGisuId,
    visibleGroups,
    isSchoolScoped,
    seasonConfigsMap,
    serverChapters,
    viewerChapterName,
  ])

  const chaptersDataWithEdits = useMemo(() => {
    return allChaptersData.map((chapterData) => {
      const editedSchools = editedSchoolsMap.get(chapterData.chapter)
      if (!editedSchools) return chapterData
      return {
        ...chapterData,
        schools: mergeSchoolQuotaRows(chapterData.schools, editedSchools),
      }
    })
  }, [allChaptersData, editedSchoolsMap])

  const conflictedSchoolNamesByChapter = useMemo(() => {
    const conflicts = new Map<string, Set<string>>()

    allChaptersData.forEach((chapterData) => {
      const edits = editedSchoolsMap.get(chapterData.chapter)
      if (!edits) return

      const conflictedRows = getConflictedSchoolQuotaRows(
        chapterData.schools,
        edits,
      )
      if (conflictedRows.length === 0) return

      conflicts.set(
        chapterData.chapter,
        new Set(conflictedRows.map((row) => row.schoolName)),
      )
    })

    return conflicts
  }, [allChaptersData, editedSchoolsMap])

  const conflictSummary = useMemo(
    () =>
      [...conflictedSchoolNamesByChapter.entries()].flatMap(
        ([chapter, schoolNames]) =>
          [...schoolNames].map((schoolName) => `${chapter} ${schoolName}`),
      ),
    [conflictedSchoolNamesByChapter],
  )

  useEffect(() => {
    if (isDirty || editedSchoolsMap.size === 0) return

    const isSynced = [...editedSchoolsMap.entries()].every(
      ([chapter, edits]) => {
        const serverRows = allChaptersData.find(
          (chapterData) => chapterData.chapter === chapter,
        )?.schools
        if (!serverRows) return false

        const serverRowsByIdentity = new Map(
          serverRows.map((row) => [getSchoolQuotaIdentity(row), row]),
        )

        return [...edits.values()].every((edit) => {
          const serverRow = serverRowsByIdentity.get(
            getSchoolQuotaIdentity(edit.row),
          )
          return (
            serverRow != null &&
            getChangedSchoolQuotaRows([serverRow], [edit.row]).length === 0
          )
        })
      },
    )

    if (isSynced) setEditedSchoolsMap(new Map())
  }, [allChaptersData, editedSchoolsMap, isDirty])

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

        const serverRows =
          allChaptersData.find((chapterData) => chapterData.chapter === chapter)
            ?.schools ?? []
        const chapterEdits = new Map(next.get(chapter) ?? [])

        schools.forEach((row) => {
          const existingEntry = [...chapterEdits.entries()].find(([, edit]) =>
            findMatchingSchoolQuotaRow([edit.row], row),
          )
          const serverRow = findMatchingSchoolQuotaRow(serverRows, row)
          const identity =
            existingEntry?.[0] ?? getSchoolQuotaIdentity(serverRow ?? row)
          const originalRow = existingEntry?.[1].originalRow ?? serverRow
          const isChanged =
            serverRow == null ||
            getChangedSchoolQuotaRows([serverRow], [row]).length > 0

          if (!isChanged) {
            chapterEdits.delete(identity)
            return
          }

          if (existingEntry && existingEntry[0] !== identity) {
            chapterEdits.delete(existingEntry[0])
          }
          chapterEdits.set(identity, { row, originalRow })
        })

        if (chapterEdits.size === 0) {
          next.delete(chapter)
        } else {
          next.set(chapter, chapterEdits)
        }

        return next
      })
    },
    [allChaptersData],
  )

  const handleSchoolDataChange = useCallback(
    (chapter: string, school: SchoolQuotaRow) => {
      setEditedSchoolsMap((prev) => {
        const next = new Map(prev)
        const serverRows =
          allChaptersData.find((chapterData) => chapterData.chapter === chapter)
            ?.schools ?? []
        const chapterEdits = new Map(next.get(chapter) ?? [])
        const existingEntry = [...chapterEdits.entries()].find(([, edit]) =>
          findMatchingSchoolQuotaRow([edit.row], school),
        )
        const serverRow = findMatchingSchoolQuotaRow(serverRows, school)
        const identity =
          existingEntry?.[0] ?? getSchoolQuotaIdentity(serverRow ?? school)
        const originalRow = existingEntry?.[1].originalRow ?? serverRow
        const isChanged =
          serverRow == null ||
          getChangedSchoolQuotaRows([serverRow], [school]).length > 0

        if (!isChanged) {
          chapterEdits.delete(identity)
        } else {
          chapterEdits.set(identity, { row: school, originalRow })
        }

        if (chapterEdits.size === 0) {
          next.delete(chapter)
        } else {
          next.set(chapter, chapterEdits)
        }

        return next
      })
    },
    [allChaptersData],
  )

  const handleSave = async () => {
    const targetChapters = isAll
      ? allChaptersData
      : allChaptersData.filter((c) => c.chapter === activeChapter)

    const changedRows = targetChapters.flatMap((chapterData) => {
      const edits = editedSchoolsMap.get(chapterData.chapter)
      if (!edits) return []

      return getChangedSchoolQuotaRows(
        chapterData.schools,
        [...edits.values()].map((edit) => edit.row),
      )
    })

    const existingSeasonRows = changedRows.filter(
      (row): row is SchoolQuotaRow & { seasonId: string } =>
        Boolean(row.seasonId) && canEditSeason(row.seasonId),
    )
    const newSeasonRows = changedRows.filter(
      (row): row is SchoolQuotaRow & { gisuId: string; schoolId: string } => {
        if (!row.seasonId && Boolean(row.gisuId) && Boolean(row.schoolId)) {
          const targetGroup = visibleGroups.find(
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

    if (payloadList.length === 0 && newSeasonRows.length === 0) {
      setIsDirty(false)
      return
    }

    try {
      let hasSuccessfulWrite = false
      let hasWriteFailure = false

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
            hasSuccessfulWrite = true
          } else {
            hasWriteFailure = true
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

        hasSuccessfulWrite ||= updateResult.fulfilledCount > 0
        hasWriteFailure ||= updateResult.failedCount > 0
      }

      if (hasSuccessfulWrite && !hasWriteFailure) {
        setIsDirty(false)
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
    (item) => item.chapter === activeChapter,
  ) ?? {
    chapter: activeChapter ?? "",
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

  const pageTitle = isAll ? "UMC 11th" : (activeChapter ?? "")
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

      {!isSchoolScoped && !isMeLoading && (
        <ChapterTabs value={chapterTab} onValueChange={handleTabChange} />
      )}

      <div className="flex w-full flex-col gap-6">
        <p className="text-heading-3-semibold px-3 text-teal-700">
          {pageTitle}
        </p>

        <div className="flex w-full flex-col gap-4">
          {conflictSummary.length > 0 && (
            <div
              role="alert"
              className="border-warning-200 bg-warning-50 text-warning-600 rounded-[8px] border px-4 py-3"
            >
              <p className="text-body-2-semibold">
                서버에서 모집 인원이 변경되었습니다.
              </p>
              <p className="text-body-2-medium mt-1">
                {conflictSummary.join(", ")}의 현재 입력값은 유지하고 있습니다.
                저장하면 서버의 최신 값을 덮어쓸 수 있습니다.
              </p>
            </div>
          )}

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
                    onSchoolDataChange={(school) =>
                      handleSchoolDataChange(chapterData.chapter, school)
                    }
                    onSchoolsDataChange={(schools) =>
                      handleSchoolsDataChange(chapterData.chapter, schools)
                    }
                    conflictedSchoolNames={conflictedSchoolNamesByChapter.get(
                      chapterData.chapter,
                    )}
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
                  onSchoolDataChange={(school) =>
                    handleSchoolDataChange(selectedChapterData.chapter, school)
                  }
                  onSchoolsDataChange={(schools) =>
                    handleSchoolsDataChange(
                      selectedChapterData.chapter,
                      schools,
                    )
                  }
                  conflictedSchoolNames={conflictedSchoolNamesByChapter.get(
                    selectedChapterData.chapter,
                  )}
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
