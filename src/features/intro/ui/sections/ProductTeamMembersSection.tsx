import { motion } from "motion/react"
import { Fragment } from "react"

import UmcLogo from "@/shared/assets/icon/logo/UmcLogo"

const PARTICLES = [
  { left: 50, top: 228, size: 5, opacity: 0.4 },
  { left: 64, top: 114, size: 3, opacity: 0.25 },
  { left: 106, top: 72, size: 5, opacity: 0.42 },
  { left: 153, top: 117, size: 4, opacity: 0.24 },
  { left: 263, top: 129, size: 3, opacity: 0.3 },
  { left: 387, top: 85, size: 2, opacity: 0.3 },
  { left: 432, top: 101, size: 2, opacity: 0.23 },
  { left: 484, top: 160, size: 2, opacity: 0.22 },
  { left: 207, top: 123, size: 2, opacity: 0.2 },
]

type Member = {
  nickname: string
  name: string
  breakAfter?: boolean
}

type RoleRow = {
  role: string
  members: Member[]
}

type TeamCardData = {
  title: string
  rows: RoleRow[]
}

const LEADS: Member[] = [
  { nickname: "리버", name: "이재원" },
  { nickname: "우연", name: "추연우" },
]

const WEB_CARD: TeamCardData = {
  title: "Web",
  rows: [
    { role: "PM", members: [{ nickname: "벨라", name: "황지원" }] },
    { role: "Design", members: [{ nickname: "이방토", name: "이예원" }] },
    {
      role: "Web",
      members: [
        { nickname: "이삭", name: "강지훈" },
        { nickname: "헤일리", name: "한현서" },
        { nickname: "주디", name: "양혜원" },
        { nickname: "준오", name: "오창준" },
      ],
    },
  ],
}

const MOBILE_CARD: TeamCardData = {
  title: "Mobile",
  rows: [
    { role: "PM", members: [{ nickname: "제옹", name: "정의찬" }] },
    {
      role: "Design",
      members: [
        { nickname: "삼이", name: "이희원" },
        { nickname: "시안", name: "우자영" },
      ],
    },
    {
      role: "iOS",
      members: [
        { nickname: "소피", name: "이예지" },
        { nickname: "원", name: "김동민" },
      ],
    },
    {
      role: "Android",
      members: [
        { nickname: "조나단", name: "조경석" },
        { nickname: "어핫차", name: "박유수" },
        { nickname: "도리", name: "김도연" },
      ],
    },
  ],
}

const SERVER_CARD: TeamCardData = {
  title: "Server",
  rows: [
    {
      role: "SpringBoot",
      members: [
        { nickname: "하늘", name: "박경운" },
        { nickname: "와나", name: "강하나" },
        { nickname: "박박지현", name: "박지현" },
        { nickname: "세니", name: "박세은", breakAfter: true },
        { nickname: "스읍", name: "이예은" },
        { nickname: "갈래", name: "김민서" },
        { nickname: "커너", name: "박성현" },
        { nickname: "라미", name: "권도희" },
        { nickname: "이람", name: "박승범" },
      ],
    },
  ],
}

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

function ProductMark() {
  return (
    <div className="absolute right-15.5 bottom-13.75 flex items-end gap-1.75 text-[#0e8179] opacity-50">
      <UmcLogo className="h-6 w-20" aria-label="UMC" />
      <div className="flex flex-col text-[13px] leading-[1.05] font-bold tracking-[-0.32px] uppercase">
        <span>Product</span>
        <span>2nd</span>
      </div>
    </div>
  )
}

function LabelBadge({ children }: { children: string }) {
  return (
    <span className="relative z-10 inline-flex h-7.75 min-w-18 items-center justify-center rounded-[15px] border-b border-[#0a5650] bg-[#0b6b64] px-5.25 text-[13.5px] leading-normal font-semibold tracking-[-0.135px] text-[#fbfcfc]">
      {children}
    </span>
  )
}

function MemberText({ member }: { member: Member }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap">
      <span>{member.nickname}</span>
      <span className="mx-0.5 font-light text-[#0a5650]/70">/</span>
      <span>{member.name}</span>
    </span>
  )
}

function RoleRow({ role, members }: RoleRow) {
  const roleColumnWidth = role === "SpringBoot" ? "w-[100px]" : "w-[76px]"

  return (
    <div className="flex items-start gap-3.5 text-[16.5px] leading-[1.4] font-medium tracking-[-0.33px] text-[#062b29]">
      <div
        className={`flex ${roleColumnWidth} shrink-0 items-start justify-between gap-3.5`}
      >
        <span>{role}</span>
        <span className="font-light">|</span>
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-3">
        {members.map((member) => (
          <Fragment key={`${member.nickname}-${member.name}`}>
            <MemberText member={member} />
            {member.breakAfter && <span className="basis-full" />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function TeamCard({ title, rows }: TeamCardData) {
  const cardHeight = title === "Server" ? "h-[144px]" : "h-[220px]"

  return (
    <section className="flex flex-1 flex-col items-start">
      <LabelBadge>{title}</LabelBadge>
      <div
        className={`mt-[-15px] flex ${cardHeight} w-full flex-col justify-start rounded-[18px] border border-white bg-[rgba(240,249,248,0.5)] px-9 pt-11.25 pb-9`}
      >
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <RoleRow key={row.role} {...row} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LeadRow() {
  return (
    <div className="flex items-center gap-6">
      <LabelBadge>Lead</LabelBadge>
      <div className="flex items-center gap-3.5 text-[16.5px] leading-[1.4] font-medium tracking-[-0.33px] text-[#062b29]">
        {LEADS.map((member) => (
          <MemberText
            key={`${member.nickname}-${member.name}`}
            member={member}
          />
        ))}
      </div>
    </div>
  )
}

export function ProductTeamMembersSection() {
  return (
    <section data-snap-point className="relative h-202.5 w-360">
      <div className="absolute -top-62.5 -left-63.75 h-225 w-225 rotate-[-17deg] rounded-full border border-white/25 opacity-40" />
      <div className="absolute -top-54.5 -left-30 h-160 w-90 rotate-15 rounded-full border border-white/20 opacity-40" />
      <ParticleLayer />

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="absolute top-22.25 left-1/2 -translate-x-1/2 text-center text-[24px] leading-normal font-bold whitespace-nowrap text-[#0e8179]">
          UMC PRODUCT TEAM
        </h2>

        <div className="absolute top-51.5 left-1/2 flex w-273.75 -translate-x-1/2 flex-col gap-6.75">
          <LeadRow />
          <div className="grid grid-cols-[540px_540px] gap-4.5">
            <TeamCard {...WEB_CARD} />
            <TeamCard {...MOBILE_CARD} />
          </div>
          <TeamCard {...SERVER_CARD} />
        </div>
      </motion.div>

      <ProductMark />
    </section>
  )
}
