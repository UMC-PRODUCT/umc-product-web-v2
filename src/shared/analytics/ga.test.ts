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
    expect(window.dataLayer).toContainEqual([
      "config",
      "G-TEST1234",
      { send_page_view: false },
    ])
    expect(window.dataLayer).toContainEqual([
      "event",
      "project_card_click",
      { project_id: 1 },
    ])
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

    expect(window.dataLayer).toContainEqual([
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
