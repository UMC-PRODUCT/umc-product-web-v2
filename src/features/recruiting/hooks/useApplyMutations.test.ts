import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import { createElement } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createAnonymousApplicationDraft,
  createApplicationDraft,
  saveApplicationDraft,
  submitAnonymousApplication,
  submitApplication,
  updateAnonymousApplication,
} from "../api/recruitingApi"
import { writeApplyDraft } from "../model/applyDraftStorage"
import {
  useSaveApplicationDraft,
  useSubmitApplication,
} from "./useApplyMutations"

import type { ReactNode } from "react"

vi.mock("../api/recruitingApi", () => ({
  createAnonymousApplicationDraft: vi.fn(),
  createApplicationDraft: vi.fn(),
  saveApplicationDraft: vi.fn(),
  submitAnonymousApplication: vi.fn(),
  submitApplication: vi.fn(),
  updateAnonymousApplication: vi.fn(),
}))

const INPUT = {
  applicantName: "홍길동",
  applicantEmail: "applicant@example.com",
  firstChoice: "PLAN" as const,
  answers: [],
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe("지원 mutation 인증 분기", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it("게스트는 공개 생성·수정·제출 API를 사용한다", async () => {
    vi.mocked(createAnonymousApplicationDraft).mockResolvedValue({
      applicationId: "application-1",
      applicationKey: "key-1",
      status: "DRAFT",
    })
    vi.mocked(updateAnonymousApplication).mockResolvedValue({
      applicationId: "application-1",
      status: "DRAFT",
    })
    vi.mocked(submitAnonymousApplication).mockResolvedValue({
      applicationId: "application-1",
      status: "SUBMITTED",
    })
    sessionStorage.setItem("anonymousEmail", INPUT.applicantEmail)

    const context = {
      roundId: "7",
      memberId: "anonymous-session-1",
      applicationFormId: "9",
      isAnonymous: true,
      privacyTermId: 1,
      privacyAgreed: true,
    }
    const { result } = renderHook(
      () => ({
        save: useSaveApplicationDraft(context),
        submit: useSubmitApplication(context),
      }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.save.mutateAsync(INPUT)
      await result.current.submit.mutateAsync({
        applicationId: "application-1",
        applicationKey: "key-1",
      })
    })

    expect(createAnonymousApplicationDraft).toHaveBeenCalledOnce()
    expect(updateAnonymousApplication).toHaveBeenCalledWith({
      credentialEmail: INPUT.applicantEmail,
      applicationKey: "key-1",
      ...INPUT,
    })
    expect(submitAnonymousApplication).toHaveBeenCalledWith({
      email: INPUT.applicantEmail,
      applicationKey: "key-1",
    })
    expect(createApplicationDraft).not.toHaveBeenCalled()
    expect(saveApplicationDraft).not.toHaveBeenCalled()
    expect(submitApplication).not.toHaveBeenCalled()
  })

  it("로그인 사용자는 회원 전용 생성·수정·제출 API를 사용한다", async () => {
    vi.mocked(createApplicationDraft).mockResolvedValue({
      applicationId: "application-2",
      applicationKey: "key-2",
      status: "DRAFT",
    })
    vi.mocked(saveApplicationDraft).mockResolvedValue({
      applicationId: "application-2",
      status: "DRAFT",
    })
    vi.mocked(submitApplication).mockResolvedValue({
      applicationId: "application-2",
      status: "SUBMITTED",
    })

    const context = {
      roundId: "7",
      memberId: "member-1",
      applicationFormId: "9",
      isAnonymous: false,
      privacyAgreed: false,
    }
    const { result } = renderHook(
      () => ({
        save: useSaveApplicationDraft(context),
        submit: useSubmitApplication(context),
      }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.save.mutateAsync(INPUT)
      await result.current.submit.mutateAsync({
        applicationId: "application-2",
        applicationKey: "key-2",
      })
    })

    expect(createApplicationDraft).toHaveBeenCalledWith({
      applicationFormId: 9,
      applicantName: INPUT.applicantName,
      applicantEmail: INPUT.applicantEmail,
      firstChoice: INPUT.firstChoice,
    })
    expect(saveApplicationDraft).toHaveBeenCalledWith("application-2", INPUT)
    expect(submitApplication).toHaveBeenCalledWith("application-2")
    expect(createAnonymousApplicationDraft).not.toHaveBeenCalled()
    expect(updateAnonymousApplication).not.toHaveBeenCalled()
    expect(submitAnonymousApplication).not.toHaveBeenCalled()
    expect(sessionStorage.getItem("anonymousEmail")).toBeNull()
  })

  it("기존 초안이 있으면 생성 API를 다시 호출하지 않는다", async () => {
    writeApplyDraft("7", "member-1", {
      applicationId: "application-3",
      applicationKey: "key-3",
    })
    vi.mocked(saveApplicationDraft).mockResolvedValue({
      applicationId: "application-3",
      status: "DRAFT",
    })

    const context = {
      roundId: "7",
      memberId: "member-1",
      applicationFormId: "9",
      isAnonymous: false,
      privacyAgreed: false,
    }
    const { result } = renderHook(() => useSaveApplicationDraft(context), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT)
    })

    expect(createApplicationDraft).not.toHaveBeenCalled()
    expect(saveApplicationDraft).toHaveBeenCalledWith("application-3", INPUT)
  })
})
