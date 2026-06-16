import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-03.webp"

const STEPS = [
  {
    num: 1,
    title: "프로젝트 목록",
    desc: "모든 지부의 프로젝트를 한눈에 확인해요.",
  },
  {
    num: 2,
    title: "검색 및 필터",
    desc: "지부, PM 학교, 파트, 모집 상태 필터로\n원하는 조건의 프로젝트를 빠르게 찾아요.",
  },
  {
    num: 3,
    title: "모집 상태 확인",
    desc: "프로젝트의 TO와 모집 상태를 확인해요.",
  },
]

export function ManualContent03() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[581px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 2-1  프로젝트 확인 "}
          <span className="text-[#2cad9e]">(Design, FE, BE Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            둘째, 챌린저들은 시스템에 등록된 프로젝트를 확인하고 지원해요
          </p>
          <p className="leading-[1.6] font-normal">
            본인이 소속된 지부의 프로젝트에만 지원할 수 있어요
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={469}
          className="w-[650px] flex-none rounded-[10.78px]"
        />
        <div className="flex w-[408.75px] flex-col items-start gap-[39px]">
          <div className="rounded-[9px] bg-[#0b6b64] px-[12px] py-[6px]">
            <p className="text-[18px] font-semibold tracking-[-0.36px] text-white">
              프로젝트 목록
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
