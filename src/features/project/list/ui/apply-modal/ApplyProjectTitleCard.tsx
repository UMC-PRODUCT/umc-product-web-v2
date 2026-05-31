import { cn } from "@/shared/lib/utils"

interface ApplyProjectTitleCardProps {
  projectName: string
  challengerName?: string
  challengerUniversity?: string
  subtitle?: string
  className?: string
}

const TRAPEZOID_CLIP_PATH = [
  "polygon(",
  "12px 0,",
  "calc(100% - 63px) 0,",
  "calc(100% - 61px) 0.2px,",
  "calc(100% - 59px) 0.6px,",
  "calc(100% - 57.5px) 1.4px,",
  "calc(100% - 56px) 2.4px,",
  "calc(100% - 54.5px) 3.7px,",
  "100% 100%,",
  "0 100%,",
  "0 12px,",
  "0.5px 9px,",
  "1.5px 6px,",
  "3.5px 3.5px,",
  "6px 1.5px,",
  "9px 0.5px",
  ")",
].join(" ")

export function ApplyProjectTitleCard({
  projectName,
  challengerName,
  challengerUniversity,
  subtitle,
  className,
}: ApplyProjectTitleCardProps) {
  const subtitleText =
    subtitle ??
    (challengerName && challengerUniversity
      ? `${challengerName} · ${challengerUniversity}`
      : (challengerName ?? challengerUniversity ?? null))

  return (
    <div
      className={cn("flex w-full items-end", className)}
      style={{ transform: "translateY(14px)" }}
    >
      <div
        className="flex h-15 w-fit max-w-[calc(100%-1rem)] min-w-69.5 shrink-0 items-center gap-3.5 bg-teal-100 bg-linear-to-r py-2.5 pr-14 pl-4"
        style={{ clipPath: TRAPEZOID_CLIP_PATH }}
      >
        <div className="bg-teal-gray-200 size-8 shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-col">
          <span className="text-subtitle-4-semibold text-teal-gray-800 truncate">
            {projectName}
          </span>
          {subtitleText && (
            <span className="text-caption-2-medium text-teal-gray-600 truncate">
              {subtitleText}
            </span>
          )}
        </div>
      </div>
      <div className="-ml-14 h-3.5 flex-1 rounded-tr-xl bg-teal-100" />
    </div>
  )
}
