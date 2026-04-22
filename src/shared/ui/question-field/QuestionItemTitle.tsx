import { cn } from "@/shared/lib/utils"

interface QuestionItemTitleProps {
  index: string
  title: string
  caption?: string
  required?: boolean
  className?: string
}

export function QuestionItemTitle({
  index,
  title,
  caption,
  required = false,
  className,
}: QuestionItemTitleProps) {
  return (
    <div className={cn("flex w-full items-start gap-2", className)}>
      <span className="text-heading-7-semibold w-7 shrink-0 text-teal-600">
        {index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-heading-7-semibold text-teal-gray-900 break-keep whitespace-pre-wrap">
          {title}
          {required && <span className="text-error-600 ml-1">*</span>}
        </span>
        {caption !== undefined && caption !== "" && (
          <span className="text-body-2-regular text-teal-gray-400 break-keep whitespace-pre-wrap">
            {caption}
          </span>
        )}
      </div>
    </div>
  )
}
