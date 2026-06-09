import { useEffect, useRef } from "react"

import { cn } from "@/shared/lib/utils"
import { InputBox } from "@/shared/ui/input/InputBox"

import { EmojiScaleQuestion } from "./EmojiScaleQuestion"

import type { ChangeEvent } from "react"

import type { RatingScore } from "@/shared/assets/icon/emoji"

const REVEAL_MS = 450

export interface EmojiScaleWithTextQuestionProps {
  scores: RatingScore[]
  labels: string[]
  textPlaceholder: string
  scaleValue: RatingScore | null
  textValue: string
  onScaleChange: (score: RatingScore) => void
  onTextChange: (text: string) => void
  ariaLabel?: string
}

export const EmojiScaleWithTextQuestion = ({
  scores,
  labels,
  textPlaceholder,
  scaleValue,
  textValue,
  onScaleChange,
  onTextChange,
  ariaLabel,
}: EmojiScaleWithTextQuestionProps) => {
  const showText = scaleValue !== null
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showText) return
    const input = inputRef.current
    if (!input) return
    input.focus({ preventScroll: true })
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
    const timer = setTimeout(
      () => {
        input.scrollIntoView({
          block: "nearest",
          behavior: prefersReducedMotion ? "auto" : "smooth",
        })
      },
      prefersReducedMotion ? 0 : REVEAL_MS,
    )
    return () => clearTimeout(timer)
  }, [showText])

  return (
    <div className="flex w-full flex-col">
      <EmojiScaleQuestion
        ariaLabel={ariaLabel}
        scores={scores}
        labels={labels}
        value={scaleValue}
        onChange={onScaleChange}
      />
      <div
        aria-hidden={!showText}
        inert={!showText || undefined}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-450 ease-out motion-reduce:transition-none",
          showText
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex w-full justify-center pt-6">
            <InputBox
              ref={inputRef}
              value={textValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onTextChange(e.target.value)
              }
              placeholder={textPlaceholder}
              className="w-full max-w-75"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
