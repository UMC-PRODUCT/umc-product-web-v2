import { cn } from "@/shared/lib/utils"

interface ProjectTitleCardProps {
  projectName: string
  challengerName: string
  challengerUniversity: string
  size?: "lg" | "md" | "sm"
  className?: string
}

export function ProjectTitleCard({
  projectName,
  challengerName,
  challengerUniversity,
  size = "lg",
  className,
}: ProjectTitleCardProps) {
  // sm
  if (size === "sm") {
    return (
      <div className={cn("flex items-end", className)}>
        <div
          className="flex h-15 w-69.5 shrink-0 items-center gap-3.5 bg-teal-100 bg-linear-to-r py-2.5 pl-4"
          style={{ clipPath: "polygon(0 0, 82% 0, 100% 100%, 0 100%)" }}
        >
          <div className="bg-teal-gray-200 size-8 shrink-0 rounded-lg" />
          <div className="flex flex-col">
            <span className="text-subtitle-4-semibold text-teal-gray-800">
              {projectName}
            </span>
            <span className="text-caption-2-medium text-teal-gray-600">
              {challengerName} · {challengerUniversity}
            </span>
          </div>
        </div>
        <div className="-ml-1.5 h-1.75 flex-1 rounded-tr-xl bg-teal-100" />
      </div>
    )
  }

  // md
  if (size === "md") {
    return (
      <div className={cn("flex items-end", className)}>
        <div
          className="flex h-21.25 w-88 shrink-0 items-center gap-5 rounded-bl-xl bg-teal-100 bg-linear-to-r px-5.5 py-4"
          style={{ clipPath: "polygon(0 0, 80% 0, 100% 100%, 0 100%)" }}
        >
          <div className="bg-teal-gray-200 size-12.5 shrink-0 rounded-lg" />
          <div className="flex flex-col gap-1">
            <span className="text-heading-6-semibold text-teal-gray-800">
              {projectName}
            </span>
            <span className="text-body-2-medium text-teal-gray-600">
              {challengerName} · {challengerUniversity}
            </span>
          </div>
        </div>
        <div className="-ml-2 h-2.5 flex-1 rounded-tr-xl bg-teal-100" />
      </div>
    )
  }

  // lg
  return (
    <div className={cn("flex items-end", className)}>
      <div
        className="flex h-21.25 w-4/5 shrink-0 items-center gap-5 rounded-bl-xl bg-teal-50 bg-linear-to-r px-5.5 py-4"
        style={{ clipPath: "polygon(0 0, 80% 0, 100% 100%, 0 100%)" }}
      >
        <div className="bg-teal-gray-200 size-12.5 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-1">
          <span className="text-heading-6-semibold text-teal-gray-800">
            {projectName}
          </span>
          <span className="text-body-2-medium text-teal-gray-600">
            {challengerName} · {challengerUniversity}
          </span>
        </div>
      </div>
      <div className="-ml-2 h-2.5 flex-1 rounded-tr-xl bg-teal-100" />
    </div>
  )
}
