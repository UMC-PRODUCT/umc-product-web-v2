import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-07.webp"

const STEPS = [
  {
    num: 1,
    title: "필터",
    desc: "매칭 차수와 상태별로 지원자를 확인해요.",
  },
  {
    num: 2,
    title: "지원서 조회",
    desc: "지원자를 클릭하면 작성한 답변과 제출 파일을 바로 확인할 수 있어요.",
  },
  {
    num: 3,
    title: "최종 합/불 처리",
    desc: "지원서를 검토한 뒤 합격, 불합격 상태를 직접 지정해요.\n다음 매칭 차수가 시작하기 전까지 결정을 번복할 수 있어요.",
  },
]

export function ManualContent07() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[541px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 4  지원 현황 "}
          <span className="text-[#2cad9e]">(Plan Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            넷째, 내 프로젝트의 지원자를 확인하고 최종 팀원을 선발해요
          </p>
          <p className="leading-[1.6] font-normal">
            각 매칭 차수 기간 내에서만 합/불 상태를 변경할 수 있어요
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={438}
          className="w-[650px] flex-none rounded-[10.78px]"
        />
        <div className="flex w-[408.75px] flex-col items-start gap-[39px]">
          <div className="rounded-[9px] bg-[#0b6b64] px-[12px] py-[6px]">
            <p className="text-[18px] font-semibold tracking-[-0.36px] text-white">
              지원 현황
            </p>
          </div>
          <div className="flex w-full flex-col items-start gap-[36px]">
            {STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-[12px]">
                <div className="flex size-[22.5px] flex-none items-center justify-center rounded-full bg-[#0b6b64]">
                  <span className="text-[15px] leading-none font-medium tracking-[-0.3px] text-white">
                    {step.num}
                  </span>
                </div>
                <div className="flex flex-col gap-[7.5px]">
                  <p className="text-[19.5px] leading-[1.2] font-semibold tracking-[-0.39px] whitespace-nowrap text-white">
                    {step.title}
                  </p>
                  <p className="text-[15px] leading-[1.4] font-medium tracking-[-0.3px] whitespace-pre-wrap text-[#d3d8d8]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
