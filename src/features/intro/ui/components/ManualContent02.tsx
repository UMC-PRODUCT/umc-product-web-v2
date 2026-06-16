import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-02-01.svg"
import TYPE_PICKER_SRC from "@/features/intro/assets/06/mockup06-02-02.svg"

const STEPS = [
  {
    num: 1,
    title: "공통 문항",
    desc: "모든 지원자들을 위한 공통 문항을 작성해요.",
    picker: false,
  },
  {
    num: 2,
    title: "파트별 문항",
    desc: "Design, FE, BE 각 파트 지원자들을 위한 문항을 작성해요.",
    picker: false,
  },
  {
    num: 3,
    title: "질문 유형 설정",
    desc: "주관식, 단일 선택, 복수 선택, 파일 업로드, 포트폴리오\n총 5가지 질문 유형을 설정할 수 있어요.",
    picker: true,
  },
]

export function ManualContent02() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[439px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
          {"# 1-2  프로젝트 등록 "}
          <span className="text-[#2cad9e]">(Plan Challenger)</span>
        </p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            지원자들에게 물어볼 질문을 작성해요
          </p>
          <p className="leading-[1.6] font-normal">
            공통 질문과 파트별 질문을 나눠 작성할 수 있어요
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
              지원 문항
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
                  {step.picker && (
                    <img
                      src={TYPE_PICKER_SRC}
                      alt=""
                      width={338}
                      height={81}
                      className="mt-[6px]"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
