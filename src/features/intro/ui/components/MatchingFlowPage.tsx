import { MATCHING_TITLE_ACCENT } from "../../constants"
import { MatchingFlowCard } from "./MatchingFlowCard"

export function MatchingFlowPage() {
  return (
    <div className="flex flex-col items-center gap-[64px]">
      <p className="text-center text-[32px] leading-[1.4] tracking-[-0.64px] whitespace-nowrap text-white">
        <span className="font-bold text-[#36d3c0]">
          {MATCHING_TITLE_ACCENT}
        </span>
        예요!
        <br />
        사용법을 알려드릴게요
      </p>
      <MatchingFlowCard />
    </div>
  )
}
