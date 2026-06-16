import { motion } from "motion/react"
import { Fragment } from "react"

import { PAINPOINT_ARROW_SRC, PAINPOINT_STEPS } from "../../constants"

export function FlowSteps() {
  return (
    <motion.div
      className="flex items-center gap-[9px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
    >
      {PAINPOINT_STEPS.map((step, index) => (
        <Fragment key={step}>
          <motion.div
            className="flex items-center justify-center rounded-full border-b-[0.75px] border-white bg-[rgba(251,252,252,0.1)] px-[22px] pt-[8px] pb-[6.75px] backdrop-blur-[21px]"
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.98 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.38,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
          >
            <span className="text-[16px] leading-[1.4] font-semibold tracking-[-0.32px] whitespace-nowrap text-[#d3d8d8]">
              {step}
            </span>
          </motion.div>
          {index < PAINPOINT_STEPS.length - 1 && (
            <motion.img
              src={PAINPOINT_ARROW_SRC}
              alt=""
              aria-hidden="true"
              className="h-[11px] w-[40.5px] shrink-0"
              variants={{
                hidden: { opacity: 0, x: -8 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    duration: 0.3,
                    delay: index * 0.08 + 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
            />
          )}
        </Fragment>
      ))}
    </motion.div>
  )
}
