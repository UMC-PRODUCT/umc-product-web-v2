import FilterDropDownIcon from "@/shared/assets/icon/chevron/FilterDropDownIcon"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"

import type { ReactNode } from "react"

export type FilterDropdownOption = {
  value: string
  label: string
}

type FilterDropdownBaseProps = {
  label: string
  open?: boolean
  onClick?: () => void
  className?: string
  options?: readonly FilterDropdownOption[]
  selectedLabel?: string
  dropdownClassName?: string
  onRequestClose?: () => void
}

type SingleSelectFilterDropdownProps = {
  multiSelect?: false
  selectedValue?: string
  onSelect?: (value: string) => void
  selectedValues?: never
  onSelectedValuesChange?: never
  allValue?: never
  formatSelectedLabel?: never
}

interface MultiSelectFilterDropdownProps {
  multiSelect: true
  selectedValues: readonly string[]
  onSelectedValuesChange: (values: string[]) => void
  allValue?: string
  formatSelectedLabel?: (
    selectedOptions: readonly FilterDropdownOption[],
  ) => ReactNode
  selectedValue?: never
  onSelect?: never
}

export type FilterDropdownProps = FilterDropdownBaseProps &
  (SingleSelectFilterDropdownProps | MultiSelectFilterDropdownProps)

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
    dropdownClassName,
    onRequestClose,
  } = props
  const multiSelect = props.multiSelect === true
  const hasDropdown = Boolean(options?.length)

  const selectedValues =
    multiSelect && props.allValue !== undefined
      ? props.selectedValues.filter((value) => value !== props.allValue)
      : multiSelect
        ? props.selectedValues
        : []
  const selectedOptions = multiSelect
    ? selectedValues.flatMap((value) => {
        const option = options?.find((candidate) => candidate.value === value)
        return option ? [option] : []
      })
    : []
  // 값이 "0" 인 옵션도 선택으로 본다. falsy 검사로 두면 id 나 인덱스를 값으로
  // 쓰는 필터가 붙었을 때 조용히 미선택 취급된다.
  const hasSingleSelection =
    !multiSelect && props.selectedValue != null && props.selectedValue !== ""
  const hasSelection = multiSelect
    ? selectedValues.length > 0
    : hasSingleSelection
  const highlighted = open || hasSelection
  const firstSelectedValue = selectedValues[0]
  const firstSelectedLabel =
    options?.find((option) => option.value === firstSelectedValue)?.label ??
    firstSelectedValue
  const defaultMultiSelectLabel =
    firstSelectedLabel === undefined
      ? undefined
      : selectedValues.length === 1
        ? firstSelectedLabel
        : `${firstSelectedLabel} 외 ${selectedValues.length - 1}`
  const formattedSelectedLabel =
    multiSelect && selectedOptions.length > 0
      ? props.formatSelectedLabel?.(selectedOptions)
      : undefined
  const selectedSingleLabel = hasSingleSelection
    ? (options?.find((option) => option.value === props.selectedValue)?.label ??
      props.selectedValue)
    : undefined
  const displayLabel =
    selectedLabel ??
    formattedSelectedLabel ??
    (multiSelect ? defaultMultiSelectLabel : selectedSingleLabel) ??
    label

  const handleSelect = (value: string) => {
    if (multiSelect) {
      const nextValues =
        props.allValue !== undefined && value === props.allValue
          ? []
          : selectedValues.includes(value)
            ? selectedValues.filter((selected) => selected !== value)
            : [...selectedValues, value]
      props.onSelectedValuesChange(nextValues)
      return
    }

    props.onSelect?.(value)
    onRequestClose?.()
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
          aria-multiselectable={multiSelect || undefined}
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
                role="option"
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
