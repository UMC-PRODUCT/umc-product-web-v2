import { motion } from "motion/react"

type ProductTeamArticle = {
  title: string
  body: string[]
}

const ARTICLES: ProductTeamArticle[] = [
  {
    title: "UMC Product Team이란?",
    body: [
      "Product Team은 UMC 챌린저들의 원활한 동아리 생활을 돕기 위해 모인 팀이에요.",
      "여러분들이 사용하는 모바일 앱과 웹 서비스를 직접 만들고 있죠.",
      "2025년 하반기에 출범해 서비스의 토대를 다졌으며, 현재는 꾸준히 유지보수하며 서비스를 확장해 나가고 있어요.",
    ],
  },
  {
    title: "UMC Product Team 3기는 바로 당신!",
    body: [
      "Product Team 3기 모집은 8월 데모데이 이후에 시작될 예정이에요.",
      "단순히 서비스를 구현하는 데서 그치지 않고, 3,000명에 육박하는 실제 사용자를 대상으로 서비스를 직접 운영해 보고 싶은 분들을 기다리고 있어요.",
      "UMC에 대한 애정과 열정이 넘치는 당신, Product Team 3기에 합류해 보는 건 어떨까요?",
    ],
  },
]

function ProductTeamArticle({ title, body }: ProductTeamArticle) {
  return (
    <article className="flex w-full flex-col gap-4 text-[#062b29]">
      <h2 className="text-[25.5px] leading-[1.2] font-bold tracking-[-0.51px]">
        {title}
      </h2>
      <div className="flex flex-col text-[19.5px] leading-[1.8] font-medium tracking-[-0.39px]">
        {body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}

export function ProductTeamAboutSection() {
  return (
    <section
      data-snap-point
      data-snap-strength="strong"
      className="relative h-202.5 w-360"
    >
      <motion.div
        className="absolute top-95.5 left-16.5 flex w-311 flex-col gap-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {ARTICLES.map((article) => (
          <ProductTeamArticle key={article.title} {...article} />
        ))}
      </motion.div>
    </section>
  )
}
