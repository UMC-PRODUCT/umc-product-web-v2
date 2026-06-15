import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-05.webp"

const STEPS = [
  {
    num: 1,
    title: "공통 문항 & 파트별 문항",
    desc: "Plan 챌린저가 등록한 문항에 대한 답변을 작성해요.",
  },
  {
    num: 2,
    title: "제출 완료",
    desc: "지원 폼을 제출한 후, 나의 지원 현황에서 제출 상태를 확인해요.",
  },
]

export function ManualContent05() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[610px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 3-1  프로젝트 확인 "}
          <span className="text-[#2cad9e]">(Design, FE, BE Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            셋째, 지원 폼을 작성한 후 제출해요
          </p>
          <p className="leading-[1.6] font-normal">
            수정 및 임시저장 기능은 지원하지 않으니 답변 작성에 유의해 주세요
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
              지원하기
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
                  <p className="text-[15px] leading-[1.4] font-medium tracking-[-0.3px] whitespace-nowrap text-[#d3d8d8]">
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
