import { useState } from "react"

import { cn } from "@/shared/lib/utils"

import type {
  InterviewContent,
  InterviewQuestionBlock,
} from "../../model/applicationDetail"

interface InterviewAnswerCardsProps {
  content: InterviewContent
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "text-teal-gray-400 transition-transform",
        expanded ? "" : "-rotate-90",
      )}
    >
      <path
        d="M6 9.5 12 15l6-5.5"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function InterviewBlockCard({ block }: { block: InterviewQuestionBlock }) {
  const [expanded, setExpanded] = useState(true)
  const hasMeta = Boolean(block.timestampLabel || block.totalCountLabel)

  return (
    <section className="border-teal-gray-100 flex flex-col rounded-[16px] border bg-white p-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="text-heading-6-semibold text-teal-gray-800">
            {block.title}
          </h3>
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={`${block.title} 펼치기 접기`}
            onClick={() => setExpanded((prev) => !prev)}
            className="text-teal-gray-400 hover:text-teal-gray-600 flex size-6.5 shrink-0 items-center justify-center"
          >
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
        {hasMeta && (
          <div className="text-body-2-regular text-teal-gray-500 flex items-center gap-2">
            {block.timestampLabel && <span>{block.timestampLabel}</span>}
            {block.timestampLabel && block.totalCountLabel && (
              <span className="text-teal-gray-300">|</span>
            )}
            {block.totalCountLabel && <span>{block.totalCountLabel}</span>}
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-5 flex flex-col gap-6">
          <ol className="flex flex-col gap-3">
            {block.questions.map((question, index) => (
              <li
                key={question.text}
                className="text-body-1-regular text-teal-gray-800 flex gap-2"
              >
                <span className="text-teal-gray-500 shrink-0">
                  {index + 1}.
                </span>
                <span>{question.text}</span>
              </li>
            ))}
          </ol>

          <div
            className={cn(
              "flex flex-col gap-4",
              block.answers.length === 0 && "hidden",
            )}
          >
            <h4 className="text-heading-7-semibold text-teal-gray-800">
              지원자 답변
            </h4>
            {block.answers.map((answer) => (
              <div key={answer.sessionLabel} className="flex flex-col gap-2">
                <div className="text-body-2-medium text-teal-gray-700 flex items-center gap-2">
                  <span>면접자: {answer.sessionLabel}</span>
                  {answer.submittedAt && (
                    <>
                      <span className="text-teal-gray-300">|</span>
                      <span className="text-teal-gray-500">
                        {answer.submittedAt}
                      </span>
                    </>
                  )}
                </div>
                <div className="border-teal-gray-100 rounded-[12px] border bg-white px-5 py-4">
                  <p className="text-body-1-regular text-teal-gray-900 whitespace-pre-wrap">
                    {answer.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export function InterviewAnswerCards({ content }: InterviewAnswerCardsProps) {
  return (
    <div className="flex flex-col gap-5">
      {content.blocks.map((block) => (
        <InterviewBlockCard key={block.group} block={block} />
      ))}
    </div>
  )
}
