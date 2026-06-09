import { useEffect, useRef } from "react"

import { cn } from "@/shared/lib/utils"

import { isItemAnswered } from "../model/types"
import { QuestionField } from "./QuestionField"
import { QuestionHeader } from "./QuestionHeader"
import { SectionDivider } from "./SectionDivider"

import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyItem,
  SurveyRevealMode,
} from "../model/types"

export type { SurveyAnswers, SurveyAnswerValue } from "../model/types"

const REVEAL_DURATION = "duration-[1500ms]"
const REVEAL_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]"
const SLOW_SCROLL_MS = 1500

const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
  let node = el?.parentElement ?? null
  while (node) {
    const overflowY = getComputedStyle(node).overflowY
    if (overflowY === "auto" || overflowY === "scroll") return node
    node = node.parentElement
  }
  return null
}

const animateScrollToBottom = (
  container: HTMLElement,
  durationMs: number,
): (() => void) => {
  const maxTop = () => container.scrollHeight - container.clientHeight
  const prefersReducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false

  if (prefersReducedMotion || durationMs <= 0) {
    container.scrollTop = maxTop()
    return () => {}
  }

  let rafId = 0
  const startTime = performance.now()
  const startTop = container.scrollTop

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startTime) / durationMs)
    const eased =
      progress < 0.5
        ? 4 * progress ** 3
        : 1 - Math.pow(-2 * progress + 2, 3) / 2
    container.scrollTop = startTop + (maxTop() - startTop) * eased
    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      container.scrollTop = maxTop()
    }
  }
  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}

interface SurveyQuestionListProps {
  items: SurveyItem[]
  answers: SurveyAnswers
  onAnswer: (id: string, value: SurveyAnswerValue) => void
  startNumber?: number
  reveal?: SurveyRevealMode
}

interface NumberedItem {
  item: SurveyItem
  number: number
}

export const SurveyQuestionList = ({
  items,
  answers,
  onAnswer,
  startNumber = 1,
  reveal,
}: SurveyQuestionListProps) => {
  const trailingRef = useRef<HTMLDivElement>(null)

  let runningNumber = startNumber
  const numbered: NumberedItem[] = items.map((item) => {
    if (item.kind === "divider") return { item, number: 0 }
    const number = runningNumber
    runningNumber += 1
    return { item, number }
  })

  const lastRequiredIndex = items.reduce(
    (last, item, index) =>
      item.kind !== "divider" && !item.optional ? index : last,
    -1,
  )
  const leading = numbered.slice(0, lastRequiredIndex + 1)
  const trailing = numbered.slice(lastRequiredIndex + 1)
  const revealed =
    reveal === "optional-group" &&
    leading.every((entry) => isItemAnswered(entry.item, answers))

  useEffect(() => {
    if (!revealed) return
    const container = getScrollParent(trailingRef.current)
    if (!container) return
    return animateScrollToBottom(container, SLOW_SCROLL_MS)
  }, [revealed])

  const renderItem = ({ item, number }: NumberedItem) => {
    if (item.kind === "divider") {
      return <SectionDivider label={item.label} />
    }
    return (
      <div className="flex w-full flex-col gap-3">
        <QuestionHeader number={number} question={item.text} />
        <QuestionField question={item} answers={answers} onAnswer={onAnswer} />
      </div>
    )
  }

  if (reveal === "optional-group") {
    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col gap-12">
          {leading.map((entry) => (
            <div key={entry.item.id}>{renderItem(entry)}</div>
          ))}
        </div>

        {trailing.length > 0 && (
          <div
            ref={trailingRef}
            aria-hidden={!revealed}
            inert={!revealed || undefined}
            className={cn(
              "grid",
              revealed ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div
                className={cn(
                  "flex flex-col gap-12 pt-12 transition-[transform,opacity] motion-reduce:transition-none",
                  REVEAL_DURATION,
                  REVEAL_EASE,
                  revealed
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0",
                )}
              >
                {trailing.map((entry) => (
                  <div
                    key={entry.item.id}
                    className={
                      entry.item.kind === "divider" ? "-mb-2" : undefined
                    }
                  >
                    {renderItem(entry)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-12">
      {numbered.map((entry) => (
        <div key={entry.item.id}>{renderItem(entry)}</div>
      ))}
    </div>
  )
}
