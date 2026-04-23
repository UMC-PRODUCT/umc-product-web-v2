import React, { type ReactNode, useState } from "react"

import { cn } from "@/shared/lib/utils"

import { OptionButtonGroupContext } from "./context"
import { OptionButton, type SegmentedPositionInfo } from "./OptionButton"

interface OptionButtonGroupProps {
  type?: "single"
  variant?: "separate" | "segmented"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
  allowDeselect?: boolean
  orientation?: "horizontal" | "vertical"
  className?: string
  children: ReactNode
}

export function OptionButtonGroup({
  type: _type = "single",
  variant = "separate",
  value: controlledValue,
  defaultValue,
  onValueChange,
  allowDeselect = false,
  orientation = "horizontal",
  className,
  children,
}: OptionButtonGroupProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  )

  const currentValue = isControlled ? controlledValue : internalValue

  const handleSelect = (value: string) => {
    const next = allowDeselect && currentValue === value ? undefined : value
    setInternalValue(next)
    onValueChange?.(next)
  }

  const resolvedChildren =
    variant === "segmented"
      ? resolveSegmentedChildren(children, currentValue)
      : children

  return (
    <OptionButtonGroupContext.Provider
      value={{ value: currentValue, onSelect: handleSelect, variant }}
    >
      <div
        role="radiogroup"
        aria-orientation={orientation}
        className={cn(
          variant === "separate"
            ? cn(
                "flex flex-wrap gap-2",
                orientation === "vertical" && "flex-col",
              )
            : "flex",
          className,
        )}
      >
        {resolvedChildren}
      </div>
    </OptionButtonGroupContext.Provider>
  )
}

function resolveSegmentedChildren(
  children: ReactNode,
  currentValue: string | undefined,
): ReactNode {
  const validChildren = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<React.ComponentProps<typeof OptionButton>> =>
      React.isValidElement(c),
  )

  const total = validChildren.length
  const values = validChildren.map((c) => c.props.value ?? "")
  const selectedIdx =
    currentValue !== undefined ? values.indexOf(currentValue) : -1

  return validChildren.map((child, i) => {
    const isFirst = i === 0
    const isLast = i === total - 1
    const s = selectedIdx

    const showLeft = s === -1 ? true : isFirst || i < s
    const showRight = s === -1 ? true : isLast || i > s

    const segmentedInfo: SegmentedPositionInfo = {
      isFirst,
      isLast,
      showLeft,
      showRight,
    }

    return React.cloneElement(child, { _segmentedInfo: segmentedInfo })
  })
}
