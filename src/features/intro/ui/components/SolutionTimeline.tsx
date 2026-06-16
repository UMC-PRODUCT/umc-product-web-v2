import { motion } from "motion/react"
import { Fragment } from "react"

import {
  SOLUTION_LINE_END_SRC,
  SOLUTION_LINE_SRC,
  SOLUTION_STEPS,
} from "../../constants"

const progressTransition = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1],
} as const

export function SolutionTimeline() {
  return (
    <motion.div
      className="flex items-center gap-[22.5px]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.7 }}
    >
      {SOLUTION_STEPS.map((step, index) => (
        <Fragment key={step}>
          <span className="relative h-[2.25px] w-[50.25px] shrink-0 overflow-hidden">
            <img
              src={SOLUTION_LINE_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full opacity-25"
            />
            <motion.img
              src={SOLUTION_LINE_SRC}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full origin-left"
              variants={{
                hidden: { scaleX: 0, opacity: 0 },
                visible: {
                  scaleX: 1,
                  opacity: 1,
                  transition: {
                    ...progressTransition,
                    delay: index * 0.18,
                  },
                },
              }}
            />
          </span>
          <motion.span
            className="text-[16.5px] leading-[1.6] font-light tracking-[-0.495px] whitespace-nowrap"
            variants={{
              hidden: { color: "#6f7878", opacity: 0.55 },
              visible: {
                color: "#e7e7e7",
                opacity: 1,
                transition: {
                  ...progressTransition,
                  delay: index * 0.18 + 0.08,
                },
              },
            }}
          >
            {step}
          </motion.span>
        </Fragment>
      ))}
      <span className="relative h-[16.5px] w-[100.5px] shrink-0 overflow-hidden">
        <img
          src={SOLUTION_LINE_END_SRC}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-25"
        />
        <motion.img
          src={SOLUTION_LINE_END_SRC}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full origin-left"
          variants={{
            hidden: { scaleX: 0, opacity: 0 },
            visible: {
              scaleX: 1,
              opacity: 1,
              transition: {
                ...progressTransition,
                delay: SOLUTION_STEPS.length * 0.18,
              },
            },
          }}
        />
      </span>
    </motion.div>
  )
}
