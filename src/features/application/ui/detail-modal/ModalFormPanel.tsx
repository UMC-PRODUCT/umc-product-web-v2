import CloseCircleIcon from "@/shared/assets/icon/close/CloseCircleIcon"
import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { cn } from "@/shared/lib/utils"
import { StatusChipDropdown } from "@/shared/ui/chip/StatusChipDropdown"
import { StatusChipTag } from "@/shared/ui/chip/StatusChipTag"
import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"
import { ProjectTitleCard } from "@/shared/ui/ProjectTitleCard"

import type { ApplicantFormData, FormField } from "../../model/types"
import type { ApplicantDetail, StatusValue } from "../../model/types"

const ROLE_LABEL: Record<string, string> = {
  plan: "PM",
  design: "Design",
  web: "Web",
  ios: "iOS",
  android: "Android",
  springboot: "SpringBoot",
  nodejs: "Node.js",
}

// 텍스트 내 URL을 클릭 가능한 링크로 변환
const URL_REGEX = /(https?:\/\/[^\s<]+)/g

function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_REGEX)
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-teal-600 underline"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function FormFieldItem({ field }: { field: FormField }) {
  return (
    <div className="flex flex-col gap-2.5 px-1.5">
      <div className="flex gap-1 px-1.5">
        <span className="text-subtitle-4-semibold w-5 shrink-0 text-teal-600">
          {field.label}
        </span>
        <span className="text-subtitle-4-semibold text-teal-gray-900">
          {field.question}
          {field.required && <span className="text-[#c21f14]">*</span>}
        </span>
      </div>
      <div className="pl-3.5">
        <div className="border-teal-gray-100 rounded-xl border bg-white px-4 py-3">
          {field.links && field.links.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {field.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-2-medium break-all text-teal-600 underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <span className="text-body-2-medium text-neutral-800">
              <Linkify text={field.answer} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface ModalFormPanelProps {
  applicant: ApplicantDetail
  formData: ApplicantFormData | null
  chapterName: string
  projectName: string
  challengerName: string
  challengerUniversity: string
  variant?: "application" | "matching"
  onStatusChange?: (status: StatusValue) => void
  onUnmatch?: () => void
  onClose: () => void
  statusDisabled?: boolean
  hidePendingStatus?: boolean
  className?: string
}

export function ModalFormPanel({
  applicant,
  formData,
  chapterName,
  projectName,
  challengerName,
  challengerUniversity,
  variant = "application",
  onStatusChange,
  onUnmatch,
  onClose,
  statusDisabled = false,
  hidePendingStatus = false,
  className,
}: ModalFormPanelProps) {
  const roleLabel = ROLE_LABEL[applicant.role] ?? applicant.role

  return (
    <div
      className={cn(
        "flex w-xl shrink-0 flex-col rounded-xl bg-white px-8",
        className,
      )}
    >
      {/* 헤더 (고정) */}
      <div className="shrink-0">
        <div className="flex flex-col gap-2.75 px-2 pt-14 pb-2">
          <div className="flex items-start justify-between">
            <span className="text-subtitle-4-semibold flex-1 text-teal-600">
              {chapterName}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="shadow-inner-neutral-2 hover:bg-teal-gray-50 flex size-6.5 items-center justify-center rounded-lg transition-colors"
              aria-label="패널 닫기"
            >
              <CloseIcon
                width={18}
                height={18}
                className="text-teal-gray-600"
              />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-heading-5-bold text-teal-gray-800 min-w-0 flex-1">
                <span className="text-teal-500">{roleLabel}</span>{" "}
                <span className="text-heading-5-semibold text-teal-gray-800">
                  파트 지원서
                </span>
              </h3>
              {variant === "matching" ? (
                onUnmatch && (
                  <button
                    type="button"
                    onClick={onUnmatch}
                    className="shadow-inner-neutral-2 hover:bg-teal-gray-50 flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <CloseCircleIcon
                      width={18}
                      height={18}
                      className="text-teal-gray-300"
                    />
                    <span className="text-body-3-medium text-teal-gray-600">
                      매칭 해제
                    </span>
                  </button>
                )
              ) : (
                <OptionButtonGroup
                  variant="segmented"
                  value={statusDisabled ? "" : applicant.status}
                  onValueChange={(v) => onStatusChange?.(v as StatusValue)}
                  className={cn(
                    "w-60",
                    statusDisabled && "pointer-events-none",
                  )}
                >
                  <OptionButton
                    value="pass"
                    disabled={statusDisabled}
                    className="h-7.5 gap-0.5 font-normal!"
                  >
                    합격
                  </OptionButton>
                  <OptionButton
                    value="fail"
                    disabled={statusDisabled}
                    className="h-7.5 gap-0.5 font-normal!"
                  >
                    불합격
                  </OptionButton>
                  {!hidePendingStatus && (
                    <OptionButton
                      value="pending"
                      disabled={statusDisabled}
                      className="h-7.5 gap-0.5 font-normal!"
                    >
                      대기
                    </OptionButton>
                  )}
                </OptionButtonGroup>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-body-2-medium text-teal-gray-600">
                {applicant.name} · {applicant.university}
              </span>
              {variant === "matching" || statusDisabled ? (
                <StatusChipTag value={applicant.status} type="chip" disabled />
              ) : (
                <StatusChipDropdown
                  value={applicant.status}
                  onValueChange={onStatusChange}
                  options={hidePendingStatus ? ["pass", "fail"] : undefined}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 본문 (스크롤) */}
      <div className="scrollbar-none flex flex-1 flex-col overflow-y-auto pb-8.5">
        {/* 프로젝트 정보 */}
        <div className="relative flex h-15 items-end px-4 py-4.5">
          {/* 프로젝트 카드 (좌) */}
          <ProjectTitleCard
            projectName={projectName}
            challengerName={challengerName}
            challengerUniversity={challengerUniversity}
            size="sm"
            className="absolute top-0 left-0 w-full"
          />

          {/* 역할 정보 (우) */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-body-2-medium text-teal-gray-700">
              {roleLabel.toUpperCase()}
            </span>
            <span className="text-caption-2-regular text-teal-gray-500">
              0/1
            </span>
            <span className="shadow-drop-neutral-3 text-body-3-medium rounded-md bg-teal-50 px-2 py-0.5 text-teal-600">
              모집 중
            </span>
          </div>
        </div>

        {/* 질문/답변 섹션 */}
        <div className="flex flex-col gap-5">
          {/* 공통 질문 */}
          <div className="flex flex-col gap-8 rounded-b-xl border border-teal-200 px-2 py-6.5">
            {formData?.commonFields.map((field, i) => (
              <FormFieldItem key={i} field={field} />
            ))}
          </div>

          {/* 파트별 질문 */}
          {formData?.roleSection && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between rounded-t-xl border-t border-r border-l border-teal-300 bg-teal-100 py-2 pr-5 pl-7.5">
                <span className="text-heading-7-semibold text-teal-600">
                  {formData.roleSection.title}
                </span>
              </div>
              <div className="flex flex-col gap-8 rounded-b-xl border border-teal-200 px-2 py-6.5">
                {formData.roleSection.fields.map((field, i) => (
                  <FormFieldItem key={i} field={field} />
                ))}
              </div>
            </div>
          )}
        </div>

        {!formData && (
          <div className="flex h-40 items-center justify-center">
            <span className="text-body-2-regular text-teal-gray-400">
              지원서 데이터가 없습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
