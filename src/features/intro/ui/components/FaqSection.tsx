import { motion } from "motion/react"

import QA_SRC from "@/features/intro/assets/07/QA.webp"

import { GLOW_ELLIPSE_SRC } from "../../constants"
import { GlowImage } from "./GlowImage"

import type { ReactNode } from "react"

const QUESTION_GRADIENT =
  "linear-gradient(97.1deg, #ffffff 1.28%, #dcf2f2 100%)"

export interface FaqItemData {
  label: string
  question: ReactNode
  answer: ReactNode
}

interface FaqSectionProps {
  label: ReactNode
  heading: ReactNode
  items: FaqItemData[]
  fadeTop?: boolean
}

function FaqItem({ label, question, answer }: FaqItemData) {
  return (
    <div className="flex w-[867px] flex-col">
      <div
        className="flex w-[867px] items-start gap-[19.5px] rounded-[20px] border-[2.25px] border-[#9fdcd4] py-[22.5px] pl-[27px] tracking-[-0.72px]"
        style={{ backgroundImage: QUESTION_GRADIENT }}
      >
        <span className="w-[33.75px] shrink-0 text-[24px] leading-[1.6] text-[#2e302f]">
          {label}
        </span>
        <div className="text-[24px] leading-[1.6] whitespace-nowrap text-[#0b6b64]">
          {question}
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative z-10 h-[24.3752px] w-[8px]">
          <span className="absolute top-0 left-1/2 h-full w-[1.5px] -translate-x-1/2 bg-[#0D514B]" />
          <span className="absolute bottom-0 left-1/2 size-[8px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#0D514B]" />
        </div>
        <div className="flex w-[867px] items-center rounded-[20px] border-[1.125px] border-[rgba(255,255,255,0.4)] bg-[rgba(54,211,192,0.12)] py-[19.5px] pl-[80.25px] shadow-[4.5px_7.875px_7.875px_0px_rgba(0,0,0,0.02)]">
          <div className="text-[16.5px] leading-[1.7] tracking-[-0.495px] whitespace-nowrap text-[#fbfcfc]">
            {answer}
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqBreadcrumb() {
  return (
    <div className="absolute top-[30px] left-[34px] flex items-center gap-[10.5px] opacity-90">
      <span className="text-[15.123px] leading-[18px] font-semibold text-[#9be9e0]">
        FAQ
      </span>
      <div className="h-[12px] w-px bg-[#9be9e0] opacity-50" />
      <span className="text-[15.123px] leading-[18px] font-semibold text-[#36d3c0]">
        자주 묻는 질문
      </span>
    </div>
  )
}

export function FaqSection({
  label,
  heading,
  items,
  fadeTop = false,
}: FaqSectionProps) {
  return (
    <section className="relative h-[1485px] w-[1440px]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: fadeTop
            ? "linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,0.8) 160px)"
            : "rgba(0,0,0,0.8)",
        }}
      />
      <GlowImage
        src={GLOW_ELLIPSE_SRC}
        left={-459}
        top={344}
        width={829}
        height={1135}
        inset="-30.54% -41.81%"
        opacity={1 / 3}
      />

      <FaqBreadcrumb />

      <div className="absolute top-[100px] left-[76px] flex flex-col gap-[34px]">
        <div className="flex w-[411px] flex-col gap-[28px]">
          <p className="text-[18px] font-medium whitespace-pre-wrap text-[#36d3c0]">
            {label}
          </p>
          <div className="flex flex-col text-[24px] leading-[1.6] font-bold tracking-[-0.72px] text-[#fffeff]">
            {heading}
          </div>
        </div>

        <div className="flex gap-[120px]">
          <img
            src={QA_SRC}
            alt=""
            width={266}
            height={266}
            className="h-[266.166px] w-[266.25px] flex-none rounded-[7.456px]"
          />
          <motion.div
            className="flex flex-col gap-[80px]"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {items.map((item) => (
              <FaqItem key={item.label} {...item} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
