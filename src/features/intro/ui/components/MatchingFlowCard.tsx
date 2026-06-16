import flowStep1 from "@/features/intro/assets/04/icons/step1.png"
import flowStep2 from "@/features/intro/assets/04/icons/step2.png"
import flowStep3 from "@/features/intro/assets/04/icons/step3.png"
import flowStep4 from "@/features/intro/assets/04/icons/step4.png"
import flowArrow from "@/features/intro/assets/04/vector.svg"

type FlowStep = {
  num: string
  label: string
  icon: string
  iconWidth: number
  iconHeight: number
  colLeft: number
  colWidth: number
  numLeft: number
}

type FlowLine = {
  left: number
  top: number
  width: number
}

const STEPS: FlowStep[] = [
  {
    num: "01",
    label: "프로젝트 등록",
    icon: flowStep1,
    iconWidth: 101,
    iconHeight: 101,
    colLeft: 0,
    colWidth: 147.82,
    numLeft: 73.91,
  },
  {
    num: "02",
    label: "프로젝트 목록 확인",
    icon: flowStep2,
    iconWidth: 127,
    iconHeight: 113,
    colLeft: 215.16,
    colWidth: 176.563,
    numLeft: 303.44,
  },
  {
    num: "03",
    label: "프로젝트 지원하기",
    icon: flowStep3,
    iconWidth: 101,
    iconHeight: 101,
    colLeft: 459.06,
    colWidth: 179.847,
    numLeft: 548.99,
  },
  {
    num: "04",
    label: "매칭 현황 확인",
    icon: flowStep4,
    iconWidth: 105,
    iconHeight: 105,
    colLeft: 706.25,
    colWidth: 141.25,
    numLeft: 776.88,
  },
]

const FLOW_ARROW_SRC = flowArrow

const LINES: FlowLine[] = [
  { left: 118.26, top: 11.28, width: 139.608 },
  { left: 345.73, top: 11.28, width: 162.602 },
  { left: 587.17, top: 12.1, width: 149.462 },
]

export function MatchingFlowCard() {
  return (
    <div className="relative h-[357px] w-[997px]">
      <div className="absolute inset-x-0 top-[18px] bottom-0 rounded-[17.4px] border-[1.125px] border-white bg-[#36d3c0]/30 opacity-20 shadow-[4.5px_7.875px_7.875px_0_rgba(0,0,0,0.02)]" />

      <div className="absolute top-0 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-b-[0.75px] border-[#0a5650] bg-[#083f3c] px-[21px] pt-[6.25px] pb-[5.25px]">
        <span className="text-[19.5px] leading-[1.5] font-semibold tracking-[-0.195px] text-[#fbfcfc]">
          서비스 주요 Flow
        </span>
      </div>

      <div className="absolute top-[80px] left-1/2 h-[201px] w-[847.5px] -translate-x-1/2">
        {LINES.map((line) => (
          <img
            key={`${line.left}-${line.width}`}
            src={FLOW_ARROW_SRC}
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ left: line.left, top: line.top, width: line.width }}
          />
        ))}

        {STEPS.map((step) => (
          <div key={step.num}>
            <p
              className="absolute top-0 -translate-x-1/2 text-center text-[21.7px] font-semibold text-[#36d3c0]"
              style={{ left: step.numLeft, width: step.colWidth }}
            >
              {step.num}
            </p>
            <div
              className="absolute top-[31.8px] flex flex-col items-center gap-[24px]"
              style={{ left: step.colLeft, width: step.colWidth }}
            >
              <img
                src={step.icon}
                alt=""
                width={step.iconWidth}
                height={step.iconHeight}
                className="max-w-none"
                style={{ width: step.iconWidth, height: step.iconHeight }}
              />
              <p className="text-center text-[19.7px] font-semibold whitespace-nowrap text-white/95">
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
