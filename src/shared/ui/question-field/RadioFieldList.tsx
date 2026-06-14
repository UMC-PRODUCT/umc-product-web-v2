import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { cn } from "@/shared/lib/utils"

import { AddRadioOptionButton } from "../input/radio/AddRadioOptionButton"

interface RadioFieldListOption {
  content: string
  optionId?: number
}

interface RadioFieldListProps {
  options: RadioFieldListOption[]
  onOptionsChange: (options: RadioFieldListOption[]) => void
  className?: string
}

export function RadioFieldList({
  options,
  onOptionsChange,
  className,
}: RadioFieldListProps) {
  function updateOption(index: number, value: string) {
    onOptionsChange(
      options.map((opt, i) => (i === index ? { ...opt, content: value } : opt)),
    )
  }

  function addOption() {
    onOptionsChange([...options, { content: "" }])
  }

  function removeOption(index: number) {
    onOptionsChange(options.filter((_, i) => i !== index))
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-start gap-0.5 rounded-[12px] bg-white p-1",
        className,
      )}
    >
      {options.map((opt, i) => (
        <label
          key={i}
          className="hover:bg-teal-gray-50 flex w-full cursor-text items-center gap-3 rounded-[8px] p-2 transition-colors"
        >
          <span
            aria-hidden
            className="border-teal-gray-300 inline-flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white md:size-5"
          />
          <input
            type="text"
            value={opt.content}
            onChange={(e) => updateOption(i, e.target.value)}
            placeholder={`옵션 ${i + 1}`}
            className="text-body-2-regular text-teal-gray-700 placeholder:text-teal-gray-400 flex-1 bg-transparent outline-none"
          />
          <button
            type="button"
            onClick={() => removeOption(i)}
            aria-label="옵션 삭제"
            className="text-teal-gray-400 hover:text-teal-gray-600 shrink-0 transition-colors"
          >
            <CloseIcon className="size-4" />
          </button>
        </label>
      ))}
      <AddRadioOptionButton onAdd={addOption} />
    </div>
  )
}
