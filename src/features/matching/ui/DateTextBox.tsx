import { cn } from "@/shared/lib/utils"

interface DateTextBoxProps {
  label?: string
  value: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  onChange?: (value: string) => void
  className?: string
}

export function DateTextBox({
  label = "시작",
  value,
  placeholder = "YYYY-MM-DD",
  disabled = false,
  error = false,
  onChange,
  className,
}: DateTextBoxProps) {
  return (
    <div
      className={cn(
        "group flex h-11 w-[172px] items-center gap-2.5 rounded-[10px] border bg-white px-4",
        error
          ? "border-error-400"
          : disabled
            ? "border-teal-gray-200"
            : "border-teal-gray-200 focus-within:border-teal-300",
        className,
      )}
    >
      <span
        className={cn(
          "text-body-1-medium w-7 shrink-0",
          error
            ? "text-error-500"
            : value
              ? "text-teal-gray-500"
              : "text-teal-gray-400 group-focus-within:text-teal-gray-500",
        )}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "text-body-1-medium min-w-0 flex-1 bg-transparent focus:outline-none",
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
