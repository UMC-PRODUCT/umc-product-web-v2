import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { Controller, useForm } from "react-hook-form"

import { useToastStore } from "@/components/toast/useToastStore"
import { useResourcePermission } from "@/features/auth/hooks/useResourcePermission"
import { uploadFileFlow } from "@/features/project/new/api/storage"
import { trackEvent } from "@/shared/analytics"
import { getActiveGisu } from "@/shared/api/gisu"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { Button } from "@/shared/ui/Button"
import { RecruitStatusChip } from "@/shared/ui/chip/RecruitStatusChip"
import { FormHeader } from "@/shared/ui/FormHeader"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { RadioList } from "@/shared/ui/input/radio/RadioList"
import MemberCount from "@/shared/ui/MemberCount"
import { Modal } from "@/shared/ui/Modal"
import { FileUploadField } from "@/shared/ui/question-field/FileUploadField"
import {
  PortfolioField,
  type PortfolioValue,
} from "@/shared/ui/question-field/PortfolioField"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"
import { TextQuestionField } from "@/shared/ui/question-field/TextQuestionField"

import {
  createApplicationDraft,
  getApplicationDetail,
  getMyApplications,
  saveApplicationDraft,
  submitApplication,
} from "../../api/matchingProject"
import {
  type ApplyAnswerValue,
  buildAnswerPayload,
  getOptionValue,
  isApplyPortfolioValue,
  isUploadedFileValue,
} from "../../model/applyAnswerPayload"
import { buildFormValuesFromDetail } from "../../model/applyDraftHydration"
import {
  buildApplyAnswersSchema,
  defaultByFieldType,
  type UploadedFileValue,
} from "../../model/applyValidation"
import { isRecruitDone } from "../../model/matchingProject"
import { selectCurrentApplicationForProject } from "../../model/projectDetailCta"
import { ApplyFormSkeleton } from "./ApplyFormSkeleton"
import { ApplyProjectTitleCard } from "./ApplyProjectTitleCard"

import type { FieldErrors, Resolver } from "react-hook-form"

import type {
  Question,
  Section,
} from "@/features/project/new/model/applicationQuestion"

import type { MyProjectApplicationResponse } from "../../api/matchingProject"
import type { MatchingProject } from "../../model/matchingProject"

const FILE_UPLOAD_CATEGORY = "POST_ATTACHMENT" as const
const PORTFOLIO_UPLOAD_CATEGORY = "PORTFOLIO" as const

const FILE_ACCEPT = ".pdf,.docx,.zip"
const FILE_ALLOWED_LABEL = "PDF, DOCX, ZIP"
const PORTFOLIO_ALLOWED_LABEL = "PDF"

const OPTION_LIST_CLASS =
  "border-teal-gray-150 flex flex-col gap-0.5 rounded-[12px] border bg-[color-mix(in_srgb,var(--color-teal-50)_40%,white)] p-1"
const COMMON_SECTION_ID = "common"

function extractUploadErrorMessage(
  err: unknown,
  fallback: string,
  allowedLabel: string,
): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { code?: string; message?: string }
      | undefined
    if (data?.code === "STORAGE-0004") {
      const base = data.message ?? "허용되지 않는 파일 확장자입니다."
      return `${base} (허용 확장자: ${allowedLabel})`
    }
    if (data?.message) return data.message
  }
  return fallback
}

function FileAnswerField({
  value,
  onChange,
  onUploadError,
  onUploadingChange,
  error,
}: {
  value: UploadedFileValue | null
  onChange: (v: UploadedFileValue | null) => void
  onUploadError: (message: string) => void
  onUploadingChange?: (uploading: boolean) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleSelect(file: File) {
    setIsUploading(true)
    onUploadingChange?.(true)
    try {
      const { fileId } = await uploadFileFlow(file, FILE_UPLOAD_CATEGORY)
      onChange({ fileId, fileName: file.name })
    } catch (err) {
      onUploadError(
        extractUploadErrorMessage(
          err,
          "파일 업로드에 실패했습니다. 다시 시도해 주세요.",
          FILE_ALLOWED_LABEL,
        ),
      )
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={FILE_ACCEPT}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          void handleSelect(file)
          e.target.value = ""
        }}
      />
      <FileUploadField
        fileName={isUploading ? "업로드 중..." : (value?.fileName ?? null)}
        onUpload={() => inputRef.current?.click()}
        onDelete={() => onChange(null)}
        error={error}
      />
    </>
  )
}

