import { cn } from "@/shared/lib/utils"

interface MatchingPartSectionProps {
  partName: string
  children: React.ReactNode
  className?: string
}

export function MatchingPartSection({
  partName,
  children,
  className,
}: MatchingPartSectionProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* 파트 헤더 */}
      <div className="flex h-11 items-center rounded-t-xl border border-teal-300 bg-teal-100 px-5">
        <span className="text-heading-7-semibold text-teal-600">
          {partName}
        </span>
      </div>

      {/* 테이블 영역 */}
      <div className="border-teal-gray-300 overflow-clip rounded-b-xl border-x border-b">
        {children}
      </div>
    </div>
  )
}
