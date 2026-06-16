import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { trackEvent } from "@/shared/analytics"

import { useImageFallback } from "./useImageFallback"

vi.mock("@/shared/analytics", () => ({ trackEvent: vi.fn() }))

describe("useImageFallback", () => {
  it("src가 없으면 showFallback이 true다", () => {
    const { result } = renderHook(() =>
      useImageFallback(undefined, "project_logo"),
    )

    expect(result.current.showFallback).toBe(true)
  })

  it("src가 있으면 초기엔 false, handleError 후 fallback으로 전환하고 image_load_error를 보낸다", () => {
    const { result } = renderHook(() =>
      useImageFallback("https://cdn/logo.png", "project_thumbnail"),
    )

    expect(result.current.showFallback).toBe(false)

    act(() => {
      result.current.handleError()
    })

    expect(result.current.showFallback).toBe(true)
    expect(trackEvent).toHaveBeenCalledWith("image_load_error", {
      image_type: "project_thumbnail",
    })
  })
})
