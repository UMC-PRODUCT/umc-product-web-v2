import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import SideBar from "@/components/common/sidebar/SideBar"
import { ApplicationForm } from "@/features/project-register/components/ApplicationForm"
import { BasicInfoForm } from "@/features/project-register/components/BasicInfoForm"
import { RecruitInfoForm } from "@/features/project-register/components/RecruitInfoForm"
import { Stepper } from "@/features/project-register/components/Stepper/Stepper"

export const Route = createFileRoute("/test/stepper")({
  component: StepperTestPage,
})

function StepperTestPage() {
  const [step, setStep] = useState(1)

  return (
    <main className="h-full min-h-screen w-full">
      <div className="bg-teal-gray-100 flex h-18 w-full items-center pl-10">
        Stepper Test Page
      </div>
      <div className="flex w-full">
        <SideBar className="flex-1" />
        <section className="flex w-full flex-col items-start justify-start gap-8 px-8.5 pt-14.5">
          <div className="h-25 w-full">페이지 제목 & 세그먼트 영역</div>
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
      </div>
    </main>
  )
}
