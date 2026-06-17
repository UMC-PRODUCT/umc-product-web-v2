import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-01.webp"

const STEPS = [
  {
    num: 1,
    title: "프로젝트 카드",
    desc: "대표 썸네일(540*286px)과 한 줄 소개를 설정해요.",
  },
  {
    num: 2,
    title: "로고",
    desc: "매칭 당시 챌린저들에게 보여질 로고를 등록해요.",
  },
  {
    num: 3,
    title: "기획 문서",
    desc: "지원자들이 내 프로젝트를 이해할 수 있도록 기획 문서 링크를 첨부해요.",
  },
  {
    num: 4,
    title: "모집 정보",
    desc: "기술 스택과 모집 TO에 관한 항목으로, 운영진이 설정해요.",
  },
]

export function ManualContent01() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[591px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 1-1  프로젝트 등록 "}
          <span className="text-[#2cad9e]">(Plan Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            첫째, Plan 챌린저는 매칭 기간 전에 미리 프로젝트를 등록해요
          </p>
          <p className="leading-[1.6] font-normal">
            프로젝트 한 줄 소개, 썸네일, 로고, 기획 문서 링크를 준비해 주세요
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={469}
          loading="lazy"
          className="w-[650px] flex-none rounded-[10.78px]"
        />
        <div className="flex w-[465px] flex-col items-start gap-[39px]">
          <div className="rounded-[9px] bg-[#0b6b64] px-[12px] py-[6px]">
            <p className="text-[18px] font-semibold tracking-[-0.36px] text-white">
              프로젝트 등록
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
