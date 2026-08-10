import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { cn } from "@/shared/lib/utils"

// 체크박스(사각)/라디오(원형)는 마커 모양만 다르고 옵션 목록 편집 동작은 동일하다.
type OptionMarkerType = "checkbox" | "radio"

const MARKER_SHAPE: Record<OptionMarkerType, string> = {
  checkbox: "rounded-[6px]",
  radio: "rounded-full",
}

function OptionMarker({ type }: { type: OptionMarkerType }) {
  return (
    <span
      aria-hidden
      className={cn(
        "border-teal-gray-300 inline-flex size-5 shrink-0 items-center justify-center border-[1.5px] bg-white",
        MARKER_SHAPE[type],
      )}
    />
  )
}

interface OptionFieldListOption {
  content: string
  optionId?: number
}

interface OptionFieldListProps {
  type: OptionMarkerType
  options: OptionFieldListOption[]
  onOptionsChange: (options: OptionFieldListOption[]) => void
  className?: string
}

export function OptionFieldList({
  type,
  options,
  onOptionsChange,
  className,
}: OptionFieldListProps) {
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
          <OptionMarker type={type} />
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
      <button
        type="button"
        onClick={addOption}
        className="hover:bg-teal-gray-50 inline-flex items-center gap-3 rounded-[8px] p-2 transition-colors"
      >
        <OptionMarker type={type} />
        <span className="text-body-2-regular text-teal-gray-400">
          옵션 추가
        </span>
      </button>
    </div>
  )
}
