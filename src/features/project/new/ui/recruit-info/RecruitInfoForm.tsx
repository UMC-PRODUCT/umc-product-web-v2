import { useQueryClient } from "@tanstack/react-query"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useProjectPermissions } from "@/features/project/hooks/useProjectPermissions"
import {
  buildPartQuotasEntries,
  invalidateProjectSummaryQueries,
  updatePartQuotas,
} from "@/features/project/new/api"
import { Button } from "@/shared/ui/Button"
import { Counter } from "@/shared/ui/Counter"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

import {
  type RoleKey,
  type RoleStack,
  type RoleState,
  useProjectRegisterStore,
} from "../../model/useProjectRegisterStore"
import { SectionHeader } from "../shared/SectionHeader"

const ROLES: {
  key: RoleKey
  label: string
  stacks: RoleStack[]
}[] = [
  { key: "design", label: "Design", stacks: [] },
  { key: "frontend", label: "Frontend", stacks: ["Web", "iOS", "Android"] },
  { key: "backend", label: "Backend", stacks: ["SpringBoot", "Node.js"] },
]

export interface RecruitInfoFormHandle {
  save: () => Promise<boolean>
  getIsDirty: () => boolean
}

interface RecruitInfoFormProps {
  onPrev: () => void
  onNext: () => void
  readOnly?: boolean
  isHydrated?: boolean
  canUpdatePartQuotasOverride?: boolean
}

function buildSummaryText(
  roles: typeof ROLES,
  states: Record<RoleKey, RoleState>,
): string {
  return roles
    .filter(({ key }) => states[key].count > 0)
    .map(({ key, label }) => {
      const { count, stack } = states[key]
      const name = stack ?? label
      return `${name} ${count}명`
    })
    .join(", ")
}

export const RecruitInfoForm = forwardRef<
  RecruitInfoFormHandle,
  RecruitInfoFormProps
