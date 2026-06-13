interface ChangeEmailFormProps {
  onSuccess: () => void
  onBack: () => void
}

export function ChangeEmailForm({ onBack: _ }: ChangeEmailFormProps) {
  return (
    <div className="flex w-full max-w-100 flex-col items-start gap-11">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-heading-7-semibold text-teal-gray-900">
          이메일 변경
        </span>
      </div>
    </div>
  )
}
