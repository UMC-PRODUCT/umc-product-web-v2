import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  isRedirect,
  redirect,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { getMatchingRounds } from "@/features/application/api/applicationApi"
import { applicationKeys } from "@/features/application/api/applicationKeys"
import { getResourcePermission } from "@/features/auth/api/permissions"
import { useMe } from "@/features/auth/hooks/useMe"
import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import {
  canManageProjectRecruitInfo,
  canManageProjects,
  getLatestChallengerRecord,
  isProjectRegistrationQuotaLimited,
} from "@/features/auth/model/identity"
import { hasGrantedPermission } from "@/features/auth/model/resourcePermission"
import { useProjectPermissions } from "@/features/project/hooks/useProjectPermissions"
import { getManagedProjects } from "@/features/project/management/api"
import {
  ApplicationForm,
  type ApplicationFormHandle,
  BasicInfoForm,
  RecruitInfoForm,
  type RecruitInfoFormHandle,
  Stepper,
} from "@/features/project/new"
import {
  buildUpsertApplicationFormBody,
  getApplicationForm,
  getMyDraft,
  getProjectDetail,
  gisuKeys,
  invalidateProjectSummaryQueries,
  projectKeys,
  submitProject,
  transferOwnership,
  upsertApplicationForm,
} from "@/features/project/new/api"
import { hydrateApplicationFormIntoStore } from "@/features/project/new/model/applicationFormHydrator"
import { hydrateDraftIntoStore } from "@/features/project/new/model/draftHydrator"
import { isWithinMatchingPeriod } from "@/features/project/new/model/matchingPeriod"
import { hydrateProjectDetailIntoStore } from "@/features/project/new/model/projectDetailHydrator"
import { useProjectRegisterStore } from "@/features/project/new/model/useProjectRegisterStore"
import { getActiveGisu } from "@/shared/api/gisu"
import { getMe } from "@/shared/api/me"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { useViewModeStore } from "@/shared/view-mode"
import { projectViewMe } from "@/shared/view-mode/projectViewMe"

import type { BasicInfoFormHandle } from "@/features/project/new/ui/basic-info/BasicInfoForm"

export const Route = createFileRoute("/matching/projects/new")({
  beforeLoad: async ({ context, search }) => {
    const me = await ensureMe(context.queryClient)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)

    if (!canManageProjects(viewMe)) {
      throw redirect({ to: "/matching/projects" })
    }

    if (search.projectId !== undefined) {
      return
    }

    let hasWritePermission = false
    try {
      const permission = await context.queryClient.ensureQueryData({
        queryKey: [
          "authorization",
          "resource-permission",
          "PROJECT",
          undefined,
          "WRITE",
        ],
        queryFn: () =>
          getResourcePermission({
            resourceType: "PROJECT",
            permissionType: "WRITE",
          }),
        staleTime: 0,
      })
      hasWritePermission = hasGrantedPermission(permission, "WRITE")
    } catch {
      throw redirect({ to: "/matching/projects" })
    }

    if (!hasWritePermission) {
      throw redirect({ to: "/matching/projects" })
    }

    if (isProjectRegistrationQuotaLimited(viewMe)) {
      try {
        const gisu = await context.queryClient.ensureQueryData({
          queryKey: gisuKeys.active,
          queryFn: getActiveGisu,
        })
        const gisuId = gisu?.gisuId ? Number(gisu.gisuId) : undefined
        if (gisuId) {
          const managed = await context.queryClient.ensureQueryData({
            queryKey: projectKeys.managedCheck(gisuId),
            queryFn: () => getManagedProjects(gisuId),
          })
          if (managed.length > 0) {
            throw redirect({
              to: "/matching/projects/management",
              search: { notice: "duplicate" },
            })
          }
        }
      } catch (error) {
        if (isRedirect(error)) throw error
      }
    }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    projectId:
      typeof search.projectId === "number"
        ? search.projectId
        : typeof search.projectId === "string" && /^\d+$/.test(search.projectId)
          ? Number(search.projectId)
          : undefined,
  }),
  component: ProjectRegisterPage,
})

