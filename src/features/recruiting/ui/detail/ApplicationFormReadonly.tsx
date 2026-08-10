import { cn } from "@/shared/lib/utils"

import { ReadonlyAnswerField } from "./ReadonlyAnswerField"

import type { ApplicationSection } from "../../model/applicationDetail"

interface ApplicationFormReadonlyProps {
  sections: ApplicationSection[]
  className?: string
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0")
}

export function ApplicationFormReadonly({
  sections,
  className,
}: ApplicationFormReadonlyProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {sections.map((section) => (
        <section key={section.sectionId} className="flex flex-col gap-6">
          <h3
            className={cn(
              "text-heading-6-semibold rounded-[10px] px-5 py-3",
              section.type === "common"
                ? "bg-teal-100 text-teal-700"
                : "bg-teal-50 text-teal-600",
            )}
          >
            {section.title}
          </h3>
          <div className="flex flex-col gap-6 px-1">
            {section.questions.map((question, index) => (
              <ReadonlyAnswerField
                key={question.questionId}
                question={question}
                index={padIndex(index)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
