import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { RecruitmentStepper } from "@/features/recruiting"

export const Route = createFileRoute("/test/recruitment-stepper")({
  component: RecruitmentStepperTestPage,
})

function RecruitmentStepperTestPage() {
  const [step, setStep] = useState(1)

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        RecruitmentStepper Test Page
      </h1>

      <div className="w-115 max-w-full">
        <RecruitmentStepper step={step} onStepChange={setStep} />
      </div>

      <p className="text-body-2-regular text-teal-gray-600 mt-6">
        현재 단계: {step}
      </p>
    </main>
  )
}
