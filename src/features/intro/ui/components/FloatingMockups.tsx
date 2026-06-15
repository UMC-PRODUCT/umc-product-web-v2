import { motion } from "motion/react"

import {
  HERO_MOCKUP_HEIGHT,
  HERO_MOCKUP_SRC,
  HERO_MOCKUP_WIDTH,
} from "../../constants"

type FloatingMockupsProps = {
  src?: string
}

export function FloatingMockups({
  src = HERO_MOCKUP_SRC,
}: FloatingMockupsProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden="true"
    >
      <motion.img
        src={src}
        alt=""
        width={HERO_MOCKUP_WIDTH}
        height={HERO_MOCKUP_HEIGHT}
        draggable={false}
        className="absolute bottom-[102px] left-[465px] h-[723px] w-[975px] select-none"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.72, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
