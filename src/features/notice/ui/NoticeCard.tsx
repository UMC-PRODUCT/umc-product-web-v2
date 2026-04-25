import { cva, type VariantProps } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  useId,
  useState,
} from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import WarningTriangleIcon from "@/shared/assets/icon/infomation/WarningTriangleIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"

const noticeCardVariants = cva(
  "flex w-full items-center justify-between gap-2.5 px-4 text-left",
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
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
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
  expanded,
  onExpandedChange,
  onDelete,
  onEdit,
  onClick,
  type = "button",
  ...props
}: NoticeCardProps) {
  const contentId = useId()
  const [internalExpanded, setInternalExpanded] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const isExpanded = expanded ?? internalExpanded

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const nextExpanded = !isExpanded

    if (expanded === undefined) {
      setInternalExpanded(nextExpanded)
    }

    onExpandedChange?.(nextExpanded)
    onClick?.(event)
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false)
    onDelete?.()
  }

  return (
    <div className="w-full">
      <button
        type={type}
        aria-expanded={isExpanded}
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
            isExpanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {children && isExpanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden pb-4"
          >
            <div
              id={contentId}
              className="shadow-inner-neutral-2 bg-teal-gray-50 text-teal-gray-900 rounded-[12px] px-8 pt-6 pb-7.5"
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
                    onClick={handleDeleteClick}
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

      <Modal.Root open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="light" />
          <Modal.Content className="shadow-drop-neutral-1 flex w-[460px] max-w-[calc(100vw-32px)] flex-col gap-8 rounded-[9.2px] border border-neutral-200 bg-white px-6 py-6 focus:outline-none">
            <div className="flex flex-col items-start gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <WarningTriangleIcon className="h-6 w-6 text-teal-500" />
                <Modal.Title className="text-subtitle-1-semibold text-teal-500">
                  공지 삭제
                </Modal.Title>
              </div>
              <Modal.Description className="text-subtitle-3-semibold text-teal-gray-800">
                삭제한 공지는 복구할 수 없습니다.
                <br />
                삭제하시겠습니까?
              </Modal.Description>
            </div>

            <div className="flex w-full justify-end gap-3">
              <Modal.Close asChild>
                <Button
                  type="button"
                  variant="weak"
                  color="neutral"
                  size="s"
                  className="rounded-[10px]"
                >
                  취소
                </Button>
              </Modal.Close>
              {/* TODO: 삭제 API 연동하기 */}
              <Button
                type="button"
                variant="fill"
                color="primary"
                size="s"
                className="rounded-[10px]"
                onClick={handleDeleteConfirm}
              >
                삭제
              </Button>
            </div>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>
    </div>
  )
}
