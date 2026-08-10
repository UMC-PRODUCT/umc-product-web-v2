import { useEffect, useRef, useState } from "react"

import { cn } from "@/shared/lib/utils"

interface QuotaEditableCellProps {
  partName: string
  value: number
  maxAllowed?: number
  onChange: (newValue: number) => void
  onErrorExceeded?: (partName: string, maxAllowed: number) => void
  readOnly?: boolean
  className?: string
}

export function normalizeQuotaInput(
  previousValue: string,
  nextValue: string,
): string {
  const digitsOnly = nextValue.replace(/[^0-9]/g, "").slice(0, 4)

  if (previousValue === "0" && digitsOnly.length === 2) {
    const withoutExistingZero = digitsOnly.replace("0", "")
    if (withoutExistingZero.length === 1) return withoutExistingZero
  }

  return digitsOnly.replace(/^0+(?=\d)/, "")
}

export function QuotaEditableCell({
  partName,
  value,
  maxAllowed = 9999,
  onChange,
  onErrorExceeded,
  readOnly = false,
  className,
}: QuotaEditableCellProps) {
  const [inputValue, setInputValue] = useState(String(value))
  const [isFocused, setIsFocused] = useState(false)
  const prevIsErrorRef = useRef(false)

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const numValue = Number(inputValue || "0")

  const isInvalid = numValue > maxAllowed
  const isError = isInvalid

  useEffect(() => {
    if (isError && !prevIsErrorRef.current) {
      onErrorExceeded?.(partName, maxAllowed)
    }
    prevIsErrorRef.current = isError
  }, [isError, partName, maxAllowed, onErrorExceeded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalizedValue = normalizeQuotaInput(inputValue, e.target.value)
    setInputValue(normalizedValue)

    const parsed = normalizedValue === "" ? 0 : Number(normalizedValue)
    onChange(parsed)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (inputValue === "" || isNaN(Number(inputValue))) {
      setInputValue("0")
      onChange(0)
    }
  }

  const displayLength = inputValue === "" ? 1 : inputValue.length
  const charLength = Math.max(displayLength, 1)

  return (
    <div
      className={cn(
        "box-border flex h-full flex-1 items-center justify-center bg-white transition-colors",
        isError
          ? "bg-error-50 ring-error-400 ring-1 ring-inset"
          : isFocused
            ? "bg-teal-50 ring-1 ring-teal-400 ring-inset"
            : "",
        className,
      )}
    >
      <div className="flex items-center justify-center">
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={inputValue}
          aria-label={`${partName} TO`}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
          onFocus={readOnly ? undefined : handleFocus}
          onBlur={readOnly ? undefined : handleBlur}
          onChange={readOnly ? undefined : handleChange}
          style={{ width: `${charLength}ch` }}
          className={cn(
            "text-heading-6-semibold min-w-[1ch] bg-transparent text-right outline-none focus:outline-none",
            isError ? "text-error-500" : "text-teal-500",
            readOnly && "text-teal-gray-500 cursor-default",
          )}
        />
        <span
          className={cn(
            "text-subtitle-1-medium shrink-0 pl-px select-none",
            isError
              ? "text-error-400"
              : isFocused
                ? "text-teal-gray-500"
                : "text-teal-gray-400",
          )}
        >
          명
        </span>
      </div>
    </div>
  )
}
