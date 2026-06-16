import { ScheduleCard } from "./ScheduleCard"

export function MatchingSchedulePage() {
  return (
    <div className="flex flex-col items-center gap-[64px]">
      <p className="text-center text-[32px] leading-[1.45] tracking-[-0.64px] whitespace-nowrap text-white">
        팀 매칭은{" "}
        <span className="font-bold text-[#36d3c0]">4일 간 총 3번에 걸쳐</span>{" "}
        진행돼요
        <br />
        1차는 24시간 동안, 이후 2차-3차는 각각 12시간 동안 지원 가능해요
      </p>
      <ScheduleCard />
      <p className="text-center text-[23.25px] leading-[1.6] font-extralight whitespace-nowrap text-white">
        매칭 간 간격이 짧고 시험 기간과 겹칠 수 있으니,
        <br />
        지원 기간을 미리 확인하고 놓치지 않도록 주의해 주세요!
      </p>
    </div>
  )
}
