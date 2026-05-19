import { useMutation, useQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  redirect,
  useBlocker,
  useNavigate,
} from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import { isCurrentTermPm, isOperator } from "@/features/auth/model/identity"
import {
  ApplicationForm,
  BasicInfoForm,
  RecruitInfoForm,
  Stepper,
} from "@/features/project/new"
import {
  buildUpsertApplicationFormBody,
  getApplicationForm,
  getMyDraft,
  gisuKeys,
  projectKeys,
  submitProject,
  transferOwnership,
  upsertApplicationForm,
} from "@/features/project/new/api"
import { hydrateApplicationFormIntoStore } from "@/features/project/new/model/applicationFormHydrator"
import { hydrateDraftIntoStore } from "@/features/project/new/model/draftHydrator"
import { useProjectRegisterStore } from "@/features/project/new/model/useProjectRegisterStore"
import { getActiveGisu } from "@/shared/api/gisu"
import { getMe } from "@/shared/api/me"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type { BasicInfoFormHandle } from "@/features/project/new/ui/basic-info/BasicInfoForm"

export const Route = createFileRoute("/matching/projects/new")({
  beforeLoad: () => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      throw redirect({ to: "/login" })
    }
  },
  component: ProjectRegisterPage,
})

function ProjectRegisterPage() {
  const [step, setStep] = useState(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const basicInfoRef = useRef<BasicInfoFormHandle>(null)

  const { data: me } = useMe()
  const isPm = isCurrentTermPm(me)
  const canWrite = isOperator(me) || isPm

  useEffect(() => {
    if (me === undefined) return
    if (!canWrite) {
      navigate({ to: "/matching/projects" })
    }
  }, [me, canWrite, navigate])

  const projectId = useProjectRegisterStore((s) => s.projectId)
  const application = useProjectRegisterStore((s) => s.application)
  const recruitInfo = useProjectRegisterStore((s) => s.recruitInfo)
  const pmInfo = useProjectRegisterStore((s) => s.pmInfo)
  const reset = useProjectRegisterStore((s) => s.reset)
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
    if (gisuId) setGisuId(gisuId)
  }, [gisuId, setGisuId])

  const draftQuery = useQuery({
    queryKey: projectKeys.draft(gisuId ?? 0),
    queryFn: () => getMyDraft(gisuId!),
    enabled: !!gisuId,
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
    } else if (applicationFormQuery.data === null) {
      setApplication({ commonQuestions: [], sections: [] })
    }
  }, [applicationFormQuery.data, setApplication])

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("프로젝트 ID가 없습니다.")
      const body = buildUpsertApplicationFormBody(
        application.commonQuestions,
        application.sections,
      )
      await upsertApplicationForm(projectId, body)
      const result = await submitProject(projectId)
      if (pmInfo.pm1) {
        await transferOwnership(projectId, {
          newOwnerMemberId: Number(pmInfo.pm1.id),
        })
      }
      return result
    },
    onSuccess: () => {
      reset()
      setShowSuccessModal(true)
    },
    onError: () => {
      addToast({
        message: "프로젝트 등록에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3,
      })
    },
  })

  const handleBasicInfoNext = () => {
    setStep(isPm ? 3 : 2)
  }

  const handleApplicationFormPrev = () => {
    setStep(isPm ? 1 : 2)
  }

  const isStep3Locked = false

  const handleStepChange = async (idx: number) => {
    if (isPm && idx === 2) return
    if (idx <= step) {
      setStep(idx)
      return
    }
    if (step === 1) {
      const ok = await basicInfoRef.current?.validate()
      if (!ok) return
    } else if (step === 2) {
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

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveBlockStatus,
  } = useBlocker({
    shouldBlockFn: () => isStoreDirty,
    withResolver: true,
    enableBeforeUnload: isStoreDirty,
  })

  const isLeaveModalOpen = leaveBlockStatus === "blocked"

  const handleRegister = () => {
    submitMutation.mutate()
  }

  const handleSuccessConfirm = async () => {
    setShowSuccessModal(false)
    await navigate({ to: "/matching/projects", replace: true })
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
          disabledSteps={[...(isPm ? [2] : []), ...(isStep3Locked ? [3] : [])]}
          disabledTooltips={{
            2: "기술 스택 및 파트별 TO는 운영진이 수기로 조정합니다.",
            3: "기본 정보를 입력한 뒤 작성할 수 있습니다.",
          }}
        />
        {step === 1 && (
          <BasicInfoForm ref={basicInfoRef} onNext={handleBasicInfoNext} />
        )}
        {step === 2 && (
          <RecruitInfoForm
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ApplicationForm
            onPrev={handleApplicationFormPrev}
            onNext={handleRegister}
          />
        )}
      </div>
      <CtaModal
        open={showSuccessModal}
        variant="success"
        title="등록 완료"
        content="프로젝트 등록이 완료되었습니다."
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
        content={
          <>
            작성 중인 내용이 저장되지 않습니다.
            <br />
            나가시겠습니까?
          </>
        }
        cancelText="돌아가기"
        confirmText="나가기"
        onCancel={() => resetLeave?.()}
        onConfirm={() => proceedLeave?.()}
      />
    </section>
  )
}