function ProjectRegisterPage() {
  const { projectId: editProjectId } = Route.useSearch()
  const isEditMode = editProjectId !== undefined
  const [step, setStep] = useState(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false)
  const [applicationFormHydrated, setApplicationFormHydrated] = useState(false)
  const [tooltipTriggerStep, setTooltipTriggerStep] = useState<number | null>(
    null,
  )
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const basicInfoRef = useRef<BasicInfoFormHandle>(null)
  const recruitInfoRef = useRef<RecruitInfoFormHandle>(null)
  const applicationFormRef = useRef<ApplicationFormHandle>(null)
  const formTopRef = useRef<HTMLDivElement>(null)

  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const myChapterId = getLatestChallengerRecord(me)?.chapterId
  const matchingRoundsQuery = useQuery({
    queryKey: applicationKeys.matchingRounds(
      myChapterId ? Number(myChapterId) : undefined,
    ),
    queryFn: () =>
      getMatchingRounds(myChapterId ? Number(myChapterId) : undefined),
    enabled: isEditMode && myChapterId !== undefined,
  })
  const isApplicationReadOnly = useMemo(
    () =>
      isEditMode &&
      isWithinMatchingPeriod(matchingRoundsQuery.data, new Date()),
    [isEditMode, matchingRoundsQuery.data],
  )
  const projectId = useProjectRegisterStore((s) => s.projectId)
  const application = useProjectRegisterStore((s) => s.application)
  const pmInfo = useProjectRegisterStore((s) => s.pmInfo)
  const reset = useProjectRegisterStore((s) => s.reset)
  const setProjectId = useProjectRegisterStore((s) => s.setProjectId)
  const setGisuId = useProjectRegisterStore((s) => s.setGisuId)
  const setApplication = useProjectRegisterStore((s) => s.setApplication)
  const projectWritePermissionQuery = useResourcePermission(
    "PROJECT",
    undefined,
    {
      allowTypeLevel: true,
      enabled: !isEditMode,
      permissionType: "WRITE",
    },
  )
  const projectPermissionsQuery = useProjectPermissions(
    projectId ?? undefined,
    {
      enabled: projectId !== null,
    },
  )
  const canCreateProject =
    isEditMode || projectWritePermissionQuery.hasPermission("WRITE")
  const isCreatePermissionLoading =
    !isEditMode && projectWritePermissionQuery.isPending
  const canManageProject = projectPermissionsQuery.canManage
  const canManageRecruitInfoByRole = canManageProjectRecruitInfo(me)
  const canEditRecruitStep = isEditMode
    ? canManageProject
    : canManageRecruitInfoByRole

  const resolveCanEditRecruitStep = async (): Promise<boolean> => {
    if (!isEditMode) return canManageRecruitInfoByRole

    const pid = useProjectRegisterStore.getState().projectId
    if (pid === null) return false
    try {
      const permission = await queryClient.ensureQueryData({
        queryKey: [
          "authorization",
          "resource-permission",
          "PROJECT",
          pid,
          undefined,
        ],
        queryFn: () =>
          getResourcePermission({ resourceType: "PROJECT", resourceId: pid }),
        staleTime: 0,
      })
      return hasGrantedPermission(permission, "MANAGE")
    } catch {
      return false
    }
  }

  const isStoreDirty = useProjectRegisterStore((s) => {
    const recruitTotal =
      s.recruitInfo.design.count +
      s.recruitInfo.frontend.count +
      s.recruitInfo.backend.count
    return (
      s.projectId !== null ||
      s.basicInfo !== null ||
      s.basicDraftFields !== null ||
      s.pmInfo.pm1 !== null ||
      s.pmInfo.pm2 !== null ||
      s.pmInfo.isMultiPm ||
      s.uploaded.thumbnailFileId !== null ||
      s.uploaded.logoFileId !== null ||
      recruitTotal > 0 ||
      s.application.commonQuestions.length > 0 ||
      s.application.sections.length > 0
    )
  })

  useQuery({ queryKey: ["me"], queryFn: getMe })

  const gisuQuery = useQuery({
    queryKey: gisuKeys.active,
    queryFn: getActiveGisu,
  })

  const gisuId = gisuQuery.data?.gisuId

  useEffect(() => {
    if (gisuId) setGisuId(Number(gisuId))
  }, [gisuId, setGisuId])

  useEffect(() => {
    if (isEditMode && editProjectId && projectId !== editProjectId) {
      setProjectId(editProjectId)
    }
  }, [isEditMode, editProjectId, projectId, setProjectId])

  const detailQuery = useQuery({
    queryKey: projectKeys.detail(editProjectId ?? 0),
    queryFn: () => getProjectDetail(editProjectId!),
    enabled: isEditMode,
  })

  useEffect(() => {
    if (detailQuery.data) {
      hydrateProjectDetailIntoStore(detailQuery.data)
    }
  }, [detailQuery.data])

  useEffect(() => {
    if (!isEditMode || !detailQuery.isError) return
    const status = isAxiosError(detailQuery.error)
      ? detailQuery.error.response?.status
      : undefined
    if (status === 403 || status === 404) {
      addToast({
        message: "프로젝트에 접근할 권한이 없습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      navigate({ to: "/matching/projects/management", replace: true })
    }
  }, [isEditMode, detailQuery.isError, detailQuery.error, addToast, navigate])

  const draftQuery = useQuery({
    queryKey: projectKeys.draft(gisuId ?? 0),
    queryFn: () => getMyDraft(gisuId!),
    enabled: !isEditMode && !!gisuId,
  })

  useEffect(() => {
    if (draftQuery.data && !projectId) {
      hydrateDraftIntoStore(draftQuery.data)
    }
  }, [draftQuery.data, projectId])

  useEffect(() => {
    return () => {
      const { gisuId: storedGisuId } = useProjectRegisterStore.getState()

      reset()
      if (storedGisuId) {
        queryClient.removeQueries({
          queryKey: projectKeys.draft(storedGisuId),
        })
      }
    }
  }, [queryClient, reset])

  const applicationFormQuery = useQuery({
    queryKey: projectKeys.applicationForm(projectId ?? 0),
    queryFn: () => getApplicationForm(projectId!),
    enabled: isEditMode && !!projectId,
  })

  useEffect(() => {
    if (!isEditMode) return
    if (applicationFormQuery.data) {
      hydrateApplicationFormIntoStore(applicationFormQuery.data)
      setApplicationFormHydrated(true)
    } else if (applicationFormQuery.data === null) {
      setApplication({
        commonSectionId: undefined,
        commonQuestions: [],
        sections: [],
      })
      setApplicationFormHydrated(true)
    }
  }, [isEditMode, applicationFormQuery.data, setApplication])

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("프로젝트 ID가 없습니다.")
      if (!isEditMode && !canCreateProject) {
        throw new Error("프로젝트 생성 권한이 없습니다.")
      }
      if (applicationFormRef.current?.getIsDirty() ?? true) {
        const body = buildUpsertApplicationFormBody(
          application.commonQuestions,
          application.sections,
          application.commonSectionId,
        )
        await upsertApplicationForm(projectId, body)
      }
      if (isEditMode) return
      const result = await submitProject(projectId)
      if (pmInfo.pm1 && (await resolveCanEditRecruitStep())) {
        await transferOwnership(projectId, {
          newOwnerMemberId: Number(pmInfo.pm1.id),
        })
      }
      return result
    },
    onSuccess: () => {
      applicationFormRef.current?.resetDirty()
      invalidateProjectSummaryQueries(queryClient, projectId ?? undefined)
      setShowSuccessModal(true)
    },
    onError: (error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined
      const code = isAxiosError(error)
        ? (error.response?.data as { code?: string } | undefined)?.code
        : undefined
      const message =
        code === "PROJECT-0009"
          ? "매칭 기간 중에는 지원 폼을 수정할 수 없습니다."
          : status === 403
            ? isEditMode
              ? "프로젝트를 수정할 권한이 없습니다."
              : "프로젝트를 등록할 권한이 없습니다."
            : isEditMode
              ? "프로젝트 수정에 실패했습니다. 다시 시도해주세요."
              : "프로젝트 등록에 실패했습니다. 다시 시도해주세요."
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    }
  }, [])

  const triggerStepTooltip = (stepIdx: number) => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    setTooltipTriggerStep(stepIdx)
    tooltipTimerRef.current = setTimeout(
      () => setTooltipTriggerStep(null),
      3100,
    )
  }

  const moveToStep = (targetStep: number) => {
    setStep(targetStep)
    requestAnimationFrame(() => {
      const scrollTarget =
        document.getElementById("matching-segment-region") ?? formTopRef.current

      scrollTarget?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    })
  }

  const handleBasicInfoNext = async () => {
    const canEdit = await resolveCanEditRecruitStep()
    moveToStep(canEdit ? 2 : 3)
  }

  const handleApplicationFormPrev = async () => {
    const canEdit = await resolveCanEditRecruitStep()
    moveToStep(canEdit ? 2 : 1)
  }

  const guardForwardStepMove = async (targetStep: number) => {
    if (targetStep < step) return true

    if (step === 1) {
      const ok = await basicInfoRef.current?.validate()
      if (!ok) {
        triggerStepTooltip(targetStep)
        return false
      }
      return (await basicInfoRef.current?.save()) ?? true
    }

    if (step === 2) {
      return (await recruitInfoRef.current?.save()) ?? true
    }

    return true
  }

  const handleStepChange = async (targetStep: number) => {
    if (targetStep === step) return
    if (!canEditRecruitStep && targetStep === 2) {
      triggerStepTooltip(2)
      return
    }
    const canMove = await guardForwardStepMove(targetStep)
    if (!canMove) return
    moveToStep(targetStep)
  }

  const isEditModeDirty = useCallback(
    () =>
      (basicInfoRef.current?.getIsDirty() ?? false) ||
      (recruitInfoRef.current?.getIsDirty() ?? false) ||
      (applicationFormRef.current?.getIsDirty() ?? false),
    [],
  )

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveBlockStatus,
  } = useBlocker({
    shouldBlockFn: () => {
      if (showSuccessModal) return false
      return isEditMode ? isEditModeDirty() : isStoreDirty
    },
    withResolver: true,
    enableBeforeUnload: () => {
      if (showSuccessModal) return false
      return isEditMode ? isEditModeDirty() : isStoreDirty
    },
  })

  const isLeaveModalOpen = leaveBlockStatus === "blocked"

  const handleRegister = () => {
    submitMutation.mutate()
  }

  const handleSaveAndLeave = async () => {
    setIsSavingAndLeaving(true)
    try {
      if (step === 1) {
        const ok = await basicInfoRef.current?.save()
        if (!ok) return
      } else if (step === 2) {
        const ok = await recruitInfoRef.current?.save()
        if (!ok) return
      } else if (step === 3) {
        const ok = await applicationFormRef.current?.save()
        if (!ok) return
      }
      proceedLeave?.()
    } finally {
      setIsSavingAndLeaving(false)
    }
  }

  const handleSuccessConfirm = async () => {
    setShowSuccessModal(false)
    reset()
    queryClient.removeQueries({ queryKey: projectKeys.managed() })
    queryClient.removeQueries({ queryKey: projectKeys.lists() })
    queryClient.removeQueries({ queryKey: ["matchingProjects"] })
    if (isEditMode && editProjectId) {
      queryClient.removeQueries({ queryKey: projectKeys.detail(editProjectId) })
      queryClient.removeQueries({
        queryKey: projectKeys.applicationForm(editProjectId),
      })
    } else if (gisuId) {
      queryClient.removeQueries({
        queryKey: projectKeys.draft(Number(gisuId)),
      })
    }
    await navigate({ to: "/matching/projects/management", replace: true })
  }

  return (
    <section className="flex w-full min-w-0 flex-col items-start justify-start">
      <div className="border-teal-gray-100 bp1:px-6 bp2:px-8.5 bp2:pt-8 bp2:pb-10 flex h-full w-full max-w-242 min-w-0 flex-col gap-2.5 rounded-[12px] border bg-white px-4 pt-6 pb-8">
        <div ref={formTopRef} className="flex flex-col items-start gap-1.5">
          <span className="text-heading-6-semibold text-teal-gray-900">
            프로젝트 등록
          </span>
          <span className="text-body-2-regular text-teal-gray-600 mb-3.5">
            내 프로젝트의 대한 정보를 등록하고 모집 폼을 작성합니다.
          </span>
        </div>
        <Stepper
          step={step}
          onStepChange={handleStepChange}
          disabledSteps={!canEditRecruitStep ? [2] : []}
          disabledTooltips={
            !canEditRecruitStep
              ? {
                  2: "기술 스택 및 파트별 TO는 운영진이 수기로 조정합니다.",
                  3: "기본 정보를 입력한 뒤 작성할 수 있습니다.",
                }
              : {
                  2: "기본 정보를 입력한 뒤 작성할 수 있습니다.",
                  3: "기본 정보를 입력한 뒤 작성할 수 있습니다.",
                }
          }
          openTooltipStep={tooltipTriggerStep}
        />
        {step === 1 && (
          <BasicInfoForm
            ref={basicInfoRef}
            canCreateProject={canCreateProject}
            createPermissionLoading={isCreatePermissionLoading}
            onNext={handleBasicInfoNext}
          />
        )}
        {step === 2 && (
          <RecruitInfoForm
            ref={recruitInfoRef}
            readOnly={!canEditRecruitStep}
            canUpdatePartQuotasOverride={
              isEditMode ? undefined : canManageRecruitInfoByRole
            }
            isHydrated={isEditMode ? detailQuery.isSuccess : true}
            onPrev={() => moveToStep(1)}
            onNext={() => moveToStep(3)}
          />
        )}
        {step === 3 && (
          <ApplicationForm
            ref={applicationFormRef}
            isEditMode={isEditMode}
            readOnly={isApplicationReadOnly}
            isHydrated={isEditMode ? applicationFormHydrated : true}
            isSubmitting={submitMutation.isPending || isCreatePermissionLoading}
            canCreateProject={canCreateProject}
            createPermissionLoading={isCreatePermissionLoading}
            onPrev={handleApplicationFormPrev}
            onNext={handleRegister}
          />
        )}
      </div>
      <CtaModal
        open={showSuccessModal}
        variant="success"
        title={isEditMode ? "수정 완료" : "등록 완료"}
        content={
          isEditMode
            ? "프로젝트 수정이 완료되었습니다."
            : "프로젝트 등록이 완료되었습니다."
        }
        confirmText="확인"
        onOpenChange={setShowSuccessModal}
        onConfirm={handleSuccessConfirm}
      />
      <CtaModal
        open={isLeaveModalOpen}
        onOpenChange={(open) => {
          if (!open) resetLeave?.()
        }}
        variant="warning"
        title="페이지 이탈"
        content="저장되지 않았습니다. 저장 후 나가시겠습니까?"
        cancelText="나가기"
        confirmText="저장 후 나가기"
        confirmLoading={isSavingAndLeaving}
        cancelOnDismiss={false}
        onCancel={() => proceedLeave?.()}
        onConfirm={() => void handleSaveAndLeave()}
      />
    </section>
  )
}
