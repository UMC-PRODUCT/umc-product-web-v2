interface SurveyHeaderPillProps {
  text?: string
}

export const SurveyHeaderPill = ({
  text = "UMC Matching System",
}: SurveyHeaderPillProps) => {
  return (
    <span className="text-subtitle-3-semibold text-teal-gray-50 border-b-teal-gray-100 absolute top-0 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2.5 rounded-full border-b bg-teal-800 px-4.5 py-1.75">
      {text}
    </span>
  )
}
