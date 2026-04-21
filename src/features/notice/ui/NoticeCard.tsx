import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  useId,
  useState,
} from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/SideBar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"

const noticeCardVariants = cva(
  "flex w-full items-center justify-between gap-2.5 rounded-[12px] bg-teal-gray-50 px-4 text-left",
  {
    variants: {
      hasChip: {
        true: "pt-4 pb-7",
        false: "py-7",
      },
    },
    defaultVariants: {
      hasChip: false,
    },
  },
)

const noticeTitleVariants = cva("text-heading-6-semibold", {
  variants: {
    variant: {
      default: "text-teal-gray-900",
      muted: "text-teal-gray-600",
      accent: "text-teal-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const noticeChevronVariants = cva("h-7.5 w-7.5 shrink-0", {
  variants: {
    variant: {
      default: "text-teal-gray-700",
      muted: "text-teal-gray-400",
      accent: "text-teal-gray-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface NoticeCardProps
  extends
    Omit<ComponentPropsWithoutRef<"button">, "className">,
    VariantProps<typeof noticeTitleVariants> {
  title: string
  date: string
  chip?: string
  children?: ReactNode
  canManage?: boolean
  onDelete?: () => void
  onEdit?: () => void
}

export function NoticeCard({
  title,
  date,
  chip,
  variant,
  children,
  canManage = false,
  onDelete,
  onEdit,
  onClick,
  type = "button",
  ...props
}: NoticeCardProps) {
  const contentId = useId()
  const [internalExpanded, setInternalExpanded] = useState(false)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setInternalExpanded((prev) => !prev)
    onClick?.(event)
  }

  return (
    <div className="w-full">
      <button
        type={type}
        aria-expanded={internalExpanded}
        aria-controls={children ? contentId : undefined}
        className={noticeCardVariants({ hasChip: !!chip })}
        onClick={handleClick}
        {...props}
      >
        <div className="flex flex-col">
          {/* TODO: 공용 칩 컴포넌트로 교체 */}
          {chip ? (
            <span className="shadow-drop-neutral-3 text-body-3-medium inline-flex w-fit items-center rounded-[6px] bg-teal-100 px-2.5 py-0.5 text-teal-600">
              필독
            </span>
          ) : null}

          <div className={cn("flex flex-col gap-2", chip && "pt-2.5")}>
            <span className={noticeTitleVariants({ variant })}>{title}</span>

            <span className="text-body-3-medium text-teal-gray-500">
              {date}
            </span>
          </div>
        </div>

        <DownChevronIcon
          aria-hidden="true"
          className={cn(
            noticeChevronVariants({ variant }),
            internalExpanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {children && internalExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden pb-4"
          >
            <div
              id={contentId}
              className="shadow-inner-neutral-2 bg-teal-gray-50 rounded-[12px] px-8 pt-6 pb-7.5"
            >
              {/* TODO: 공지 API 응답 형식에 맞추어 수정 */}
              {children}

              {canManage ? (
                <div className="flex items-center justify-end gap-2 pt-8">
                  <Button
                    type="button"
                    variant="weak"
                    color="neutral"
                    size="m"
                    onClick={onDelete}
                  >
                    삭제
                  </Button>
                  <Button
                    type="button"
                    variant="weak"
                    color="primary"
                    size="m"
                    onClick={onEdit}
                  >
                    수정
                  </Button>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
