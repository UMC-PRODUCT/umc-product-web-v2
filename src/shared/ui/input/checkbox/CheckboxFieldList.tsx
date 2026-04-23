import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { cn } from "@/shared/lib/utils"

import { AddOptionButton } from "./AddOptionButton"

interface CheckboxFieldListProps {
  options: string[]
  onOptionsChange: (options: string[]) => void
  className?: string
}

export function CheckboxFieldList({
  options,
  onOptionsChange,
  className,
}: CheckboxFieldListProps) {
  function updateOption(index: number, value: string) {
    onOptionsChange(options.map((opt, i) => (i === index ? value : opt)))
  }

  function addOption() {
    onOptionsChange([...options, ""])
  }

  function removeOption(index: number) {
    onOptionsChange(options.filter((_, i) => i !== index))
  }

  return (
    <div
      className={cn(
        "border-teal-gray-100 flex w-full flex-col items-start gap-0.5 rounded-[12px] border bg-white p-1",
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
            className="border-teal-gray-300 inline-flex size-4 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] bg-white md:size-5 md:rounded-[6px]"
          />
          <input
            type="text"
            value={opt}
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
      <AddOptionButton onAdd={addOption} />
    </div>
  )
}
