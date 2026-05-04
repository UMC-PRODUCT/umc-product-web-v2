import { NumberTag } from "@/shared/ui/NumberTag"

const LEGEND_ITEMS = [
  { variant: "round1", label: "1차 매칭" },
  { variant: "round2", label: "2차 매칭" },
  { variant: "round3", label: "3차 매칭" },
  { variant: "random", label: "랜덤 매칭" },
] as const

export function MatchingTableHead() {
  return (
    <div className="border-teal-gray-300 flex items-center gap-1.75 border-b bg-teal-50 py-2.5 pr-5.5 pl-1.75">
      {/* 프로젝트 명 */}
      <div className="w-42.5 shrink-0">
        <span className="text-body-2-medium text-teal-gray-600 pl-3.5">
          프로젝트 명
        </span>
      </div>

      {/* 챌린저 */}
      <div className="w-37.5 shrink-0">
        <span className="text-body-2-medium text-teal-gray-600 pl-3.5">
          챌린저
        </span>
      </div>

      {/* 매칭 결과표 + 범례 */}
      <div className="flex flex-1 items-center justify-between">
        <span className="text-body-2-medium text-teal-gray-600">
          매칭 결과표
        </span>
        <div className="flex items-center gap-2.5">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.variant} className="flex items-center gap-1">
              <NumberTag variant={item.variant} />
              <span className="text-caption-2-regular text-teal-gray-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
