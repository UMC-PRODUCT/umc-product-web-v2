interface QuestionHeaderProps {
  number: number
  question: string
}

export const QuestionHeader = ({ number, question }: QuestionHeaderProps) => {
  return (
    <div className="flex w-full items-start gap-2.5">
      <span className="text-caption-1-medium mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-100 pt-0.5 font-semibold text-teal-600 shadow-[-1px_2.5px_4px_0_rgba(228,228,228,0.2)_inset]">
        {number}
      </span>
      <p className="text-heading-7-semibold flex-1 text-teal-700">{question}</p>
    </div>
  )
}
