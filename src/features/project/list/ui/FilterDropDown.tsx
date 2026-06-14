import FilterDropDownIcon from "@/shared/assets/icon/chevron/FilterDropDownIcon"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"

type FilterDropdownOption = {
  value: string
  label: string
}

type FilterDropdownBaseProps = {
  label: string
  open?: boolean
  onClick?: () => void
  className?: string
  options?: FilterDropdownOption[]
  selectedLabel?: string
  onSelect?: (value: string) => void
  dropdownClassName?: string
  onRequestClose?: () => void
}

export type FilterDropdownProps = FilterDropdownBaseProps &
  (
    | {
        multiSelect?: false
        selectedValue?: string
        selectedValues?: never
        allValue?: never
      }
    | {
        multiSelect: true
        selectedValues: string[]
        allValue?: string
      }
  )

function ChevronIcon({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "text-teal-gray-700 flex h-5 w-5 shrink-0 items-center justify-center",
        active && "text-teal-500",
      )}
    >
      <FilterDropDownIcon />
    </span>
  )
}

export function FilterDropdown(props: FilterDropdownProps) {
  const {
    label,
    open = false,
    onClick,
    className,
    options,
    selectedLabel,
    onSelect,
    dropdownClassName,
    onRequestClose,
  } = props
  const multiSelect = props.multiSelect === true
  const hasDropdown = Boolean(options?.length)

  const selectedValues =
    multiSelect && props.allValue !== undefined
      ? (props.selectedValues ?? []).filter((v) => v !== props.allValue)
      : multiSelect
        ? (props.selectedValues ?? [])
        : []
  const hasSelection = multiSelect
    ? selectedValues.length > 0
    : Boolean(props.selectedValue)
  const highlighted = open || hasSelection
  const displayLabel =
    selectedLabel ?? (multiSelect ? undefined : props.selectedValue) ?? label

  const handleSelect = (value: string) => {
    onSelect?.(value)
    if (!multiSelect) onRequestClose?.()
  }

  return (
    <div className="relative shrink-0">
      {/* 배경 클릭 시 드롭다운 닫기 */}
      {open && hasDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={onRequestClose}
          aria-hidden
        />
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={onClick}
        className={cn(
          "shadow-inner-neutral-2 inline-flex h-11 min-w-20 shrink-0 items-center gap-1 rounded-xl border py-0 pr-2.5 pl-4 text-left transition-colors",
          highlighted
            ? "border-teal-300 bg-teal-50 text-teal-600"
            : [
                "border-teal-gray-300 text-teal-gray-900 bg-white",
                "hover:bg-teal-gray-50",
              ],
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="text-body-2-medium truncate">{displayLabel}</span>
          <ChevronIcon active={highlighted} />
        </span>
      </button>

      {open && hasDropdown && (
        <div
          role="listbox"
          className={cn(
            "border-teal-gray-50 shadow-drop-neutral-1 absolute top-[calc(100%+0.5rem)] left-0 z-30 flex min-w-[max(100%,9.5rem)] flex-col rounded-lg border bg-white p-0.5",
            dropdownClassName,
          )}
        >
          {options?.map((option) => {
            const optionSelected = multiSelect
              ? props.allValue !== undefined && option.value === props.allValue
                ? selectedValues.length === 0
                : selectedValues.includes(option.value)
              : option.value === props.selectedValue

            return (
              <DropdownItem
                key={option.value}
                label={option.label}
                onClick={() => handleSelect(option.value)}
                isSelected={optionSelected}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
