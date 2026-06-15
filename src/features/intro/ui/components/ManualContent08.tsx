import MOCKUP_SRC from "@/features/intro/assets/06/mockup06-08-01.webp"
import RESULT_SHEET_SRC from "@/features/intro/assets/06/mockup06-08-02.svg"

const STEPS = [
  {
    num: 1,
    title: "매칭 통계",
    desc: "지부별 매칭 완료율, 학교별 지원 현황, 프로젝트별 매칭 현황을 파악해요.",
  },
  {
    num: 2,
    title: "매칭 결과 시트",
    desc: "각 프로젝트에 배정된 팀원을 조회해요.\n내가 속하지 않은 지부의 매칭 결과도 확인할 수 있어요.",
  },
]

export function ManualContent08() {
  return (
    <div className="flex flex-col gap-[41px]">
      <div className="flex w-[476px] flex-col gap-[28px]">
        <p className="text-[18px] font-medium text-[#36d3c0]"># 5 매칭 현황</p>
        <div className="text-[24px] tracking-[-0.72px] text-[#fffeff]">
          <p className="leading-[1.6] font-bold">
            다섯째, 실시간으로 모든 지부의 매칭 현황을 파악해요
          </p>
          <p className="leading-[1.6] font-normal">
            지부별 매칭 통계와 결과 시트를 볼 수 있어요
          </p>
        </div>
      </div>
      <div className="flex items-start gap-[80px]">
        <img
          src={MOCKUP_SRC}
          alt=""
          width={700}
          height={476}
          className="w-[650px] flex-none rounded-[10.78px]"
        />
        <div className="flex w-[408.75px] flex-col items-start gap-[39px]">
          <div className="rounded-[9px] bg-[#0b6b64] px-[12px] py-[6px]">
            <p className="text-[18px] font-semibold tracking-[-0.36px] text-white">
              매칭 현황
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
          <img src={RESULT_SHEET_SRC} alt="" width={405} height={284} />
        </div>
      </div>
    </div>
  )
}
