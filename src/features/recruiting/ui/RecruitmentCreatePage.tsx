import { useRef, useState } from "react"

import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { RecruitmentAnnouncementForm } from "./create/RecruitmentAnnouncementForm"
import { RecruitmentBasicInfoForm } from "./create/RecruitmentBasicInfoForm"
import { RecruitmentQuestionForm } from "./create/RecruitmentQuestionForm"
import { RecruitmentStepper } from "./RecruitmentStepper"

export function RecruitmentCreatePage() {
  const [step, setStep] = useState(1)
  const stepperRef = useRef<HTMLDivElement>(null)

  const moveToStep = (target: number) => {
    setStep(target)
    requestAnimationFrame(() => {
      stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  return (
    <div className="flex w-full max-w-286.5 flex-col">
      <PageLabel
        breadcrumb={[
          { id: "recruiting", label: "리크루팅" },
          { id: "recruitment-management", label: "모집 관리" },
          { id: "recruitment-create", label: "모집 생성" },
        ]}
        title="모집 생성"
        description="모집 공고를 만들고 공개할 준비를 합니다."
        className="pl-3"
      />

      <div ref={stepperRef}>
        <RecruitmentStepper
          step={step}
          onStepChange={moveToStep}
          className="mt-8"
        />
      </div>

      {step === 1 && <RecruitmentBasicInfoForm onNext={() => moveToStep(2)} />}
      {step === 2 && (
        <RecruitmentQuestionForm
          onPrev={() => moveToStep(1)}
          onNext={() => moveToStep(3)}
        />
      )}
      {step === 3 && (
        <RecruitmentAnnouncementForm onPrev={() => moveToStep(2)} />
      )}
    </div>
  )
}
