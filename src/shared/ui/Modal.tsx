import { Dialog } from "radix-ui"
import { createContext, forwardRef, useContext } from "react"

import { cn } from "@/shared/lib/utils"
import {
  type DimmedToneProps,
  dimmedToneVariants,
} from "@/shared/ui/modal/dimmedStyles"

const ModalLayerContext = createContext(0)

function useModalLayer() {
  return useContext(ModalLayerContext)
}

type ModalRootProps = React.ComponentPropsWithoutRef<typeof Dialog.Root>

function ModalRoot({ children, ...props }: ModalRootProps) {
  // 모달은 부모 레이어 + 1로 계산해 중첩 모달의 stack 순서를 보장함.
  const parentLayer = useModalLayer()
  const layer = parentLayer + 1

  return (
    <ModalLayerContext.Provider value={layer}>
      <Dialog.Root {...props}>{children}</Dialog.Root>
    </ModalLayerContext.Provider>
  )
}

type ModalPortalProps = React.ComponentPropsWithoutRef<typeof Dialog.Portal>

function ModalPortal({ children, ...props }: ModalPortalProps) {
  const container =
    typeof document === "undefined"
      ? undefined
      : (document.getElementById("modal-root") ?? undefined)

  return (
    <Dialog.Portal container={container} {...props}>
      {children}
    </Dialog.Portal>
  )
}

type ModalOverlayProps = React.ComponentPropsWithoutRef<typeof Dialog.Overlay> &
  DimmedToneProps

const ModalOverlay = forwardRef<HTMLDivElement, ModalOverlayProps>(
  ({ tone, className, style, ...props }, ref) => {
    const layer = useModalLayer()
    return (
      <Dialog.Overlay
        ref={ref}
        data-layer={layer}
        className={cn(dimmedToneVariants({ tone }), className)}
        style={{ zIndex: 1000 + layer, ...style }}
        {...props}
      />
    )
  },
)

ModalOverlay.displayName = "ModalOverlay"

type ModalContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content>

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, style, ...props }, ref) => {
    const layer = useModalLayer()
    return (
      <Dialog.Content
        ref={ref}
        data-layer={layer}
        className={cn(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          className,
        )}
        style={{ zIndex: 1001 + layer, ...style }}
        {...props}
      />
    )
  },
)

ModalContent.displayName = "ModalContent"

export const Modal = {
  Root: ModalRoot,
  Trigger: Dialog.Trigger,
  Close: Dialog.Close,
  Portal: ModalPortal,
  Overlay: ModalOverlay,
  Content: ModalContent,
  Title: Dialog.Title,
  Description: Dialog.Description,
}
