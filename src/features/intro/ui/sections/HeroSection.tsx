import { motion } from "motion/react"

import heroStars from "@/features/intro/assets/01/stars.svg"

import { HERO_SUBTITLE, HERO_TITLE, HERO_TITLE_COLOR } from "../../constants"
import { FloatingMockups } from "../components/FloatingMockups"

export function HeroSection() {
  return (
    <section className="relative h-[900px] w-[1440px] overflow-hidden">
      <img
        src={heroStars}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[150px] left-[120px] h-[441px] w-[518px]"
      />
      <FloatingMockups />

      <motion.div
        className="absolute bottom-[189px] left-[81px] z-40 flex flex-col gap-[13px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.58, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-[48px] leading-[1.2] font-bold tracking-[-1.44px]"
          style={{ color: HERO_TITLE_COLOR }}
        >
          {HERO_TITLE}
        </h1>
        <p className="text-[28px] leading-[1.3] font-normal tracking-[-0.56px] text-white">
          {HERO_SUBTITLE}
        </p>
      </motion.div>
    </section>
  )
}
