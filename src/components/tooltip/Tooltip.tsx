import { cva } from "class-variance-authority"
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/utils"

const tooltipContentVariants = cva("rounded-[6px] relative text-center", {
  variants: {
    size: {
      big: "w-[221px] py-2 px-3 text-body-2-medium break-keep",
      small: "py-1 px-2 text-caption-2-medium",
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
        top: cy,
        transform: "translateX(-100%) translateY(-50%)",
      }
    case "right":
      return {
        ...base,
        left: rect.right + sideOffset,
        top: cy,
        transform: "translateY(-50%)",
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
      bottom: -svgH,
      left: "50%",
      transform: "translateX(-50%)",
    }),
    ...(side === "bottom" && {
      top: -svgH,
      left: "50%",
      transform: "translateX(-50%)",
    }),
    ...(side === "left" && {
      right: -svgW,
      top: "50%",
      transform: "translateY(-50%)",
    }),
    ...(side === "right" && {
      left: -svgW,
      top: "50%",
      transform: "translateY(-50%)",
    }),
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
}: TooltipProps) {
  const isControlled = controlledOpen !== undefined

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [position, setPosition] = useState<CSSProperties>({})
  const isOpen = isControlled ? controlledOpen : internalOpen

  const triggerRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOpen = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        setPosition(
          computePosition(
            triggerRef.current.getBoundingClientRect(),
            side,
            sideOffset,
          ),
        )
      }
      if (!isControlled) setInternalOpen(true)
      onOpenChange?.(true)
    }, delayDuration)
  }, [side, sideOffset, delayDuration, isControlled, onOpenChange])

  const handleClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!isControlled) setInternalOpen(false)
    onOpenChange?.(false)
  }, [isControlled, onOpenChange])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onFocus={handleOpen}
        onBlur={handleClose}
      >
        {children}
      </span>
      {isOpen &&
        createPortal(
          <div
            style={position}
            className={cn(
              tooltipContentVariants({ size, dark }),
              !dark && "shadow-tooltip-light",
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
