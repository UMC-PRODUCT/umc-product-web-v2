import { useEffect, useRef } from "react"

import DragAndDrop from "@/shared/assets/icon/drag-and-drop/DragAndDrop"
import TrashCan from "@/shared/assets/icon/garbage/TrashCan"
import { cn } from "@/shared/lib/utils"
import { Checkbox } from "@/shared/ui/input/checkbox/Checkbox"
import { QuestionItemTitle } from "@/shared/ui/question-field/QuestionItemTitle"

import type { HTMLAttributes, ReactNode } from "react"

interface QuestionFormProps {
  index: string
  title: string
  onTitleChange?: (value: string) => void
  caption?: string
  onCaptionChange?: (value: string) => void
  focused?: boolean
  isFirst?: boolean
  isError?: boolean
  readonlyTitle?: boolean
  required?: boolean
  onRequiredChange?: (checked: boolean) => void
  canDelete?: boolean
  onDelete?: () => void
  children: ReactNode
  className?: string
  showFocusIndicator?: boolean
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = "auto"
  el.style.height = `${el.scrollHeight}px`
}

export function QuestionForm({
  index,
  title,
  onTitleChange,
  caption,
  onCaptionChange,
  focused = false,
  isFirst = false,
  isError = false,
  readonlyTitle = false,
  required = false,
  onRequiredChange,
  canDelete = true,
  onDelete,
  children,
  className,
  showFocusIndicator = true,
  dragHandleProps,
}: QuestionFormProps) {
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!focused || readonlyTitle) return

    const titleTextarea = titleTextareaRef.current
    if (!titleTextarea) return

    titleTextarea.focus()
    const cursorPosition = titleTextarea.value.length
    titleTextarea.setSelectionRange(cursorPosition, cursorPosition)
  }, [focused, readonlyTitle])

  return (
    <article
      className={cn(
        "bp1:px-6 bp1:pb-6 relative flex w-full flex-col items-center gap-2.5 px-4 pb-5",
        focused ? "" : "mt-4 pt-4",
        className,
      )}
    >
      {((focused && showFocusIndicator) || isError) && (
        <span
          aria-hidden
          className={cn(
            "absolute top-0 bottom-0 -left-px w-2",
            isError ? "bg-error-600" : "bg-teal-500",
            isFirst ? "rounded-bl-[12px]" : "rounded-l-[12px]",
          )}
        />
      )}

      {focused && dragHandleProps && (
        <button
          type="button"
          className="mt-4 inline-flex cursor-grab items-center justify-center active:cursor-grabbing"
          aria-label="순서 변경 핸들"
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
        >
          <DragAndDrop className="h-3 w-6" aria-hidden />
        </button>
      )}

      <div className="flex w-full flex-col items-end gap-4">
        {focused ? (
          <div className="flex w-full items-start gap-2">
            <span className="text-heading-7-semibold bp1:w-7 w-6 shrink-0 text-teal-600">
              {index}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="relative">
                <div
                  aria-hidden
                  className="text-heading-7-semibold pointer-events-none wrap-break-word whitespace-pre-wrap"
                >
                  {title ? (
                    <span className="text-teal-gray-900">{title}</span>
                  ) : (
                    <span className="text-teal-gray-400">
                      질문을 작성하세요
                    </span>
                  )}
                  {required && (
                    <span className="text-error-600 inline-block w-0">
                      <span className="pl-1.5">*</span>
                    </span>
                  )}
                </div>
                {!readonlyTitle && (
                  <textarea
                    ref={titleTextareaRef}
                    rows={1}
                    value={title}
                    onChange={(e) => onTitleChange?.(e.target.value)}
                    className="text-heading-7-semibold caret-teal-gray-900 absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent wrap-break-word whitespace-pre-wrap text-transparent outline-none"
                  />
                )}
              </div>
              <textarea
                ref={autoResize}
                rows={1}
                value={caption ?? ""}
                onChange={(e) => {
                  onCaptionChange?.(e.target.value)
                  autoResize(e.target)
                }}
                placeholder="설명 (선택 사항)"
                className="text-body-2-regular text-teal-gray-400 placeholder:text-teal-gray-300 w-full resize-none overflow-hidden bg-transparent outline-none"
              />
            </div>
          </div>
        ) : (
          <QuestionItemTitle
            index={index}
            title={title}
            caption={caption}
            required={required}
            className="self-stretch"
          />
        )}

        <div className="bp1:px-1.5 flex w-full min-w-0 flex-col items-start gap-2.5 px-0">
          {children}
        </div>

        {focused && (
          <div className="flex items-center gap-4">
            <Checkbox
              variant="primary"
              checked={required}
              onChange={onRequiredChange ?? (() => {})}
              aria-label="필수 항목 여부"
            />
            <span className="text-body-1-medium text-teal-gray-600">
              필수 항목
            </span>
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="질문 삭제"
                className="text-teal-gray-500 inline-flex size-6.5 items-center justify-center"
              >
                <TrashCan className="h-6.5 w-6.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
