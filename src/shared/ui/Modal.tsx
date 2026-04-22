import { Dialog } from "radix-ui"
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { cn } from "@/shared/lib/utils"
import {
  type DimmedToneProps,
  dimmedToneVariants,
} from "@/shared/ui/modal/dimmedStyles"

const ModalLayerContext = createContext(0)

const modalLayers: number[] = []
let nextModalLayer = 1

function registerModalLayer() {
  const layer = nextModalLayer++
  modalLayers.push(layer)
  return layer
}

function unregisterModalLayer(layer: number) {
  const index = modalLayers.indexOf(layer)
  if (index >= 0) modalLayers.splice(index, 1)
}

function useModalLayer() {
  return useContext(ModalLayerContext)
}

type ModalRootProps = React.ComponentPropsWithoutRef<typeof Dialog.Root>

function ModalRoot({ children, ...props }: ModalRootProps) {
  const [layer] = useState(() => registerModalLayer())

  useEffect(() => {
    return () => unregisterModalLayer(layer)
  }, [layer])

  const contextValue = useMemo(() => layer, [layer])

  return (
    <ModalLayerContext.Provider value={contextValue}>
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
