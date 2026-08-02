import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  toApplicationSections,
  useAnonymousApplicationQuery,
} from "@/features/recruiting"
import { ReadonlyAnswerField } from "@/features/recruiting/ui/detail/ReadonlyAnswerField"
import { Button } from "@/shared/ui/Button"

import type {
  RecruitingApplicationAnswer,
  RecruitingFormStructure,
  RecruitingPublicApplicationAnswer,
  RecruitingTrack,
} from "@/features/recruiting"
import type { ApplicationSection } from "@/features/recruiting/model/applicationDetail"

export const Route = createFileRoute("/projects/application/$applicationId")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isVerified = sessionStorage.getItem("isApplicationVerified")
      if (isVerified !== "true") {
        throw redirect({ to: "/projects/application" })
      }
    }
  },
  component: ApplicationDetailPage,
})

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

function toApplicationSectionsFromPublicAnswers(
  answers?: RecruitingPublicApplicationAnswer[],
  formStructure?: RecruitingFormStructure,
  choices?: { firstChoice?: RecruitingTrack; secondChoice?: RecruitingTrack },
): ApplicationSection[] {
  if (formStructure) {
    const adaptedAnswers: RecruitingApplicationAnswer[] = (answers ?? []).map(
      (ans) => ({
        questionId: String(ans.questionId ?? ""),
        textValue: ans.textValue ?? null,
        selectedOptionIds: (ans.selectedOptionIds ?? []).map(String),
        fileIds: ans.fileIds ?? [],
        times: ans.times ?? [],
      }),
    )
    return toApplicationSections(formStructure, adaptedAnswers, {
      firstChoice: (choices?.firstChoice ?? null) as unknown as RecruitingTrack,
      secondChoice: choices?.secondChoice ?? null,
    })
  }

  if (!answers || answers.length === 0) return []

  const questions = answers.map((ans, idx) => ({
    questionId: String(ans.questionId ?? idx + 1),
    title: `질문 ${idx + 1}`,
    description: undefined,
    type: (ans.times && ans.times.length > 0
      ? "schedule"
      : ans.fileIds && ans.fileIds.length > 0
        ? "file"
        : ans.selectedOptionIds && ans.selectedOptionIds.length > 0
          ? "checkbox"
          : "shortText") as ApplicationSection["questions"][number]["type"],
    required: false,
    orderNo: idx + 1,
    options: [],
    selectedOptionIds: (ans.selectedOptionIds ?? []).map(String),
    textValue: ans.textValue ?? null,
    files: (ans.fileIds ?? []).map((id) => ({
      fileId: String(id),
      name: `첨부파일_${id}`,
      url: null,
    })),
    times: ans.times ?? [],
  }))

  return [
    {
      sectionId: "1",
      type: "common",
      title: "지원서 답변 항목",
      questions,
    },
  ]
}

function ApplicationDetailPage() {
  const navigate = useNavigate()
  const { applicationId } = Route.useParams()

  const email =
    typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousEmail")
      : null
  const applicationKey =
    typeof window !== "undefined"
      ? sessionStorage.getItem("anonymousApplicationKey")
      : null

  const { data, isLoading } = useAnonymousApplicationQuery(
    email,
    applicationKey,
  )

  const appInfo = useMemo(() => {
    if (!data || data.cancelled) return null
    return {
      name: data.applicantName
        ? `${data.applicantName}님의 지원서`
        : "익명 지원서",
      submittedAt: data.submitted ? "제출 완료" : null,
      isClosed: !data.editable,
    }
  }, [data])

  const applicationDetail = useMemo(() => {
    if (!data) return null
    return {
      sections: toApplicationSectionsFromPublicAnswers(
        data.answers,
        data.formStructure,
        { firstChoice: data.firstChoice, secondChoice: data.secondChoice },
      ),
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-body-1-medium text-teal-gray-600">
          지원서 정보를 불러오는 중입니다...
        </p>
      </div>
    )
  }

  const isIdMismatch =
    data?.applicationId == null || String(data.applicationId) !== applicationId

  if (!appInfo || !data || isIdMismatch) {
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
      <div className="flex w-full flex-col">
        <FolderTabHeader
          title={appInfo.name}
          school={data.applicantEmail ?? "지원자 정보"}
        />
        <div className="shadow-drop-neutral-2 flex flex-col gap-9 rounded-b-[17px] border-x border-b border-teal-100 bg-white px-11.5 pt-9 pb-12">
          <div className="flex flex-col gap-1.5 border-b border-teal-50 pb-5">
            <h2 className="text-heading-6-semibold text-teal-gray-900">
              {appInfo.name} 지원서 조회
            </h2>
            <p className="text-body-2-regular text-teal-gray-600">
              {appInfo.submittedAt ? (
                <>
                  제출 상태:{" "}
                  <span className="font-medium text-teal-600">
                    {appInfo.submittedAt}
                  </span>
                </>
              ) : (
                <span className="text-error-600">
                  아직 미제출 상태의 지원서입니다.
                </span>
              )}
            </p>
          </div>
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
    </div>
  )
}
