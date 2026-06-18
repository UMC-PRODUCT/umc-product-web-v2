import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("ga analytics", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    document.head.innerHTML = ""
    window.dataLayer = undefined
    window.gtag = undefined
    window.history.pushState({}, "", "/matching/projects?tab=all")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("measurement id가 없으면 이벤트를 전송하지 않는다", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "")
    const { trackEvent } = await import("./ga")

    trackEvent("project_card_click", { project_id: 1 })

    expect(window.dataLayer).toBeUndefined()
    expect(document.querySelector("#ga4-script")).toBeNull()
  })

  it("measurement id가 있으면 gtag config와 이벤트를 dataLayer에 쌓는다", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST1234")
    const { trackEvent } = await import("./ga")

    trackEvent("project_card_click", { project_id: 1 })

    expect(document.querySelector("#ga4-script")).not.toBeNull()
    const commands = (window.dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    )
    expect(commands).toContainEqual([
      "config",
      "G-TEST1234",
      { send_page_view: false },
    ])
    expect(commands).toContainEqual([
      "event",
      "project_card_click",
      { project_id: 1 },
    ])
  })

  it("gtag 명령을 배열이 아닌 arguments 객체로 push 한다", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST1234")
    const { trackEvent } = await import("./ga")

    trackEvent("project_card_click", { project_id: 1 })

    const firstCommand = window.dataLayer?.[0]
    expect(Array.isArray(firstCommand)).toBe(false)
    expect(Object.prototype.toString.call(firstCommand)).toBe(
      "[object Arguments]",
    )
  })

  it("api path query와 식별자 segment를 정리한다", async () => {
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST1234")
    const { trackApiRequest } = await import("./ga")

    trackApiRequest({
      method: "get",
      path: "/v1/projects/123?keyword=secret",
      status: 200,
      durationMs: 420,
      success: true,
    })

    const commands = (window.dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    )
    expect(commands).toContainEqual([
      "event",
      "api_request",
      {
        method: "GET",
        path: "/v1/projects/:id",
        status: 200,
        duration_ms: 420,
        duration_bucket: "300ms_1s",
        page_path: "/matching/projects",
        success: true,
      },
    ])
  })
})
