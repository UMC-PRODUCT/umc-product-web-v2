import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"

import { RecruitingApplyForm } from "@/features/recruiting"
import { getApplicationDetailMock } from "@/features/recruiting/model/applicationDetail.mock"
import {
  RECRUITING_APPLY_CODE_MOCK,
  RECRUITING_APPLY_FORM_MOCK,
} from "@/features/recruiting/model/applyForm.mock"
import { ReadonlyAnswerField } from "@/features/recruiting/ui/detail/ReadonlyAnswerField"
import { Button } from "@/shared/ui/Button"

import type { ApplicationSection } from "@/features/recruiting/model/applicationDetail"
import type { ApplyAnswerValue } from "@/features/recruiting/model/applyForm"

export const Route = createFileRoute("/projects/application/$applicationId")({
  component: ApplicationDetailPage,
})

const dummyApplications = [
  {
    id: 1,
    name: "한양대학교 ERICA UMC 11기 정규 모집",
    submittedAt: "2026-07-11 23:35",
    result: "fail",
    roles: ["plan"],
    isClosed: true,
    period: "2026-06-15 00:00 ~ 2026-07-11 23:59",
  },
  {
    id: 2,
    name: "한양대학교 ERICA UMC 11기 2차 추가 모집",
    submittedAt: null,
    updatedAt: "2026-07-12 14:22",
    result: null,
    roles: ["design", "mobile-pe"],
    isClosed: true,
    period: "2026-07-12 00:00 ~ 2026-07-15 23:59",
  },
  {
    id: 3,
    name: "한양대학교 ERICA UMC 11기 3차 추가 모집",
    submittedAt: null,
    updatedAt: "2026-07-20 10:15",
    result: null,
    roles: ["web-pe", "plan"],
    isClosed: false,
    dDay: 10,
    period: "2026-07-16 00:00 ~ 2026-07-31 23:59",
  },
  {
    id: 4,
    name: "한양대학교 ERICA UMC 11기 4차 추가 모집",
    submittedAt: "2026-08-05 14:20",
    result: "pass",
    roles: ["springboot", "nodejs"],
    isClosed: true,
    period: "2026-08-01 00:00 ~ 2026-08-05 23:59",
  },
]

function FolderTabHeader({ title, school }: { title: string; school: string }) {
  return (
    <div className="flex items-end">
      <div
        className="flex h-21 w-113.5 shrink-0 items-center gap-5 bg-teal-100 pt-3 pb-2.5 pl-4"
        style={{
          clipPath: "polygon(0 0, calc(100% - 62px) 0, 100% 100%, 0 100%)",
          borderTopLeftRadius: 17,
        }}
      >
        <div className="text-heading-7-semibold flex size-12.5 shrink-0 items-center justify-center rounded-[8px] bg-white text-teal-600">
          {school.slice(0, 1)}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-heading-6-semibold text-teal-gray-800 truncate">
            {title}
          </span>
          <span className="text-body-2-medium text-teal-gray-600 truncate">
            {school}
          </span>
        </div>
      </div>
      <div className="h-2.5 min-w-0 flex-1 rounded-tr-[17px] bg-teal-100" />
    </div>
  )
}

function ReadonlyFormSection({
  section,
  renderQuestion,
}: {
  section: ApplicationSection
  renderQuestion: (
    question: ApplicationSection["questions"][number],
    index: number,
  ) => React.ReactNode
}) {
  return (
    <section className="flex flex-col">
      <h3 className="text-heading-7-semibold rounded-t-[12px] border-x border-t border-teal-300 bg-teal-100 py-2 pr-5 pl-7.5 text-teal-600">
        {section.title}
      </h3>
      <div className="flex flex-col gap-8 rounded-b-[12px] border-x border-b border-teal-300 bg-white px-5 py-8.5">
        {section.questions.map((question, index) =>
          renderQuestion(question, index),
        )}
      </div>
    </section>
  )
}

