import { useCallback, useEffect, useRef, useState } from "react"

import { FADE_OUT_DURATION, Toast } from "./Toast"
import { useToastStore } from "./useToastStore"

const MAX_VISIBLE = 3
const STACK_OFFSET = 8
const STACK_SCALE = 0.04

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore()
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set())
  const [remainingMap, setRemainingMap] = useState<Map<string, number>>(
    new Map(),
  )
  const dismissingRef = useRef(dismissingIds)
  dismissingRef.current = dismissingIds
  const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  // 새 토스트 등록 시 remainingMap 초기화
  useEffect(() => {
    toasts.forEach((toast) => {
      setRemainingMap((prev) => {
        if (prev.has(toast.id)) return prev
        const next = new Map(prev)
        next.set(toast.id, toast.duration)
        return next
      })
    })
  }, [toasts])

  const dismiss = useCallback(
    (id: string) => {
      if (dismissingRef.current.has(id)) return
      setDismissingIds((prev) => new Set([...prev, id]))
      const timer = setTimeout(() => {
        dismissTimers.current.delete(id)
        removeToast(id)
        setDismissingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        setRemainingMap((prev) => {
          const next = new Map(prev)
          next.delete(id)
          return next
        })
      }, FADE_OUT_DURATION)
      dismissTimers.current.set(id, timer)
    },
    [removeToast],
  )

  useEffect(() => {
    const timers = dismissTimers.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  // FIFO: MAX_VISIBLE 초과 시 가장 오래된 토스트 강제 dismiss
  useEffect(() => {
    const active = toasts.filter((t) => !dismissingIds.has(t.id))
    if (active.length > MAX_VISIBLE && active[0]) {
      dismiss(active[0].id)
    }
  }, [toasts, dismissingIds, dismiss])

  // 1초 단위 카운트다운 - 오래된 순서로 0에 도달
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMap((prev) => {
        const next = new Map(prev)
        let changed = false
        toasts.forEach((toast) => {
          if (dismissingRef.current.has(toast.id)) return
          const current = next.get(toast.id)
          if (current === undefined || current <= 0) return
          next.set(toast.id, Math.max(0, current - 1000))
          changed = true
        })
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [toasts])

  // remaining이 0에 도달하면 dismiss
  useEffect(() => {
    toasts.forEach((toast) => {
      const r = remainingMap.get(toast.id)
      if (r !== undefined && r <= 0 && !dismissingIds.has(toast.id)) {
        dismiss(toast.id)
      }
    })
  }, [remainingMap, toasts, dismissingIds, dismiss])

  // 최신 MAX_VISIBLE개 표시, newest가 front
  const visible = toasts.slice(-MAX_VISIBLE)

  /** 토스트가 없을 때도 고정 래퍼가 남으면 하단 중앙 400×50 영역이 투명 클릭 레이어가 됨 */
  if (visible.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
      aria-live="polite"
      aria-label="알림 목록"
    >
      <div
        className="pointer-events-none relative"
        style={{ height: "50px", width: "400px" }}
      >
        {visible.map((toast, i) => {
          const fromFront = visible.length - 1 - i
          const translateY = -fromFront * STACK_OFFSET
          const scale = 1 - fromFront * STACK_SCALE
          const zIndex = MAX_VISIBLE - fromFront
          const isFront = fromFront === 0

          return (
            <div
              key={toast.id}
              className="pointer-events-auto absolute bottom-0 left-0 origin-bottom transition-all duration-300"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                zIndex,
                animation: isFront ? "toast-shake 0.4s ease-in-out" : undefined,
              }}
            >
              <Toast
                message={toast.message}
                color={toast.color}
                variant={toast.variant}
                type={toast.type}
                remaining={remainingMap.get(toast.id) ?? toast.duration}
                isDismissing={dismissingIds.has(toast.id)}
                onDismiss={() => dismiss(toast.id)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
