import { zodResolver } from "@hookform/resolvers/zod"
import { useBlocker } from "@tanstack/react-router"
import { ExternalLink } from "lucide-react"
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
  defaultApplyValue,
  hasPendingUpload,
  resolveEnabledSectionIds,
  toDirtySnapshot,
} from "../../model/applyForm"
import { ApplyAnswerField } from "./ApplyAnswerField"

import type { Resolver } from "react-hook-form"

import type { ApplicationSection } from "../../model/applicationDetail"

type ApplyModalKind = "draftSaved" | "leave" | "submitConfirm" | "complete"

interface RecruitingApplyFormProps {
  config: ApplyFormConfig
  initialValues?: Partial<Record<string, ApplyAnswerValue>>
  // 지망·이름·이메일은 Form 문항이 아니라 지원서 필드다. 실제 연동 화면은
  // 폼 밖에서 받아 내려 주고, 목업 화면은 이름 문항에서 뽑던 기존 방식을 쓴다.
  applicantName?: string
  applicationKey?: string
  onSaveDraft?: (values: Record<string, ApplyAnswerValue>) => Promise<void>
  onSubmit?: (values: Record<string, ApplyAnswerValue>) => Promise<void>
  // 폼 밖 입력(이름·이메일·지망)을 확인 모달을 열기 전에 검사한다. 모달 안에서
  // 막으면 토스트만 뜨고 모달은 열린 채 남는다.
  canSubmit?: () => boolean
  isSaving?: boolean
  isSubmitting?: boolean
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
  applicantName: applicantNameProp,
  applicationKey,
  onSaveDraft,
  onSubmit,
  canSubmit,
  isSaving = false,
  isSubmitting = false,
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
  const snapshotRef = useRef(toDirtySnapshot(defaultValues))

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

  // 지망을 바꾸면 서버가 다른 문항 구조를 내려준다. 폼을 다시 세우거나 reset 하지
  // 않는다 — reset 은 필드 레지스트리를 비워 이미 떠 있는 문항의 입력을 조용히
  // 버린다. 새 문항은 Controller 가 defaultValue 로 스스로 등록하고, 구조 밖으로
  // 밀려난 답변은 RHF 가 그대로 들고 있다(shouldUnregister 기본값 false).
  // 지망을 되돌리면 되살아나고, 제출 페이로드에서만 걸러진다.
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

  const isUploading = hasPendingUpload(watchedValues, config.sections)

  const schema = useMemo(
    () => buildRecruitingAnswersSchema(config.sections, enabledSectionIds),
    [config.sections, enabledSectionIds],
  )

  useEffect(() => {
    schemaRef.current = schema
  }, [schema])

  const isDirtyNow = () => toDirtySnapshot(getValues()) !== snapshotRef.current

  const {
    proceed: proceedLeave,
    reset: resetLeave,
    status: leaveStatus,
  } = useBlocker({
    shouldBlockFn: () => isDirtyNow(),
    withResolver: true,
  })

  const applicantName = (() => {
    if (applicantNameProp?.trim()) return applicantNameProp.trim()
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

  // 저장이 실패하면 스냅샷을 갱신하지 않는다. 갱신해 버리면 서버에 없는 내용을
  // 저장된 것으로 보고 이탈 경고까지 사라진다. 실패 안내는 호출부가 띄운다.
  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      try {
        await onSaveDraft(getValues())
      } catch {
        return
      }
    }
    snapshotRef.current = toDirtySnapshot(getValues())
    setOpenModal("draftSaved")
  }

  const handleConfirmSubmit = async () => {
    if (onSubmit) {
      try {
        await onSubmit(getValues())
      } catch {
        return
      }
    }
    snapshotRef.current = toDirtySnapshot(getValues())
    setOpenModal("complete")
  }

  const handleExit = () => {
    snapshotRef.current = toDirtySnapshot(getValues())
    setOpenModal(null)
    onExit?.()
  }

  const handleViewApplication = () => {
    snapshotRef.current = toDirtySnapshot(getValues())
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
        <div className="flex items-start justify-between gap-4">
          <p className="text-body-1-regular text-teal-gray-700 min-w-0 flex-1 whitespace-pre-wrap">
            {config.recruitment.notice}
          </p>
          {config.recruitment.noticeUrl && (
            <a
              href={config.recruitment.noticeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="모집 공고 원문 열기"
              className="text-teal-gray-400 hover:text-teal-gray-600 shrink-0 transition-colors"
            >
              <ExternalLink className="size-5" />
            </a>
          )}
        </div>
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
                      defaultValue={defaultApplyValue(question)}
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
            disabled={isSaving || isSubmitting || isUploading}
            onClick={() => void handleSaveDraft()}
          >
            {isSaving ? "저장 중..." : "임시저장 후 나가기"}
          </Button>
          <Button
            type="button"
            size="xl"
            className="w-50"
            disabled={isSaving || isSubmitting || isUploading}
            onClick={submitWithValidation(() => {
              if (canSubmit && !canSubmit()) return
              setOpenModal("submitConfirm")
            })}
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
            <span className="text-teal-600">{applicationKey}</span>
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
        // 연타하면 저장·제출이 겹쳐 돌아 한쪽은 완료 모달을, 다른 쪽은 실패
        // 토스트를 띄운다.
        confirmLoading={isSaving || isSubmitting}
        onOpenChange={(open) => {
          if (!open) setOpenModal(null)
        }}
        onCancel={() => setOpenModal(null)}
        onConfirm={() => void handleConfirmSubmit()}
      />

      <CtaModal
        open={openModal === "complete"}
        variant="success"
        title="제출 완료"
        content={
          <span className="whitespace-pre-line">
            {applicantName}님의 지원 번호는{" "}
            <span className="text-teal-600">{applicationKey}</span>
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
