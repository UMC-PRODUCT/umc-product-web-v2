import { zodResolver } from "@hookform/resolvers/zod"
import { useBlocker } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { CtaModal } from "@/shared/ui/modal/CtaModal"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

import {
  type ApplyAnswerValue,
  type ApplyFormConfig,
  buildDefaultApplyValues,
  buildRecruitingAnswersSchema,
  resolveEnabledSectionIds,
} from "../../model/applyForm"
import { RECRUITING_APPLY_CODE_MOCK } from "../../model/applyForm.mock"
import { ApplyAnswerField } from "./ApplyAnswerField"

import type { Resolver } from "react-hook-form"

import type { ApplicationSection } from "../../model/applicationDetail"

type ApplyModalKind = "draftSaved" | "leave" | "submitConfirm" | "complete"

interface RecruitingApplyFormProps {
  config: ApplyFormConfig
  initialValues?: Partial<Record<string, ApplyAnswerValue>>
  onExit?: () => void
  onViewApplication?: () => void
  className?: string
}

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

function FormSection({
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

export function RecruitingApplyForm({
  config,
  initialValues,
  onExit,
  onViewApplication,
  className,
}: RecruitingApplyFormProps) {
  const addToast = useToastStore((state) => state.addToast)
  const [openModal, setOpenModal] = useState<ApplyModalKind | null>(null)

  const defaultValues = useMemo(
    () => ({
      ...buildDefaultApplyValues(config.sections),
      ...initialValues,
    }),
    [config.sections, initialValues],
  )
  const snapshotRef = useRef(JSON.stringify(defaultValues))

  const schemaRef = useRef(
    buildRecruitingAnswersSchema(
      config.sections,
      resolveEnabledSectionIds(config, defaultValues),
    ),
  )
  const resolverRef = useRef<Resolver<Record<string, ApplyAnswerValue>>>(
    (values, context, options) =>
      (
        zodResolver(schemaRef.current) as Resolver<
          Record<string, ApplyAnswerValue>
        >
      )(values, context, options),
  )

  const { control, getValues, handleSubmit } = useForm<
    Record<string, ApplyAnswerValue>
  >({
    resolver: resolverRef.current,
    mode: "onChange",
    defaultValues,
  })

  const watchedValues = useWatch({ control })

  const enabledSectionIds = useMemo(
    () =>
      resolveEnabledSectionIds(config, {
        ...defaultValues,
        ...watchedValues,
      }),
    [config, defaultValues, watchedValues],
  )

  const visibleSections = config.sections.filter((section) =>
    enabledSectionIds.has(section.sectionId),
  )

  const schema = useMemo(
    () => buildRecruitingAnswersSchema(config.sections, enabledSectionIds),
    [config.sections, enabledSectionIds],
  )

  useEffect(() => {
    schemaRef.current = schema
  }, [schema])

  const isDirtyNow = () => JSON.stringify(getValues()) !== snapshotRef.current

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveStatus,
  } = useBlocker({
    shouldBlockFn: () => isDirtyNow(),
    withResolver: true,
  })

  const applicantName = (() => {
    const raw = config.nameQuestionId
      ? getValues()[config.nameQuestionId]
      : null
    return typeof raw === "string" && raw.trim() ? raw.trim() : "지원자"
  })()

  const submitWithValidation = (onValid: () => void) =>
    handleSubmit(
      () => onValid(),
      (errors) => handleInvalid(errors),
    )

  const handleInvalid = (
    errors: Record<string, { message?: string } | undefined>,
  ) => {
    const firstQuestionId = config.sections
      .filter((section) => enabledSectionIds.has(section.sectionId))
      .flatMap((section) => section.questions)
      .find((question) => errors[question.questionId])?.questionId
    addToast({
      message: "필수 항목을 확인해 주세요.",
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    if (firstQuestionId) {
      document
        .querySelector(`[data-question-id="${firstQuestionId}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleSaveDraft = () => {
    snapshotRef.current = JSON.stringify(getValues())
    setOpenModal("draftSaved")
  }

  const handleExit = () => {
    snapshotRef.current = JSON.stringify(getValues())
    setOpenModal(null)
    onExit?.()
  }

  const handleViewApplication = () => {
    snapshotRef.current = JSON.stringify(getValues())
    setOpenModal(null)
    ;(onViewApplication ?? onExit)?.()
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <FolderTabHeader
        title={config.recruitment.title}
        school={config.recruitment.school}
      />
      <div className="flex flex-col gap-9 rounded-b-[17px] border-x border-b border-teal-100 bg-white px-11.5 pt-9 pb-12">
        <p className="text-body-1-regular text-teal-gray-700 whitespace-pre-wrap">
          {config.recruitment.notice}
        </p>
        <div className="flex flex-col gap-8">
          {visibleSections.map((section) => (
            <FormSection
              key={section.sectionId}
              section={section}
              renderQuestion={(question, index) => (
                <div
                  key={question.questionId}
                  data-question-id={question.questionId}
                  className="flex flex-col gap-3 px-1"
                >
                  <QuestionItemTitle
                    index={String(index + 1).padStart(2, "0")}
                    title={question.title}
                    caption={question.description}
                    required={question.required}
                  />
                  <div className="pl-8.5">
                    <Controller
                      control={control}
                      name={question.questionId}
                      render={({ field, fieldState }) => (
                        <ApplyAnswerField
                          question={question}
                          value={field.value ?? null}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="weak"
            color="neutral"
            size="xl"
            className="w-50"
            onClick={handleSaveDraft}
          >
            임시저장 후 나가기
          </Button>
          <Button
            type="button"
            size="xl"
            className="w-50"
            onClick={submitWithValidation(() => setOpenModal("submitConfirm"))}
          >
            제출하기
          </Button>
        </div>
      </div>

      <CtaModal
        open={openModal === "draftSaved"}
        variant="success"
        title="지원서가 임시저장되었습니다"
        content={
          <span className="whitespace-pre-line">
            {applicantName}님의 지원 코드는{" "}
            <span className="text-teal-600">{RECRUITING_APPLY_CODE_MOCK}</span>
            입니다.
            {"\n"}
            <span className="underline underline-offset-2">내 지원서</span>에서
            이어서 작성할 수 있습니다.
            {"\n"}마감 전까지 제출을 완료해 주세요.
            {"\n\n"}이메일과 지원 코드를 알면 누구나 지원서를 확인하고 수정할 수
            있습니다.
            {"\n"}지원 코드가 다른 사람에게 보이지 않도록 주의해 주세요.
          </span>
        }
        cancelText="계속 작성하기"
        confirmText="나가기"
        onOpenChange={(open) => {
          if (!open) setOpenModal(null)
        }}
        onCancel={() => setOpenModal(null)}
        onConfirm={handleExit}
      />

      <CtaModal
        open={leaveStatus === "blocked"}
        variant="warning"
        title="페이지를 나가시겠습니까?"
        content={
          <span className="whitespace-pre-line">
            작성 중인 내용이 있습니다.
            {"\n"}페이지를 나가면 저장하지 않은 내용은 사라집니다.
          </span>
        }
        cancelText="계속 작성하기"
        confirmText="나가기"
        onOpenChange={(open) => {
          if (!open) resetLeave?.()
        }}
        onCancel={() => resetLeave?.()}
        onConfirm={() => proceedLeave?.()}
      />

      <CtaModal
        open={openModal === "submitConfirm" && leaveStatus !== "blocked"}
        variant="warning"
        title="지원서를 제출할까요?"
        content={
          <span className="whitespace-pre-line">
            제출 후에도 모집 마감 전까지 수정할 수 있습니다.
            {"\n"}마감 전 마지막으로 저장한 내용이 최종 반영됩니다.
          </span>
        }
        cancelText="계속 작성하기"
        confirmText="제출하기"
        onOpenChange={(open) => {
          if (!open) setOpenModal(null)
        }}
        onCancel={() => setOpenModal(null)}
        onConfirm={() => {
          snapshotRef.current = JSON.stringify(getValues())
          setOpenModal("complete")
        }}
      />

      <CtaModal
        open={openModal === "complete"}
        variant="success"
        title="제출 완료"
        content={
          <span className="whitespace-pre-line">
            {applicantName}님의 지원 번호는{" "}
            <span className="text-teal-600">{RECRUITING_APPLY_CODE_MOCK}</span>
            입니다.
            {"\n"}발급된 번호로{" "}
            <span className="underline underline-offset-2">내 지원서</span>{" "}
            페이지에서 모집 마감 전까지 수정할 수 있습니다.
            {"\n\n"}지원 코드와 향후 합격 여부를 포함한 모든 모집 안내는 입력한
            이메일로 보내드리니, 모집 기간 동안 이메일 수신함을 자주 확인해
            주시기 바랍니다.
            {"\n\n"}지원해 주셔서 감사합니다!
          </span>
        }
        cancelText="나가기"
        confirmText="내 지원서 확인하기"
        cancelOnDismiss={false}
        onOpenChange={(open) => {
          if (!open) setOpenModal(null)
        }}
        onCancel={handleExit}
        onConfirm={handleViewApplication}
      />
    </div>
  )
}
