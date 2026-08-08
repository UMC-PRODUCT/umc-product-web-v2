import { cn } from "@/shared/lib/utils"

interface QuestionItemTitleProps {
  index: string
  title: string
  caption?: string
  captionPlaceholder?: string
  required?: boolean
  className?: string
}

export function QuestionItemTitle({
  index,
  title,
  caption,
  captionPlaceholder,
  required = false,
  className,
}: QuestionItemTitleProps) {
  return (
    <div className={cn("flex w-full items-start gap-1.5", className)}>
      <span className="text-heading-7-semibold w-7 shrink-0 text-teal-600">
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-heading-7-semibold break-keep whitespace-pre-wrap">
          {title ? (
            <span className="text-teal-gray-900">{title}</span>
          ) : (
            <span className="text-teal-gray-400">질문을 작성하세요</span>
          )}
          {required && (
            <span aria-hidden="true" className="text-error-600 ml-1">
              *
            </span>
          )}
        </span>
        {(caption !== undefined && caption !== "") || captionPlaceholder ? (
          <span
            className={cn(
              "text-body-2-regular break-keep whitespace-pre-wrap",
              caption ? "text-teal-gray-600" : "text-teal-gray-300",
            )}
          >
            {caption || captionPlaceholder}
          </span>
        ) : null}
      </div>
    </div>
  )
}
