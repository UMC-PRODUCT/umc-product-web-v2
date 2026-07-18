import { AxiosError } from "axios"
import { afterEach, describe, expect, it, vi } from "vitest"

import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios"

vi.mock("@/shared/analytics", () => ({
  getCurrentPagePath: () => "/",
  trackApiRequest: vi.fn(),
  trackEvent: vi.fn(),
}))

const TOKEN_RENEW_PATH = "/v1/auth/token/renew"

function createResponse<T>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T,
): AxiosResponse<T> {
  return {
    config,
    data,
    headers: {},
    status,
    statusText: status === 200 ? "OK" : "Unauthorized",
  }
}

function rejectUnauthorized(
  config: InternalAxiosRequestConfig,
): Promise<never> {
  const response = createResponse(config, 401, {
    success: false,
    message: "Unauthorized",
  })

  return Promise.reject(
    new AxiosError(
      "Unauthorized",
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      response,
    ),
  )
}

async function createSubject(
  adapter: AxiosAdapter,
  initialTokens: {
    accessToken: string | null
    refreshToken: string | null
  } = {
    accessToken: "expired-access",
    refreshToken: "expired-refresh",
  },
) {
  vi.resetModules()

  const { setAuthBridge } = await import("./authBridge")
  const { api } = await import("./axios")

  let { accessToken, refreshToken } = initialTokens
  const clear = vi.fn(() => {
    accessToken = null
    refreshToken = null
  })
  const redirectToLogin = vi.fn()
  const setTokens = vi.fn(
    (tokens: { accessToken: string; refreshToken: string }) => {
      accessToken = tokens.accessToken
      refreshToken = tokens.refreshToken
    },
  )

  setAuthBridge({
    clear,
    getAccessToken: () => accessToken,
    getRefreshToken: () => refreshToken,
    redirectToLogin,
    setTokens,
  })
  api.defaults.adapter = adapter

  return { api, clear, redirectToLogin, setTokens }
}

async function observeSettlement(promise: Promise<unknown>) {
  return Promise.race([
    promise.then(
      () => "resolved" as const,
      () => "rejected" as const,
    ),
    new Promise<"pending">((resolve) => {
      setTimeout(() => resolve("pending"), 100)
    }),
  ])
}

afterEach(() => {
  vi.clearAllMocks()
})

describe("토큰 갱신 실패", () => {
  it("갱신 요청이 401이면 대기하지 않고 인증 상태를 정리한다", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      return rejectUnauthorized(config)
    })
    const { api, clear, redirectToLogin } = await createSubject(adapter)

    const settlement = await observeSettlement(api.get("/v2/member/me"))

    expect(settlement).toBe("rejected")
    expect(
      adapter.mock.calls.filter(([config]) =>
        config.url?.includes(TOKEN_RENEW_PATH),
      ),
    ).toHaveLength(1)
    expect(clear).toHaveBeenCalledOnce()
    expect(redirectToLogin).toHaveBeenCalledOnce()
  })

  it("refresh token이 없으면 갱신 요청 없이 로그인으로 이동한다", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      return rejectUnauthorized(config)
    })
    const { api, clear, redirectToLogin } = await createSubject(adapter, {
      accessToken: "expired-access",
      refreshToken: null,
    })

    await expect(api.get("/v2/member/me")).rejects.toBeInstanceOf(AxiosError)

    expect(adapter).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledOnce()
    expect(redirectToLogin).toHaveBeenCalledOnce()
  })

  it("동시 요청 중 갱신이 실패하면 대기열의 요청도 모두 reject한다", async () => {
    let releaseRenew: () => void = () => undefined
    const renewGate = new Promise<void>((resolve) => {
      releaseRenew = resolve
    })
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url?.includes(TOKEN_RENEW_PATH)) {
        await renewGate
      }
      return rejectUnauthorized(config)
    })
    const { api, clear, redirectToLogin } = await createSubject(adapter)

    const firstRequest = api.get("/protected/first")
    const secondRequest = api.get("/protected/second")

    await vi.waitFor(() => {
      expect(adapter).toHaveBeenCalledTimes(3)
    })
    releaseRenew()

    const settlements = await Promise.all([
      observeSettlement(firstRequest),
      observeSettlement(secondRequest),
    ])

    expect(settlements).toEqual(["rejected", "rejected"])
    expect(
      adapter.mock.calls.filter(([config]) =>
        config.url?.includes(TOKEN_RENEW_PATH),
      ),
    ).toHaveLength(1)
    expect(clear).toHaveBeenCalledOnce()
    expect(redirectToLogin).toHaveBeenCalledOnce()
  })
})

