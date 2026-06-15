import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-04-01.webp"
import TEAM_PANEL_SRC from "@/features/intro/assets/06/mockup06-04-02.svg"

const STEPS = [
  {
    num: 1,
    title: "기획 보기",
    desc: "Plan 챌린저가 작성한 기획 문서로 이동해요.",
  },
  {
    num: 2,
    title: "지원하기",
    desc: "지원 폼 작성으로 이동해요.",
  },
  {
    num: 3,
    title: "팀원 구성 확인",
    desc: "현재 소속된 팀원 구성을 확인해요.",
  },
]

export function ManualContent04() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[451px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 2-2  프로젝트 확인 "}
          <span className="text-[#2cad9e]">(Design, FE, BE Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            프로젝트 카드를 클릭해 더 자세한 내용을 확인해요
          </p>
          <p className="leading-[1.6] font-normal">
            팀원 구성과 기획안을 확인하고 지원할 수 있어요
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={477}
          className="w-[650px] flex-none rounded-[10.78px]"
        />
        <div className="flex w-[408.75px] flex-col items-start gap-[39px]">
          <div className="rounded-[9px] bg-[#0b6b64] px-[12px] py-[6px]">
            <p className="text-[18px] font-semibold tracking-[-0.36px] text-white">
              프로젝트 카드
            </p>
          </div>
          <div className="flex w-full flex-col items-start gap-[34.5px]">
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
                  <p className="text-[15px] leading-[1.4] font-medium tracking-[-0.3px] whitespace-nowrap text-[#d3d8d8]">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <img
            src={TEAM_PANEL_SRC}
            alt=""
            width={278}
            height={217}
            className="ml-[35px]"
          />
        </div>
      </div>
    </div>
  )
}
