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
    <section
      data-snap-point
      data-snap-strength="strong"
      className="relative h-202.5 w-360"
    >
      <ParticleLayer />

      <motion.div
        className="absolute top-21.5 left-21"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-[97.5px] leading-none font-bold tracking-[-2.6px] text-[#066d63]">
          UMC PRODUCT TEAM
        </h2>
        <p className="mt-5 text-[37.5px] leading-none font-medium tracking-[-0.75px] text-[#066d63]">
          유엠씨 프로덕트 팀 소개
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-16 left-16.5 flex items-center gap-2 opacity-80"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 0.8, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <UmcLogo className="h-3.5 w-12.5 text-[#63c4b8]" aria-label="UMC" />
        <p className="text-[15px] leading-[1.6] font-bold tracking-[-0.3px] text-[#63c4b8]">
          University MakeUs Challenge
        </p>
      </motion.div>

      <motion.div
        className="absolute right-16 bottom-14 flex items-end gap-2 text-[#0e8179] opacity-50"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 0.5, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <UmcLogo className="h-6 w-20" aria-label="UMC" />
        <div className="flex flex-col text-[13px] leading-[1.05] font-bold tracking-[-0.32px] uppercase">
          <span>Product</span>
          <span>2nd</span>
        </div>
      </motion.div>
    </section>
  )
}