>(function RecruitInfoForm(
  {
    onPrev,
    onNext,
    readOnly = false,
    isHydrated = true,
    canUpdatePartQuotasOverride,
  },
  ref,
) {
  const addToast = useToastStore((s) => s.addToast)
  const storeRecruitInfo = useProjectRegisterStore((s) => s.recruitInfo)
  const setRecruitInfo = useProjectRegisterStore((s) => s.setRecruitInfo)
  const projectId = useProjectRegisterStore((s) => s.projectId)
  const projectPermissionsQuery = useProjectPermissions(
    projectId ?? undefined,
    {
      enabled: projectId !== null && canUpdatePartQuotasOverride !== true,
    },
  )
  const canUpdatePartQuotas =
    canUpdatePartQuotasOverride ?? projectPermissionsQuery.canManage
  const isPartQuotaPermissionLoading =
    canUpdatePartQuotasOverride !== true &&
    projectId !== null &&
    projectPermissionsQuery.isPending
  const isReadOnly =
    readOnly || isPartQuotaPermissionLoading || !canUpdatePartQuotas

  const [isSaving, setIsSaving] = useState(false)
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const savedSnapshotRef = useRef(JSON.stringify(storeRecruitInfo))
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isHydrated) {
      savedSnapshotRef.current = JSON.stringify(storeRecruitInfo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  const roleStates = storeRecruitInfo

  const totalCount = Object.values(roleStates).reduce(
    (sum, { count }) => sum + count,
    0,
  )

  const summaryText = buildSummaryText(ROLES, roleStates)

  const hasUnsavedChanges =
    savedSnapshotRef.current !== JSON.stringify(roleStates)
  const canTempSave =
    totalCount > 0 && hasUnsavedChanges && !isSaving && !isReadOnly
  const tempSaveLabel =
    hasSavedOnce && !hasUnsavedChanges ? "저장 완료" : "임시 저장"

  const savePartQuotas = async (silent = false): Promise<boolean> => {
    if (isReadOnly || !canUpdatePartQuotas) {
      setRecruitInfo(roleStates)
      return true
    }
    if (!hasUnsavedChanges) return true
    if (!projectId) {
      addToast({
        message: "기본 정보를 먼저 임시 저장해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    const missingStackRole = ROLES.find(
      ({ key, stacks }) =>
        stacks.length > 0 &&
        roleStates[key].count > 0 &&
        !roleStates[key].stack,
    )
    if (missingStackRole) {
      addToast({
        message: `${missingStackRole.label} 스택을 선택해 주세요.`,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    }
    const snapshotToSave = JSON.stringify(roleStates)
    setIsSaving(true)
    try {
      await updatePartQuotas(projectId, {
        entries: buildPartQuotasEntries(roleStates),
      })
      setRecruitInfo(roleStates)
      invalidateProjectSummaryQueries(queryClient, projectId)
      savedSnapshotRef.current = snapshotToSave
      setHasSavedOnce(true)
      if (!silent) {
        addToast({
          message: "작성한 내용이 임시 저장되었습니다.",
          color: "primary",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
      return true
    } catch {
      addToast({
        message: "임시 저장에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  useImperativeHandle(ref, () => ({
    save: () => savePartQuotas(false),
    getIsDirty: () => hasUnsavedChanges,
  }))

  const handleNext = async () => {
    if (isReadOnly) {
      onNext()
      return
    }
    if (totalCount === 0) {
      addToast({
        message: "모집 인원을 1명 이상 입력해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    if (!hasUnsavedChanges) {
      onNext()
      return
    }
    const ok = await savePartQuotas(true)
    if (!ok) return
    addToast({
      message: "작성한 내용이 저장되었습니다.",
      color: "primary",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    onNext()
  }

  const handleTempSave = () => {
    void savePartQuotas(false)
  }

  const updateCount = (key: RoleKey, count: number) => {
    setRecruitInfo({
      ...roleStates,
      [key]: {
        ...roleStates[key],
        count,
        stack: count === 0 ? undefined : roleStates[key].stack,
      },
    })
  }

  const updateStack = (key: RoleKey, stack: RoleStack | undefined) => {
    setRecruitInfo({
      ...roleStates,
      [key]: { ...roleStates[key], stack },
    })
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="px-4">
        <SectionHeader index={2} title="모집 인원 및 스택" />
        <div className="border-teal-gray-200 bp1:mx-8.5 bp2:gap-11.5 bp2:pb-11 mx-0 flex flex-col gap-8 border-b pt-6 pb-10">
          {ROLES.map(({ key, label, stacks }) => (
            <div
              key={key}
              className="bp1:flex-row bp1:flex-wrap bp1:items-center bp1:gap-6 flex min-w-0 flex-col items-start gap-3"
            >
              <span className="text-body-1-regular text-teal-gray-700 w-16 shrink-0">
                {label}
              </span>
              <Counter
                value={roleStates[key].count}
                onChange={(v) => updateCount(key, v)}
                disabled={isReadOnly}
                aria-label={`${label} 인원`}
              />
              {stacks.length > 0 && (
                <OptionButtonGroup
                  variant="segmented"
                  allowDeselect
                  value={roleStates[key].stack}
                  className="max-w-full flex-wrap"
                  onValueChange={(v) =>
                    isReadOnly
                      ? undefined
                      : updateStack(key, v as RoleStack | undefined)
                  }
                >
                  {stacks.map((stack) => (
                    <OptionButton
                      key={stack}
                      value={stack}
                      disabled={isReadOnly || roleStates[key].count === 0}
                    >
                      {stack}
                    </OptionButton>
                  ))}
                </OptionButtonGroup>
              )}
            </div>
          ))}
        </div>
        <div className="bg-teal-gray-100 bp1:mb-21 bp1:flex-row bp1:items-center bp1:px-7 bp1:py-2.5 mt-4 mb-14 flex w-full flex-col gap-2 rounded-[8px] px-4 py-3">
          <div className="text-subtitle-3-semibold border-teal-gray-200 bp1:border-r bp1:pr-7.5 flex text-teal-600">
            <span className="bp1:mr-17 mr-6">총 모집 인원</span>
            <span className="mr-1">{totalCount}</span>
            <span>명</span>
          </div>
          <span className="text-teal-gray-700 text-body-1-regular bp1:ml-7.5">
            {summaryText || "직군별 인원을 선택해 주세요"}
          </span>
        </div>
      </div>
      <div className="bp1:flex-row bp1:justify-between flex flex-col-reverse gap-3">
        {!readOnly ? (
          <Button
            type="button"
            variant="weak"
            color="primary"
            disabled={!canTempSave}
            isLoading={isSaving}
            onClick={handleTempSave}
          >
            {tempSaveLabel}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="weak" color="neutral" onClick={onPrev}>
            이전
          </Button>
          <Button
            type="button"
            variant="fill"
            color="primary"
            disabled={isSaving}
            onClick={() => void handleNext()}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
})
