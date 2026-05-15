import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
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
  upsertApplicationForm,
} from "@/features/project/new/api"
import { hydrateApplicationFormIntoStore } from "@/features/project/new/model/applicationFormHydrator"
import { hydrateDraftIntoStore } from "@/features/project/new/model/draftHydrator"
import { useProjectRegisterStore } from "@/features/project/new/model/useProjectRegisterStore"
import { getActiveGisu } from "@/shared/api/gisu"
import { getMe } from "@/shared/api/me"

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
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  const projectId = useProjectRegisterStore((s) => s.projectId)
  const application = useProjectRegisterStore((s) => s.application)
  const reset = useProjectRegisterStore((s) => s.reset)
  const setGisuId = useProjectRegisterStore((s) => s.setGisuId)

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
    }
  }, [applicationFormQuery.data])

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("프로젝트 ID가 없습니다.")
      const body = buildUpsertApplicationFormBody(
        application.commonQuestions,
        application.sections,
      )
      await upsertApplicationForm(projectId, body)
      return submitProject(projectId)
    },
    onSuccess: async () => {
      addToast({
        message: "프로젝트가 성공적으로 등록되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3,
      })
      reset()
      await navigate({ to: "/matching/applications", replace: true })
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

  const handleRegister = () => {
    submitMutation.mutate()
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
        <Stepper step={step} onStepChange={setStep} />
        {step === 1 && <BasicInfoForm onNext={() => setStep(2)} />}
        {step === 2 && (
          <RecruitInfoForm
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ApplicationForm onPrev={() => setStep(2)} onNext={handleRegister} />
        )}
      </div>
    </section>
  )
}
