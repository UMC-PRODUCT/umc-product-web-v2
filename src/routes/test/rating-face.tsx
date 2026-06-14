import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { RatingFace } from "@/shared/assets/icon/emoji"

import type {
  RatingScore,
  RatingSize,
  RatingVariant,
} from "@/shared/assets/icon/emoji"

export const Route = createFileRoute("/test/rating-face")({
  component: RatingFaceTestPage,
})

const SCORES: RatingScore[] = [1, 2, 3, 4, 5]
const VARIANTS: RatingVariant[] = ["neutral", "default", "filled"]
const SIZES: { label: string; size: RatingSize }[] = [
  { label: "sm (22px)", size: "sm" },
  { label: "md (32px)", size: "md" },
  { label: "lg (44px)", size: "lg" },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-label-1-semibold text-teal-gray-500 border-teal-gray-100 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ScoreLabel({ score }: { score: RatingScore }) {
  return (
    <span className="text-caption-1-medium text-teal-gray-400">{score}</span>
  )
}

function RatingFaceTestPage() {
  const [selected, setSelected] = useState<RatingScore | null>(null)

  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        RatingFace Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Variant x Score (size lg)">
          <div className="flex flex-col gap-6">
            {VARIANTS.map((variant) => (
              <div key={variant} className="flex items-center gap-6">
                <span className="text-body-2-medium text-teal-gray-600 w-20">
                  {variant}
                </span>
                {SCORES.map((score) => (
                  <div key={score} className="flex flex-col items-center gap-1">
                    <RatingFace score={score} variant={variant} size="lg" />
                    <ScoreLabel score={score} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Size prop (default variant, score 3)">
          <div className="flex items-end gap-8">
            {SIZES.map((item) => (
              <div key={item.size} className="flex flex-col items-center gap-1">
                <RatingFace score={3} variant="default" size={item.size} />
                <span className="text-caption-1-medium text-teal-gray-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Interactive (선택 = filled, 미선택 = neutral)">
          <div className="flex items-center gap-6">
            {SCORES.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setSelected(score)}
                className="flex cursor-pointer flex-col items-center gap-1"
              >
                <RatingFace
                  score={score}
                  variant={selected === score ? "filled" : "neutral"}
                  size="lg"
                  className="transition-transform hover:scale-110"
                />
                <ScoreLabel score={score} />
              </button>
            ))}
          </div>
          <p className="text-body-2-medium text-teal-gray-600">
            선택된 점수: {selected ?? "없음"}
          </p>
        </Section>
      </div>
    </main>
  )
}
