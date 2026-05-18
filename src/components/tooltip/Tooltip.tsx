import { cva } from "class-variance-authority"
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/utils"

const tooltipContentVariants = cva("rounded-[6px] relative text-center", {
  variants: {
    size: {
      big: "w-[221px] min-h-[52px] py-2 px-3 text-body-2-medium break-keep",
      small: "py-1 px-2 text-caption-2-medium whitespace-nowrap",
    },
    dark: {
      true: "bg-teal-gray-500 text-white",
      false: "bg-white text-teal-gray-600",
    },
  },
  defaultVariants: {
    size: "big",
    dark: true,
  },
})

const ARROW_SIZE = {
  big: { width: 16, height: 8 },
  small: { width: 10, height: 6 },
} as const

const ARROW_FILL = {
  dark: "#6f7878",
  light: "#ffffff",
} as const

type Side = "top" | "bottom" | "left" | "right"

function computePosition(
  rect: DOMRect,
  side: Side,
  sideOffset: number,
  size: "big" | "small",
): CSSProperties {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const base: CSSProperties = { position: "fixed", zIndex: 9999 }

  switch (side) {
    case "top":
      return {
        ...base,
        left: cx,
        top: rect.top - sideOffset,
        transform: "translateX(-50%) translateY(-100%)",
      }
    case "bottom":
      return {
        ...base,
        left: cx,
        top: rect.bottom + sideOffset,
        transform: "translateX(-50%)",
      }
    case "left":
      return {
        ...base,
        left: rect.left - sideOffset,
        top: size === "big" ? cy - 18 - ARROW_SIZE.big.width / 2 : cy,
        transform:
          size === "big"
            ? "translateX(-100%)"
            : "translateX(-100%) translateY(-50%)",
      }
    case "right":
      return {
        ...base,
        left: rect.right + sideOffset,
        top: size === "big" ? cy - 18 - ARROW_SIZE.big.width / 2 : cy,
        ...(size !== "big" && { transform: "translateY(-50%)" }),
      }
  }
}

function TooltipArrow({
  size,
  dark,
  side,
}: {
  size: "big" | "small"
  dark: boolean
  side: Side
}) {
  const { width, height } = ARROW_SIZE[size]
  const fill = dark ? ARROW_FILL.dark : ARROW_FILL.light
  const isVertical = side === "top" || side === "bottom"
  const svgW = isVertical ? width : height
  const svgH = isVertical ? height : width

  const pathData = {
    top: `M 0 0 L ${svgW / 2} ${svgH} L ${svgW} 0 Z`,
    bottom: `M 0 ${svgH} L ${svgW / 2} 0 L ${svgW} ${svgH} Z`,
    left: `M 0 0 L ${svgW} ${svgH / 2} L 0 ${svgH} Z`,
    right: `M ${svgW} 0 L 0 ${svgH / 2} L ${svgW} ${svgH} Z`,
  }[side]

  const style: CSSProperties = {
    position: "absolute",
    ...(side === "top" && {
      bottom: -svgH + 1,
      left: "50%",
      transform: "translateX(-50%)",
    }),
    ...(side === "bottom" && {
      top: -svgH + 1,
      left: "50%",
      transform: "translateX(-50%)",
    }),
    ...(side === "left" &&
      (size === "big"
        ? { right: -svgW + 1, top: 18 }
        : { right: -svgW + 1, top: "50%", transform: "translateY(-50%)" })),
    ...(side === "right" &&
      (size === "big"
        ? { left: -svgW + 1, top: 18 }
        : { left: -svgW + 1, top: "50%", transform: "translateY(-50%)" })),
  }

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={style}
    >
      <path d={pathData} fill={fill} />
    </svg>
  )
}

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  size?: "big" | "small"
  dark?: boolean
  side?: Side
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  sideOffset?: number
  delayDuration?: number
  autoHideDuration?: number
  hoverOnly?: boolean
  className?: string
  triggerClassName?: string
}

export function Tooltip({
  content,
  children,
  size = "big",
  dark = true,
  side = "top",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  sideOffset = 4,
  delayDuration = 100,
  autoHideDuration,
  hoverOnly = false,
  className,
  triggerClassName,
}: TooltipProps) {
  const tooltipId = useId()
  const isControlled = controlledOpen !== undefined

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [position, setPosition] = useState<CSSProperties>({})
  const isOpen = isControlled ? controlledOpen : internalOpen

  const triggerRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [pinned, setPinned] = useState(false)

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      setPosition(
        computePosition(
          triggerRef.current.getBoundingClientRect(),
          side,
          sideOffset,
          size,
        ),
      )
    }
  }, [side, sideOffset])

  const handleOpen = useCallback(() => {
    if (pinned) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      updatePosition()
      if (!isControlled) setInternalOpen(true)
      onOpenChange?.(true)
    }, delayDuration)
  }, [pinned, delayDuration, isControlled, onOpenChange, updatePosition])

  const handleClose = useCallback(() => {
    if (pinned) return
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [pinned, isControlled, onOpenChange])

  const handleClick = useCallback(() => {
    if (pinned) {
      setPinned(false)
      if (!isControlled) setInternalOpen(false)
      onOpenChange?.(false)
    } else {
      updatePosition()
      setPinned(true)
      if (!isControlled) setInternalOpen(true)
      onOpenChange?.(true)
    }
  }, [pinned, isControlled, onOpenChange, updatePosition])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isOpen || !autoHideDuration) return
    autoHideTimerRef.current = setTimeout(() => {
      setPinned(false)
      if (!isControlled) setInternalOpen(false)
      onOpenChange?.(false)
    }, autoHideDuration)
    return () => {
      if (autoHideTimerRef.current) clearTimeout(autoHideTimerRef.current)
    }
  }, [isOpen, autoHideDuration, isControlled, onOpenChange])

  useLayoutEffect(() => {
    if (!isOpen) return
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [isOpen, updatePosition])

  return (
    <>
      <span
        ref={triggerRef}
        className={cn("inline-block", triggerClassName)}
        aria-describedby={isOpen ? tooltipId : undefined}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
        onClick={hoverOnly ? undefined : handleClick}
      >
        {children}
      </span>
      {isOpen &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={position}
            className={cn(
              tooltipContentVariants({ size, dark }),
              !dark && "shadow-tooltip-light",
              className,
            )}
          >
            {content}
            <TooltipArrow size={size} dark={dark} side={side} />
          </div>,
          document.body,
        )}
    </>
  )
}
