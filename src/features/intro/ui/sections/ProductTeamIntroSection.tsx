import { motion } from "motion/react"

import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"

const PARTICLES = [
  { left: 50, top: 93, size: 5, opacity: 0.45 },
  { left: 85, top: 185, size: 4, opacity: 0.35 },
  { left: 176, top: 170, size: 3, opacity: 0.32 },
  { left: 195, top: 244, size: 5, opacity: 0.28 },
  { left: 204, top: 263, size: 4, opacity: 0.24 },
  { left: 407, top: 299, size: 2, opacity: 0.28 },
  { left: 130, top: 61, size: 5, opacity: 0.38 },
  { left: 326, top: 88, size: 2, opacity: 0.2 },
  { left: 464, top: 115, size: 2, opacity: 0.16 },
]

function ParticleLayer() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {PARTICLES.map((particle) => (
        <span
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-[#36d3c0]"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  )
}

export function ProductTeamIntroSection() {
  return (
    <section className="relative h-[810px] w-[1440px]">
      <ParticleLayer />

      <motion.div
        className="absolute top-[86px] left-[84px]"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-[97.5px] leading-none font-bold tracking-[-2.6px] text-[#066d63]">
          UMC PRODUCT TEAM
        </h2>
        <p className="mt-[20px] text-[37.5px] leading-none font-medium tracking-[-0.75px] text-[#066d63]">
          유엠씨 프로덕트 팀 소개
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-[64px] left-[66px] flex items-center gap-[8px] opacity-80"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 0.8, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <UmcLogo
          className="h-[15px] w-[50px] text-[#63c4b8]"
          aria-label="UMC"
        />
        <p className="text-[15px] leading-[1.6] font-bold tracking-[-0.3px] text-[#63c4b8]">
          University Make us Challenge
        </p>
      </motion.div>

      <motion.div
        className="absolute right-[62px] bottom-[55px] flex items-end gap-[7px] text-[#0e8179] opacity-50"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 0.5, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <UmcLogo className="h-[24px] w-[80px]" aria-label="UMC" />
        <div className="flex flex-col text-[13px] leading-[1.05] font-bold tracking-[-0.32px] uppercase">
          <span>Product</span>
          <span>2nd</span>
        </div>
      </motion.div>
    </section>
  )
}
