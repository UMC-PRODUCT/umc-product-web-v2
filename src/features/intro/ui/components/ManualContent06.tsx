import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-06-01.webp"
import STATUS_PANEL_SRC from "@/features/intro/assets/06/mockup06-06-02.svg"

const STEPS = [
  {
    num: 1,
    title: "지원 현황",
    desc: "매칭 차수별로 어떤 프로젝트에 지원했는지 조회해요.\n합격 여부는 매칭 기간 종료 후 확인할 수 있어요.",
  },
  {
    num: 2,
    title: "내 지원서 보기",
    desc: "내가 작성한 지원서를 볼 수 있어요.\n지원 취소는 가능하나, 지원서 수정은 불가능해요.",
  },
]

export function ManualContent06() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[379px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 3-2  프로젝트 확인 "}
          <span className="text-[#2cad9e]">(Design, FE, BE Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            나의 프로젝트 지원 현황을 확인해요
          </p>
          <p className="leading-[1.6] font-normal">
            지원 내역과 매칭 결과를 확인해요.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={470}
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
          <img
            src={STATUS_PANEL_SRC}
            alt=""
            width={171}
            height={172}
            className="ml-[35px]"
          />
        </div>
      </div>
    </div>
  )
}