// ApplicationSection[] 으로부터 RecruitingApplyForm 에 전달할 initialValues 를 추출하는 헬퍼 함수
function getInitialValues(
  sections: ApplicationSection[],
): Record<string, ApplyAnswerValue> {
  const values: Record<string, ApplyAnswerValue> = {}
  sections.forEach((section) => {
    section.questions.forEach((question) => {
      if (question.type === "checkbox") {
        values[question.questionId] = question.selectedOptionIds
      } else if (question.type === "radio" || question.type === "dropdown") {
        values[question.questionId] = question.selectedOptionIds[0] ?? ""
      } else if (question.type === "portfolio") {
        if (question.textValue) {
          values[question.questionId] = {
            kind: "link",
            url: question.textValue,
          }
        } else {
          const firstFile = question.files[0]
          if (firstFile) {
            values[question.questionId] = {
              kind: "file",
              name: firstFile.name,
            }
          } else {
            values[question.questionId] = null
          }
        }
      } else if (question.type === "file") {
        const firstFile = question.files[0]
        if (firstFile) {
          values[question.questionId] = { name: firstFile.name }
        } else {
          values[question.questionId] = null
        }
      } else {
        values[question.questionId] = question.textValue ?? ""
      }
    })
  })
  return values
}

function ApplicationDetailPage() {
  const params = Route.useParams() as Record<string, string>
  const applicationId = params.applicationId
  const navigate = useNavigate()

  // 1. 해당 지원서의 메타 정보를 찾습니다.
  const appInfo = useMemo(() => {
    return dummyApplications.find((app) => String(app.id) === applicationId)
  }, [applicationId])

  // 2. Mock 데이터를 통해 상세 질문과 답변 목록을 가져옵니다.
  const applicationDetail = useMemo(() => {
    if (!applicationId) return null
    return getApplicationDetailMock(applicationId)
  }, [applicationId])

  // 3. 읽기 전용 상태인지 판별합니다 (제출 완료되었거나 모집이 마감된 경우)
  const isReadOnly = appInfo ? !!appInfo.submittedAt || appInfo.isClosed : true

  // 4. 수정 모드일 때 필요한 initialValues 를 계산합니다.
  const initialValues = useMemo(() => {
    if (isReadOnly || !applicationDetail) return {}
    return getInitialValues(applicationDetail.sections)
  }, [isReadOnly, applicationDetail])

  if (!appInfo) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-body-1-medium text-teal-gray-600">
          존재하지 않거나 삭제된 지원서입니다.
        </p>
        <Button
          variant="fill"
          color="neutral"
          size="m"
          onClick={() => navigate({ to: "/projects/application/list" })}
        >
          내 지원서 목록으로 이동
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-265">
      {isReadOnly ? (
        <div className="flex w-full flex-col">
          <FolderTabHeader
            title={RECRUITING_APPLY_FORM_MOCK.recruitment.title}
            school={RECRUITING_APPLY_FORM_MOCK.recruitment.school}
          />
          <div className="shadow-drop-neutral-2 flex flex-col gap-9 rounded-b-[17px] border-x border-b border-teal-100 bg-white px-11.5 pt-9 pb-12">
            <div className="flex flex-col gap-1.5 border-b border-teal-50 pb-5">
              <h2 className="text-heading-6-semibold text-teal-gray-900">
                {appInfo.name} 지원서 조회
              </h2>
              <p className="text-body-2-regular text-teal-gray-600">
                {appInfo.submittedAt ? (
                  <>
                    제출 일시:{" "}
                    <span className="font-medium text-teal-600">
                      {appInfo.submittedAt}
                    </span>
                  </>
                ) : (
                  <span className="text-error-600">
                    모집 마감으로 인해 미제출 상태로 종료되었습니다.
                  </span>
                )}
              </p>
            </div>
            <p className="text-body-1-regular text-teal-gray-700 whitespace-pre-wrap">
              {RECRUITING_APPLY_FORM_MOCK.recruitment.notice}
            </p>
            <div className="flex flex-col gap-8">
              {applicationDetail?.sections.map((section) => (
                <ReadonlyFormSection
                  key={section.sectionId}
                  section={section}
                  renderQuestion={(question, index) => (
                    <ReadonlyAnswerField
                      key={question.questionId}
                      question={question}
                      index={String(index + 1).padStart(2, "0")}
                    />
                  )}
                />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="weak"
                color="neutral"
                size="xl"
                className="w-50"
                onClick={() => navigate({ to: "/projects/application/list" })}
              >
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <RecruitingApplyForm
          config={RECRUITING_APPLY_FORM_MOCK}
          applicationKey={RECRUITING_APPLY_CODE_MOCK}
          initialValues={initialValues}
          onExit={() => navigate({ to: "/projects/application/list" })}
          onViewApplication={() =>
            navigate({ to: "/projects/application/list" })
          }
        />
      )}
    </div>
  )
}
