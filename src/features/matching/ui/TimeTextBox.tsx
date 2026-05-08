import { cn } from "@/shared/lib/utils"

interface TimeTextBoxProps {
  value: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  onChange?: (value: string) => void
  className?: string
}

export function TimeTextBox({
  value,
  placeholder = "00:00",
  disabled = false,
  error = false,
  onChange,
  className,
}: TimeTextBoxProps) {
  return (
    <div
      className={cn(
        "flex h-11 w-19 items-center justify-center rounded-[10px] border bg-white",
        error
          ? "border-error-400"
          : disabled
            ? "border-teal-gray-200"
            : "border-teal-gray-200 focus-within:border-teal-300",
        className,
      )}
    >
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "text-body-1-medium w-full bg-transparent text-center focus:outline-none",
          disabled
            ? "text-teal-gray-400 cursor-default"
            : value
              ? "text-teal-gray-800"
              : "text-teal-gray-400",
          "placeholder:text-teal-gray-400",
        )}
      />
    </div>
  )
}
