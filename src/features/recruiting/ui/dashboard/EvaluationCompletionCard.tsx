import GoalIcon from "@/shared/assets/icon/goal/GoalIcon"
import { cn } from "@/shared/lib/utils"

// 지부 목록은 서버 응답에서 오므로 개수와 이름을 카드가 가정하지 않는다.
// 표시 순서는 받은 배열 순서를 그대로 따른다(정렬 책임은 호출부).
interface ChapterEvaluation {
  chapterId: string
  chapterName: string
  count: number
  percentage: number
}

interface EvaluationCompletionCardProps {
  overallPercentage: number
  chapters: ChapterEvaluation[]
}

function percentageChipClassName(percentage: number): string {
  if (percentage === 0) return "bg-teal-gray-150 text-teal-gray-700"
  if (percentage >= 100) return "bg-teal-100 text-teal-600"
  return "bg-warning-100 text-warning-600"
}

export function EvaluationCompletionCard({
  overallPercentage,
  chapters,
}: EvaluationCompletionCardProps) {
  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 flex h-70 w-65 flex-col gap-5 rounded-xl border bg-white px-6 py-6.5">
      <div className="flex items-center justify-center gap-2">
        <GoalIcon className="size-7.5 shrink-0 text-teal-700" />
        <div className="flex items-end gap-1.5">
          <p className="text-heading-6-semibold text-teal-700">평가 완료</p>
          <p className="flex items-end gap-px text-teal-700">
            <span className="text-heading-5-semibold">{overallPercentage}</span>
            <span className="text-heading-6-semibold">%</span>
          </p>
        </div>
      </div>

      <div className="scrollbar-thin -mr-5.25 flex flex-1 flex-col gap-2.5 overflow-x-clip overflow-y-auto pr-5.25">
        {chapters.map(({ chapterId, chapterName, count, percentage }) => {
          return (
            <div
              key={chapterId}
              className="flex items-center justify-between gap-2"
            >
              <p className="text-body-2-medium text-teal-gray-600 whitespace-nowrap">
                {chapterName}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-label-3-medium text-teal-gray-400 whitespace-nowrap">
                  {count.toLocaleString()}명
                </p>
                <span
                  className={cn(
                    "flex w-11.75 shrink-0 items-center justify-center rounded-md px-2 py-0.5",
                    "text-body-3-medium",
                    percentageChipClassName(percentage),
                  )}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
