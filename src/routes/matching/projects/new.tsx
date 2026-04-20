import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import {
  ApplicationForm,
  BasicInfoForm,
  RecruitInfoForm,
  Stepper,
} from "@/features/project/register"

export const Route = createFileRoute("/matching/projects/new")({
  component: ProjectRegisterPage,
})

function ProjectRegisterPage() {
  const [step, setStep] = useState(1)

  return (
    <section className="flex w-full flex-col items-start justify-start pt-10">
      <div className="border-teal-gray-150 flex h-full min-w-242 flex-col gap-2.5 rounded-[12px] border bg-white px-8.5 py-8">
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
        {step === 2 && <RecruitInfoForm />}
        {step === 3 && <ApplicationForm />}
      </div>
    </section>
  )
}