describe("토큰 갱신 성공", () => {
  it("동시 요청 중 갱신이 성공하면 새 access token으로 원 요청을 재시도한다", async () => {
    let releaseRenew: () => void = () => undefined
    const renewGate = new Promise<void>((resolve) => {
      releaseRenew = resolve
    })
    const protectedAttempts = new Map<string, number>()
    const retryAuthorizations: unknown[] = []
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url?.includes(TOKEN_RENEW_PATH)) {
        await renewGate
        return createResponse(config, 200, {
          success: true,
          result: {
            accessToken: "new-access",
            refreshToken: "new-refresh",
          },
        })
      }

      const url = config.url ?? ""
      const attempt = (protectedAttempts.get(url) ?? 0) + 1
      protectedAttempts.set(url, attempt)
      if (attempt === 1) {
        return rejectUnauthorized(config)
      }

      retryAuthorizations.push(config.headers.Authorization)
      return createResponse(config, 200, {
        success: true,
        result: url,
      })
    })
    const { api, clear, redirectToLogin, setTokens } =
      await createSubject(adapter)

    const firstRequest = api.get("/protected/first")
    const secondRequest = api.get("/protected/second")

    await vi.waitFor(() => {
      expect(adapter).toHaveBeenCalledTimes(3)
    })
    releaseRenew()

    await expect(
      Promise.all([firstRequest, secondRequest]),
    ).resolves.toHaveLength(2)
    expect(setTokens).toHaveBeenCalledWith({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    })
    expect(retryAuthorizations).toEqual([
      "Bearer new-access",
      "Bearer new-access",
    ])
    expect(clear).not.toHaveBeenCalled()
    expect(redirectToLogin).not.toHaveBeenCalled()
  })

  it("새 토큰으로 재시도한 요청도 401이면 인증 상태를 정리한다", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url?.includes(TOKEN_RENEW_PATH)) {
        return createResponse(config, 200, {
          success: true,
          result: {
            accessToken: "new-access",
            refreshToken: "new-refresh",
          },
        })
      }

      return rejectUnauthorized(config)
    })
    const { api, clear, redirectToLogin } = await createSubject(adapter)

    await expect(api.get("/protected")).rejects.toBeInstanceOf(AxiosError)

    expect(
      adapter.mock.calls.filter(([config]) =>
        config.url?.includes(TOKEN_RENEW_PATH),
      ),
    ).toHaveLength(1)
    expect(clear).toHaveBeenCalledOnce()
    expect(redirectToLogin).toHaveBeenCalledOnce()
  })

  it("동시 요청의 재시도가 401이어도 토큰 갱신은 한 번만 수행한다", async () => {
    const requestCount = 20
    let releaseRenew: () => void = () => undefined
    const renewGate = new Promise<void>((resolve) => {
      releaseRenew = resolve
    })
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url?.includes(TOKEN_RENEW_PATH)) {
        await renewGate
        return createResponse(config, 200, {
          success: true,
          result: {
            accessToken: "new-access",
            refreshToken: "new-refresh",
          },
        })
      }

      return rejectUnauthorized(config)
    })
    const { api, clear, redirectToLogin } = await createSubject(adapter)

    const requests = Array.from({ length: requestCount }, (_, index) =>
      api.get(`/protected/${index}`),
    )

    await vi.waitFor(() => {
      expect(adapter).toHaveBeenCalledTimes(requestCount + 1)
    })
    releaseRenew()

    const settlements = await Promise.all(requests.map(observeSettlement))

    expect(settlements).toEqual(
      Array.from({ length: requestCount }, () => "rejected"),
    )
    expect(
      adapter.mock.calls.filter(([config]) =>
        config.url?.includes(TOKEN_RENEW_PATH),
      ),
    ).toHaveLength(1)
    expect(clear).toHaveBeenCalledOnce()
    expect(redirectToLogin).toHaveBeenCalledOnce()
  })

  it("토큰 갱신 요청에는 이전 access token을 전송하지 않는다", async () => {
    const protectedAttempts = new Map<string, number>()
    const renewAuthorizations: unknown[] = []
    let renewCount = 0
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url?.includes(TOKEN_RENEW_PATH)) {
        renewCount += 1
        renewAuthorizations.push(config.headers.Authorization)
        return createResponse(config, 200, {
          success: true,
          result: {
            accessToken: `new-access-${renewCount}`,
            refreshToken: `new-refresh-${renewCount}`,
          },
        })
      }

      const url = config.url ?? ""
      const attempt = (protectedAttempts.get(url) ?? 0) + 1
      protectedAttempts.set(url, attempt)
      if (attempt === 1) {
        return rejectUnauthorized(config)
      }

      return createResponse(config, 200, {
        success: true,
        result: url,
      })
    })
    const { api } = await createSubject(adapter)

    await api.get("/protected/first")
    await api.get("/protected/second")

    expect(renewAuthorizations).toEqual([undefined, undefined])
  })
})