async function uploadPortfolioFile(
  file: File,
): Promise<{ fileId: string; fileName: string }> {
  const { fileId } = await uploadFileFlow(file, PORTFOLIO_UPLOAD_CATEGORY)
  return { fileId, fileName: file.name }
}

interface ProjectApplyModalProps {
  data: MatchingProject
  projectId: number
  matchingRoundId: number
  sections: Section[]
  canToggleSection?: boolean
  onBack: () => void
  onDraftSaved?: () => void
  onSubmitSuccess: () => void
  initialApplicationId?: number
}

export interface ProjectApplyModalHandle {
  requestClose: () => void
}

export const ProjectApplyModal = forwardRef<
  ProjectApplyModalHandle,
  ProjectApplyModalProps
>(function ProjectApplyModal(
  {
    data,
    projectId,
    matchingRoundId,
    sections,
    canToggleSection = false,
    onBack,
    onDraftSaved,
    onSubmitSuccess,
    initialApplicationId,
  },
  ref,
) {
  const addToast = useToastStore((s) => s.addToast)
  const isDevMatchingRound = Boolean(import.meta.env.VITE_DEV_MATCHING_ROUND_ID)
  const [sectionEnabled, setSectionEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map((s) => [s.id, s.isEnabled])),
  )
  const [applicationId, setApplicationId] = useState<number | null>(null)
  const [isInitializing, setIsInitializing] = useState(!isDevMatchingRound)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [isPortfolioUploading, setIsPortfolioUploading] = useState(false)
  const portfolioUploadTokenRef = useRef(0)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isSubmitConfirmModalOpen, setIsSubmitConfirmModalOpen] =
    useState(false)
  const pendingFormValuesRef = useRef<Record<string, ApplyAnswerValue> | null>(
    null,
  )
  const draftInitializedRef = useRef(false)
  const applicationEditPermissionQuery = useResourcePermission(
    "PROJECT_APPLICATION",
    applicationId ?? undefined,
    {
      enabled: applicationId !== null && !isDevMatchingRound,
      permissionType: "EDIT",
    },
  )
  const isApplicationEditPermissionLoading =
    applicationId !== null &&
    !isDevMatchingRound &&
    applicationEditPermissionQuery.isPending

  useEffect(() => {
    if (draftInitializedRef.current) return
    draftInitializedRef.current = true
    async function hydrateDraft(id: number) {
      const detail = await getApplicationDetail(projectId, id).catch(() => null)
      if (!detail) return
      const values = buildFormValuesFromDetail(detail, sections)
      reset(values)
      savedSnapshotRef.current = JSON.stringify(values)
    }
    async function initDraft() {
      if (isDevMatchingRound) return
      try {
        if (initialApplicationId != null) {
          setApplicationId(initialApplicationId)
          await hydrateDraft(initialApplicationId)
          return
        }
        const draft = await createApplicationDraft(projectId, matchingRoundId)
        setApplicationId(Number(draft.applicationId))
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 409) {
          const gisu = await getActiveGisu().catch(() => null)
          if (gisu) {
            const apps: MyProjectApplicationResponse[] =
              await getMyApplications(Number(gisu.gisuId), "DRAFT").catch(
                () => [],
              )
            const existing = selectCurrentApplicationForProject({
              applications: apps,
              projectId,
              activeMatchingRoundId: String(matchingRoundId),
            })
            if (existing) {
              const existingId = Number(existing.applicationId)
              setApplicationId(existingId)
              await hydrateDraft(existingId)
            }
          }
          return
        }
        addToast({
          message: "지원서 생성에 실패했습니다. 다시 시도해 주세요.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        onBack()
      } finally {
        setIsInitializing(false)
      }
    }
    void initDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schema = useMemo(
    () => buildApplyAnswersSchema(sections, sectionEnabled),
    [sections, sectionEnabled],
  )

  const defaultValues = useMemo(
    () =>
      Object.fromEntries(
        sections.flatMap((s) =>
          s.questions.map((q) => [q.id, defaultByFieldType(q)]),
        ),
      ),
    [sections],
  )

  const { control, handleSubmit, clearErrors, getValues, reset } = useForm<
    Record<string, ApplyAnswerValue>
  >({
    resolver: zodResolver(schema) as Resolver<Record<string, ApplyAnswerValue>>,
    mode: "onChange",
    defaultValues,
  })

  const savedSnapshotRef = useRef(JSON.stringify(defaultValues))
  const didTrackStartRef = useRef(false)

  useEffect(() => {
    if (didTrackStartRef.current) return
    didTrackStartRef.current = true
    trackEvent("application_form_start", {
      project_id: projectId,
      matching_round_id: matchingRoundId,
      section_count: sections.length,
      question_count: sections.reduce(
        (count, section) => count + section.questions.length,
        0,
      ),
      is_draft_application: initialApplicationId != null,
    })
  }, [projectId, matchingRoundId, sections, initialApplicationId])

  useEffect(() => {
    clearErrors()
  }, [sectionEnabled, clearErrors])

  const questionIndexMap = useMemo(() => {
    const map: Record<string, number> = {}
    sections.forEach((section) => {
      const enabled = sectionEnabled[section.id] ?? section.isEnabled
      if (enabled) {
        section.questions.forEach((q, i) => {
          map[q.id] = i + 1
        })
      }
    })
    return map
  }, [sections, sectionEnabled])

  function handleLeaveConfirm() {
    setIsLeaveModalOpen(false)
    onBack()
  }

  function hasUnsavedChanges() {
    return JSON.stringify(getValues()) !== savedSnapshotRef.current
  }

  function handleBackClick() {
    if (hasUnsavedChanges()) {
      setIsLeaveModalOpen(true)
    } else {
      onBack()
    }
  }

  useImperativeHandle(ref, () => ({ requestClose: handleBackClick }))

  async function handleSaveDraft() {
    if (isDevMatchingRound) {
      trackEvent("application_draft_save_success", {
        project_id: projectId,
        matching_round_id: matchingRoundId,
        is_dev_matching_round: true,
      })
      addToast({
        message: "작성한 내용이 임시 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    if (applicationId === null) {
      addToast({
        message: "지원서 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    setIsSavingDraft(true)
    try {
      const formValues = getValues()
      const answers = buildAnswerPayload(formValues, sections, sectionEnabled)
      await saveApplicationDraft(projectId, applicationId, answers)
      reset(formValues)
      savedSnapshotRef.current = JSON.stringify(formValues)
      trackEvent("application_draft_save_success", {
        project_id: projectId,
        matching_round_id: matchingRoundId,
      })
      onDraftSaved?.()
      addToast({
        message: "작성한 내용이 임시 저장되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch (err) {
      trackEvent("application_draft_save_error", {
        project_id: projectId,
        matching_round_id: matchingRoundId,
        status: err instanceof AxiosError ? err.response?.status : undefined,
      })
      const serverMessage =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined
      addToast({
        message:
          serverMessage ?? "임시 저장에 실패했습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSavingDraft(false)
    }
  }

  function onValid(formValues: Record<string, ApplyAnswerValue>) {
    pendingFormValuesRef.current = formValues
    setIsSubmitConfirmModalOpen(true)
  }

  async function handleSubmitConfirm() {
    const formValues = pendingFormValuesRef.current
    if (!formValues) return
    setIsSubmitConfirmModalOpen(false)
    if (!isDevMatchingRound && applicationId === null) {
      addToast({
        message: "지원서 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      return
    }
    setIsSubmitting(true)
    try {
      if (!isDevMatchingRound && applicationId !== null) {
        const answers = buildAnswerPayload(formValues, sections, sectionEnabled)
        await saveApplicationDraft(projectId, applicationId, answers)
        await submitApplication(projectId, applicationId)
      }
      trackEvent("application_submit_success", {
        project_id: projectId,
        matching_round_id: matchingRoundId,
      })
      setIsCompleteModalOpen(true)
    } catch (err) {
      const status =
        err instanceof AxiosError ? err.response?.status : undefined
      const failedUrl = err instanceof AxiosError ? err.config?.url : undefined
      const serverData =
        err instanceof AxiosError
          ? (err.response?.data as
              | { code?: string; message?: string }
              | undefined)
          : undefined
      console.error("[apply submit] 지원서 제출 실패", {
        status,
        url: failedUrl,
        code: serverData?.code,
        message: serverData?.message,
        error: err,
      })
      trackEvent("application_submit_error", {
        project_id: projectId,
        matching_round_id: matchingRoundId,
        status,
        code: serverData?.code,
      })
      const serverMessage = serverData?.message
      addToast({
        message:
          serverMessage ?? "지원서 제출에 실패했습니다. 다시 시도해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
      pendingFormValuesRef.current = null
    }
  }

  function onInvalid(errs: FieldErrors<Record<string, ApplyAnswerValue>>) {
    const firstId = Object.keys(errs)[0]
    if (!firstId) return
    const fieldType = sections
      .flatMap((section) => section.questions)
      .find((question) => question.id === firstId)?.fieldType
    trackEvent("application_submit_error", {
      project_id: projectId,
      matching_round_id: matchingRoundId,
      reason: "validation",
      error_count: Object.keys(errs).length,
      first_field_type: fieldType,
    })
    const firstEntry = errs[firstId]
    const firstMessage =
      firstEntry &&
      "message" in firstEntry &&
      typeof firstEntry.message === "string"
        ? firstEntry.message
        : "필수 항목을 입력해 주세요."
    addToast({
      message: firstMessage,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
    const questionEl = document.querySelector(`[data-question-id="${firstId}"]`)
    questionEl?.scrollIntoView({ behavior: "smooth", block: "center" })
    const candidates = questionEl?.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]), textarea, button',
    )
    if (candidates) {
      for (const el of Array.from(candidates)) {
        if (el.offsetParent !== null) {
          el.focus()
          break
        }
      }
    }
  }

  function renderAnswerField(
    q: Question,
    value: ApplyAnswerValue,
    onChange: (v: ApplyAnswerValue) => void,
    error?: string,
  ) {
    switch (q.fieldType) {
      case "text":
        return (
          <TextQuestionField
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            maxLength={500}
            error={error}
          />
        )
      case "checkbox":
        return (
          <div className="flex flex-col gap-1">
            <div className={OPTION_LIST_CLASS}>
              {q.options.map((opt, index) => {
                const optionValue = getOptionValue(q, index)
                return (
                  <CheckboxList
                    key={`${optionValue}-${index}`}
                    checked={
                      Array.isArray(value) && value.includes(optionValue)
                    }
                    onChange={(checked) => {
                      const current = Array.isArray(value) ? value : []
                      onChange(
                        checked
                          ? [...current, optionValue]
                          : current.filter((o) => o !== optionValue),
                      )
                    }}
                  >
                    {opt.content}
                  </CheckboxList>
                )
              })}
            </div>
            {error && (
              <p className="text-caption-2-regular text-error-600 px-1">
                {error}
              </p>
            )}
          </div>
        )
      case "radio":
        return (
          <div className="flex flex-col gap-1">
            <div className={OPTION_LIST_CLASS}>
              {q.options.map((opt, index) => {
                const optionValue = getOptionValue(q, index)
                return (
                  <RadioList
                    key={`${optionValue}-${index}`}
                    checked={value === optionValue}
                    onChange={(checked) => {
                      onChange(checked ? optionValue : "")
                    }}
                  >
                    {opt.content}
                  </RadioList>
                )
              })}
            </div>
            {error && (
              <p className="text-caption-2-regular text-error-600 px-1">
                {error}
              </p>
            )}
          </div>
        )
      case "file":
        return (
          <FileAnswerField
            value={isUploadedFileValue(value) ? value : null}
            onChange={onChange}
            onUploadError={(message) =>
              addToast({
                message,
                color: "red",
                variant: "deep",
                type: "default",
                duration: 3000,
              })
            }
            onUploadingChange={setIsFileUploading}
            error={error}
          />
        )
      case "portfolio": {
        const portfolio = isApplyPortfolioValue(value) ? value : null
        const fieldValue: PortfolioValue | null =
          portfolio?.kind === "file"
            ? { kind: "file", name: portfolio.fileName }
            : portfolio
        return (
          <PortfolioField
            value={fieldValue}
            onChange={(val: PortfolioValue | null) => {
              if (val == null) {
                portfolioUploadTokenRef.current++
                onChange(null)
                return
              }
              if (val.kind === "link") {
                portfolioUploadTokenRef.current++
                onChange({ kind: "link", url: val.url })
                return
              }
              if (val.file) {
                const token = ++portfolioUploadTokenRef.current
                setIsPortfolioUploading(true)
                void uploadPortfolioFile(val.file)
                  .then((uploaded) => {
                    if (token !== portfolioUploadTokenRef.current) return
                    onChange({
                      kind: "file",
                      fileId: uploaded.fileId,
                      fileName: uploaded.fileName,
                    })
                  })
                  .catch((err) =>
                    addToast({
                      message: extractUploadErrorMessage(
                        err,
                        "포트폴리오 업로드에 실패했습니다. 다시 시도해 주세요.",
                        PORTFOLIO_ALLOWED_LABEL,
                      ),
                      color: "red",
                      variant: "deep",
                      type: "default",
                      duration: 3000,
                    }),
                  )
                  .finally(() => {
                    if (token === portfolioUploadTokenRef.current) {
                      setIsPortfolioUploading(false)
                    }
                  })
              }
            }}
            error={error}
          />
        )
      }
    }
  }

  const SUB_MODAL_CLASS =
    "shadow-drop-neutral-1 flex w-115 max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none"

  if (isInitializing) {
    return <ApplyFormSkeleton />
  }

  return (
    <>
      <div className="flex w-232 flex-col">
        <div className="flex w-full">
          <ApplyProjectTitleCard
            projectName={data.title}
            logoSrc={data.logoImage?.src}
            subtitle={data.authorSchoolLine}
          />
        </div>
        <div className="shadow-drop-neutral-3 flex w-full flex-col rounded-2xl bg-white">
          <div className="scrollbar-none max-h-[75vh] overflow-y-auto px-11.5 py-9">
            <div className="flex items-start gap-6 self-stretch px-1 py-5">
              <p className="text-body-1-regular text-teal-gray-600 flex-1">
                {data.description}
              </p>
              <div className="flex w-74.5 shrink-0 flex-col gap-1.25">
                {data.recruitRows.map((row) => {
                  const done = isRecruitDone(row)
                  return (
                    <div
                      key={row.part}
                      className="flex w-full items-center justify-between pr-1"
                    >
                      <div className="flex w-30.5 items-center justify-between">
                        <span className="text-body-2-medium text-teal-gray-700">
                          {row.part}
                        </span>
                        <MemberCount
                          size="sm"
                          current={row.current}
                          total={row.total}
                        />
                      </div>
                      <RecruitStatusChip done={done} />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex w-full flex-col gap-5 pb-6">
              {sections.map((section) => {
                const isCommon = section.id === COMMON_SECTION_ID
                const enabled = sectionEnabled[section.id] ?? section.isEnabled

                return (
                  <div key={section.id}>
                    {isCommon ? (
                      <FormHeader variant="common" />
                    ) : (
                      <FormHeader
                        variant="part"
                        partName={section.name}
                        toggleChecked={enabled}
                        showToggle={canToggleSection}
                        onToggleChange={(checked) =>
                          setSectionEnabled((prev) => ({
                            ...prev,
                            [section.id]: checked,
                          }))
                        }
                      />
                    )}
                    {enabled && section.questions.length > 0 && (
                      <div className="flex flex-col items-start gap-10 self-stretch rounded-b-[12px] border border-teal-200 bg-white pt-8.5 pr-5 pb-9.5 pl-5">
                        {section.questions.map((q) => (
                          <div
                            key={q.id}
                            className="flex w-full flex-col gap-3"
                            data-question-id={q.id}
                          >
                            <QuestionItemTitle
                              index={`Q${questionIndexMap[q.id]}`}
                              title={q.title}
                              caption={q.caption}
                              required={q.required}
                            />
                            <Controller
                              name={q.id}
                              control={control}
                              render={({ field, fieldState }) =>
                                renderAnswerField(
                                  q,
                                  field.value,
                                  (v: ApplyAnswerValue) => field.onChange(v),
                                  fieldState.error?.message,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-teal-gray-100 flex items-center justify-between gap-3 border-t px-6 py-4">
            <Button
              variant="weak"
              color="neutral"
              size="xl"
              onClick={() => void handleSaveDraft()}
              isLoading={isSavingDraft}
              disabled={
                isSubmitting ||
                isSavingDraft ||
                isFileUploading ||
                isPortfolioUploading ||
                isApplicationEditPermissionLoading
              }
            >
              임시저장
            </Button>
            <div className="flex gap-3">
              <Button
                variant="weak"
                color="neutral"
                size="xl"
                onClick={handleBackClick}
                disabled={isSubmitting || isSavingDraft}
              >
                돌아가기
              </Button>
              <Button
                size="xl"
                disabled={
                  isSubmitting ||
                  isSavingDraft ||
                  isFileUploading ||
                  isPortfolioUploading ||
                  isApplicationEditPermissionLoading
                }
                onClick={() => {
                  void handleSubmit(onValid, onInvalid)()
                }}
              >
                제출하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal.Root open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className={SUB_MODAL_CLASS}>
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <WarningTriangleIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  페이지 이탈
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                작성 중인 내용이 저장되지 않습니다.
                <br />
                정말 나가시겠습니까?
              </Modal.Description>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="weak"
                color="neutral"
                size="s"
                onClick={() => setIsLeaveModalOpen(false)}
              >
                돌아가기
              </Button>
              <Button size="s" onClick={handleLeaveConfirm}>
                나가기
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root
        open={isCompleteModalOpen}
        onOpenChange={setIsCompleteModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className={SUB_MODAL_CLASS}>
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  제출 완료
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                프로젝트 지원서가 제출되었습니다.
              </Modal.Description>
            </div>
            <div className="flex justify-end">
              <Button size="s" onClick={onSubmitSuccess}>
                확인
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      <Modal.Root
        open={isSubmitConfirmModalOpen}
        onOpenChange={setIsSubmitConfirmModalOpen}
      >
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className={SUB_MODAL_CLASS}>
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-2">
                <WarningTriangleIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  최종 제출
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                제출 후에는 답변을 수정할 수 없습니다.
                <br />
                이대로 제출하시겠어요?
              </Modal.Description>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="weak"
                color="neutral"
                size="s"
                onClick={() => setIsSubmitConfirmModalOpen(false)}
                disabled={isSubmitting}
              >
                돌아가기
              </Button>
              <Button
                size="s"
                onClick={() => void handleSubmitConfirm()}
                disabled={isSubmitting || isApplicationEditPermissionLoading}
              >
                제출하기
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </>
  )
})
