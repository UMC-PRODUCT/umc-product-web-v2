import { motion } from "motion/react"

import {
  PAINPOINT_LABEL,
  PAINPOINT_MOCKUP_SRC,
  PAINPOINT_SUBTITLE,
  PAINPOINT_TITLE,
} from "../../constants"
import { FlowSteps } from "../components/FlowSteps"

export function PainpointSection() {
  return (
    <section className="relative h-[900px] w-[1440px] overflow-hidden">
      <div className="absolute top-[81px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[64px]">
        <motion.div
          className="flex flex-col items-center gap-[32px]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[18px] leading-[1.4] font-semibold tracking-[-0.18px] text-[#0e8179]">
            {PAINPOINT_LABEL}
          </p>
          <div className="flex flex-col items-center gap-[20px]">
            <h2 className="text-[32px] leading-[1.25] font-bold tracking-[-0.64px] text-white">
              {PAINPOINT_TITLE}
            </h2>
            <p className="text-[18px] leading-[1.5] tracking-[-0.18px] text-[#f6f7f7]">
              {PAINPOINT_SUBTITLE}
            </p>
          </div>
        </motion.div>
        <div className="flex flex-col items-center gap-[20px]">
          <FlowSteps />
          <motion.img
            src={PAINPOINT_MOCKUP_SRC}
            alt=""
            width={1000}
            height={460}
            loading="lazy"
            className="h-[460px] w-[1000px] max-w-none"
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{
              duration: 0.62,
              delay: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      </div>
    </section>
  )
}
