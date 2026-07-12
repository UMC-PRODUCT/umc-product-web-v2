import { NumberTag } from "@/shared/ui/tag/NumberTag"

interface TeamMemberRowProps {
  index: number | string
  nickname: string
  name: string
  school: string
}

export function TeamMemberRow({
  index,
  nickname,
  name,
  school,
}: TeamMemberRowProps) {
  return (
    <div className="border-teal-gray-100 flex items-center gap-2 rounded-lg border bg-white px-2 py-1">
      <NumberTag value={index} />
      <div className="flex items-center gap-1.5">
        <span className="text-body-2-medium text-teal-gray-900 whitespace-nowrap">
          {nickname}/{name}
        </span>
        <div className="bg-teal-gray-300 h-3 w-px rounded-full" />
        <span className="text-caption-2-regular text-teal-gray-900">
          {school}
        </span>
      </div>
    </div>
  )
}
