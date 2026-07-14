import React, { type ReactNode, useState } from "react"

import { cn } from "@/shared/lib/utils"

import { OptionButtonGroupContext } from "./context"
import { OptionButton, type SegmentedPositionInfo } from "./OptionButton"

interface SingleProps {
  type?: "single"
  value?: string
  defaultValue?: string
  onValueChange?: (value: string | undefined) => void
  allowDeselect?: boolean
}

interface MultipleProps {
  type: "multiple"
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  allowDeselect?: never
}

type OptionButtonGroupProps = (SingleProps | MultipleProps) & {
  variant?: "separate" | "segmented"
  orientation?: "horizontal" | "vertical"
  className?: string
  children: ReactNode
}

export function OptionButtonGroup(props: OptionButtonGroupProps) {
  const {
    variant = "separate",
    orientation = "horizontal",
    className,
    children,
  } = props

  const isMultiple = props.type === "multiple"

  // Single mode state
  const [internalSingle, setInternalSingle] = useState<string | undefined>(
    !isMultiple ? props.defaultValue : undefined,
  )

  // Multiple mode state
  const [internalMultiple, setInternalMultiple] = useState<string[]>(
    isMultiple ? (props.defaultValue ?? []) : [],
  )

  const currentValue = isMultiple
    ? (props.value ?? internalMultiple)
    : (props.value ?? internalSingle)

  const handleSelect = (value: string) => {
    if (isMultiple) {
      const prev = (props.value ?? internalMultiple) as string[]
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
      setInternalMultiple(next)
      ;(props.onValueChange as ((v: string[]) => void) | undefined)?.(next)
    } else {
      const prev = (props.value ?? internalSingle) as string | undefined
      const next =
        (props as SingleProps).allowDeselect && prev === value
          ? undefined
          : value
      setInternalSingle(next)
      ;(props.onValueChange as ((v: string | undefined) => void) | undefined)?.(
        next,
      )
    }
  }

  const resolvedChildren =
    variant === "segmented"
      ? resolveSegmentedChildren(children, currentValue)
      : children

  const segmentedRadius =
    variant === "segmented" ? getSegmentedContainerRadius(children) : ""

  return (
    <OptionButtonGroupContext.Provider
      value={{
        type: isMultiple ? "multiple" : "single",
        value: currentValue,
        onSelect: handleSelect,
        variant,
      }}
    >
      <div
        role={isMultiple ? "group" : "radiogroup"}
        aria-orientation={orientation}
        className={cn(
          variant === "separate"
            ? cn(
                "flex flex-wrap gap-2",
                orientation === "vertical" && "flex-col",
              )
            : cn("bg-teal-gray-150 flex w-fit items-center", segmentedRadius),
          className,
        )}
      >
        {resolvedChildren}
      </div>
    </OptionButtonGroupContext.Provider>
  )
}

function getSegmentedContainerRadius(children: ReactNode): string {
  const first = React.Children.toArray(children).find(React.isValidElement) as
    | React.ReactElement<React.ComponentProps<typeof OptionButton>>
    | undefined
  const size = first?.props.size ?? "sm"
  return size === "xs" ? "rounded-[6px]" : "rounded-[8px]"
}

function resolveSegmentedChildren(
  children: ReactNode,
  currentValue: string | string[] | undefined,
): ReactNode {
  const validChildren = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<React.ComponentProps<typeof OptionButton>> =>
      React.isValidElement(c),
  )

  const total = validChildren.length
  const values = validChildren.map((c) => c.props.value ?? "")

  const isMultiple = Array.isArray(currentValue)

  const selectedAt = (i: number) => {
    const v = values[i] ?? ""
    return isMultiple
      ? (currentValue as string[]).includes(v)
      : v === currentValue
  }

  return validChildren.map((child, i) => {
    const isFirst = i === 0
    const isLast = i === total - 1
    const gapLeft = i > 0 && !selectedAt(i) && !selectedAt(i - 1)

    const segmentedInfo: SegmentedPositionInfo = {
      isFirst,
      isLast,
      gapLeft,
    }

    return React.cloneElement(child, { _segmentedInfo: segmentedInfo })
  })
}
