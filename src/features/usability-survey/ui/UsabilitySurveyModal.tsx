import { Modal } from "@/shared/ui/Modal"

import { SurveyHeaderPill } from "./SurveyHeaderPill"

import type { ReactNode, Ref } from "react"

const CARD_BACKGROUND =
  "linear-gradient(292deg, rgba(34, 144, 132, 0.03) -16.53%, rgba(255, 255, 255, 0.1) 30.04%), linear-gradient(119deg, rgba(34, 144, 132, 0.05) 8.35%, rgba(255, 255, 255, 0.1) 46.69%), #FFF"

const SCROLL_FADE_PX = 42
const SCROLL_FADE_MASK = `linear-gradient(to bottom, transparent 0, #000 ${SCROLL_FADE_PX}px, #000 calc(100% - ${SCROLL_FADE_PX}px), transparent 100%)`

export interface UsabilitySurveyModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  children: ReactNode
  footer?: ReactNode
  preventClose?: boolean
  scrollRef?: Ref<HTMLDivElement>
}

export const UsabilitySurveyModal = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
  preventClose,
  scrollRef,
}: UsabilitySurveyModalProps) => {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay tone="light" />
        <Modal.Content
          aria-describedby={undefined}
          style={{ background: CARD_BACKGROUND }}
          className="flex max-h-[80vh] w-[calc(100%-2rem)] max-w-150 flex-col items-center rounded-[9.2px] border-[0.8px] border-white pt-13.5 pr-8 pb-9.5 pl-9.5 shadow-[0_4.6px_15.333px_0_#E4E4E4]"
          onEscapeKeyDown={
            preventClose ? (event) => event.preventDefault() : undefined
          }
          onInteractOutside={
            preventClose ? (event) => event.preventDefault() : undefined
          }
        >
          <SurveyHeaderPill />
          <Modal.Title className="text-heading-4-semibold text-teal-gray-900 text-center">
            {title}
          </Modal.Title>
          <div
            ref={scrollRef}
            className="scrollbar-none flex min-h-0 w-full flex-col gap-12 overflow-y-auto"
            style={{
              maskImage: SCROLL_FADE_MASK,
              WebkitMaskImage: SCROLL_FADE_MASK,
              paddingTop: SCROLL_FADE_PX,
              paddingBottom: SCROLL_FADE_PX,
              scrollPaddingTop: SCROLL_FADE_PX,
              scrollPaddingBottom: SCROLL_FADE_PX,
            }}
          >
            {children}
          </div>
          {footer && (
            <div className="flex w-full justify-end gap-2">{footer}</div>
          )}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
