import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  redirect,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import { ensureMe } from "@/features/auth/lib/ensureMe"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
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
  projectKeys,
  submitProject,
  transferOwnership,
  upsertApplicationForm,
} from "@/features/project/new/api"
import { hydrateApplicationFormIntoStore } from "@/features/project/new/model/applicationFormHydrator"
import { hydrateDraftIntoStore } from "@/features/project/new/model/draftHydrator"
import { hydrateProjectDetailIntoStore } from "@/features/project/new/model/projectDetailHydrator"
import { useProjectRegisterStore } from "@/features/project/new/model/useProjectRegisterStore"
import { getActiveGisu } from "@/shared/api/gisu"
import { getMe } from "@/shared/api/me"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type { BasicInfoFormHandle } from "@/features/project/new/ui/basic-info/BasicInfoForm"

export const Route = createFileRoute("/matching/projects/new")({
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    if (!isOperator(me) && !isCurrentTermPm(me)) {
      throw redirect({ to: "/matching/projects" })
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

  const queryClient = useQueryClient()
  const { data: me } = useMe()
  const isPm = isCurrentTermPm(me)

  const projectId = useProjectRegisterStore((s) => s.projectId)
  const application = useProjectRegisterStore((s) => s.application)
  const recruitInfo = useProjectRegisterStore((s) => s.recruitInfo)
  const pmInfo = useProjectRegisterStore((s) => s.pmInfo)
  const reset = useProjectRegisterStore((s) => s.reset)
  const setProjectId = useProjectRegisterStore((s) => s.setProjectId)
  const setGisuId = useProjectRegisterStore((s) => s.setGisuId)
  const setApplication = useProjectRegisterStore((s) => s.setApplication)

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

  const managedCheckQuery = useQuery({
    queryKey: ["project", "managed", "me", gisuId, "check"],
    queryFn: () => getManagedProjects(Number(gisuId)),
    enabled: isPm && !isEditMode && !!gisuId,
  })

  useEffect(() => {
    if (!isPm || isEditMode) return
    if (managedCheckQuery.data && managedCheckQuery.data.length > 0) {
      addToast({
        message: "등록된 프로젝트가 이미 존재 합니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      navigate({ to: "/matching/projects/management", replace: true })
    }
  }, [isPm, isEditMode, managedCheckQuery.data, addToast, navigate])

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

  const applicationFormQuery = useQuery({
    queryKey: projectKeys.applicationForm(projectId ?? 0),
    queryFn: () => getApplicationForm(projectId!),
    enabled: !!projectId,
  })

  useEffect(() => {
    if (applicationFormQuery.data) {
      hydrateApplicationFormIntoStore(applicationFormQuery.data)
      setApplicationFormHydrated(true)
    } else if (applicationFormQuery.data === null) {
      setApplication({ commonQuestions: [], sections: [] })
      setApplicationFormHydrated(true)
    }
  }, [applicationFormQuery.data, setApplication])

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("프로젝트 ID가 없습니다.")
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
      if (pmInfo.pm1) {
        await transferOwnership(projectId, {
          newOwnerMemberId: Number(pmInfo.pm1.id),
        })
      }
      return result
    },
    onSuccess: () => {
      applicationFormRef.current?.resetDirty()
      void queryClient.invalidateQueries({ queryKey: ["project", "managed"] })
      setShowSuccessModal(true)
    },
    onError: () => {
      addToast({
        message: isEditMode
          ? "프로젝트 수정에 실패했습니다. 다시 시도해주세요."
          : "프로젝트 등록에 실패했습니다. 다시 시도해주세요.",
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

  const handleBasicInfoNext = () => {
    setStep(isPm ? 3 : 2)
  }

  const handleApplicationFormPrev = () => {
    setStep(isPm ? 1 : 2)
  }

  const handleStepChange = async (idx: number) => {
    if (isEditMode) return
    if (isPm && idx === 2) {
      setStep(2)
      triggerStepTooltip(2)
      return
    }
    if (idx <= step) {
      setStep(idx)
      return
    }
    if (step === 1) {
      const ok = await basicInfoRef.current?.validate()
      if (!ok) {
        triggerStepTooltip(idx)
        return
      }
      const saved = await basicInfoRef.current?.save()
      if (!saved) return
    } else if (step === 2 && !isPm) {
      const total = Object.values(recruitInfo).reduce(
        (sum, { count }) => sum + count,
        0,
      )
      if (total === 0) {
        addToast({
          message: "모집 인원을 1명 이상 입력해 주세요.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
    }
    setStep(idx)
  }

  const isEditModeDirty = () =>
    (basicInfoRef.current?.getIsDirty() ?? false) ||
    (recruitInfoRef.current?.getIsDirty() ?? false) ||
    (applicationFormRef.current?.getIsDirty() ?? false)

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

  if (isPm && !isEditMode && managedCheckQuery.isPending) return null

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
    await navigate({ to: "/matching/projects/management", replace: true })
  }

  return (
    <section className="flex w-full flex-col items-start justify-start pt-10">
      <div className="border-teal-gray-150 flex h-full w-242 flex-col gap-2.5 rounded-[12px] border bg-white px-8.5 py-8">
        <div className="flex flex-col items-start gap-1.5">
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
          disabledSteps={
            isEditMode
              ? [1, 2, 3].filter((idx) => idx !== step)
              : isPm
                ? [2]
                : []
          }
          disabledTooltips={
            isEditMode
              ? {}
              : isPm
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
          <BasicInfoForm ref={basicInfoRef} onNext={handleBasicInfoNext} />
        )}
        {step === 2 && (
          <RecruitInfoForm
            ref={recruitInfoRef}
            readOnly={isPm}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ApplicationForm
            ref={applicationFormRef}
            isEditMode={isEditMode}
            isHydrated={isEditMode ? applicationFormHydrated : true}
            isSubmitting={submitMutation.isPending}
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
        cancelText="돌아가기"
        confirmText="저장 후 나가기"
        confirmLoading={isSavingAndLeaving}
        onCancel={() => resetLeave?.()}
        onConfirm={() => void handleSaveAndLeave()}
      />
    </section>
  )
}
