import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import {
  addMemberOAuth,
  removeMemberOAuth,
} from "@/features/auth/api/memberOauth"
import {
  loginWithApple,
  loginWithGoogle,
} from "@/features/auth/api/socialLogin"
import {
  isApplePopupCancelled,
  signInWithApple,
} from "@/features/auth/lib/appleSignIn"
import {
  isGooglePopupCancelled,
  signInWithGoogle,
} from "@/features/auth/lib/googleSignIn"
import {
  setKakaoLinkIntent,
  startKakaoSignIn,
} from "@/features/auth/lib/kakaoSignIn"

import { MEMBER_OAUTH_QUERY_KEY } from "./useMemberOAuthList"

function getBeErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: string } | undefined
    return data?.code ?? null
  }
  return null
}

interface UnlinkTarget {
  memberOAuthId: number
}

export function useOAuthLinking() {
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const [isLinking, setIsLinking] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<UnlinkTarget | null>(null)

  const handleLinkError = (error: unknown, provider: string) => {
    const code = getBeErrorCode(error)
    let message = `${provider} 연동에 실패했습니다. 다시 시도해주세요.`
    if (code === "AUTHENTICATION-0012") {
      message = `이미 다른 계정에 연결된 ${provider} 계정입니다.`
    } else if (code === "AUTHENTICATION-0013") {
      message = `이미 연동되어 있는 ${provider} 계정입니다.`
    }
    addToast({
      message,
      color: "red",
      variant: "deep",
      type: "default",
      duration: 3000,
    })
  }

  const handleGoogleLink = async () => {
    if (isLinking) return
    setIsLinking(true)
    try {
      const { accessToken } = await signInWithGoogle()
      const res = await loginWithGoogle({ accessToken })
      if (res.code === "LOGIN_SUCCESS") {
        addToast({
          message: "이미 다른 계정에 연결된 Google 계정입니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
      if (!res.oAuthVerificationToken)
        throw new Error("oAuthVerificationToken 없음")
      await addMemberOAuth({
        oAuthVerificationToken: res.oAuthVerificationToken,
      })
      await queryClient.invalidateQueries({ queryKey: MEMBER_OAUTH_QUERY_KEY })
      addToast({
        message: "Google 계정이 연동되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch (err) {
      if (isGooglePopupCancelled(err)) return
      handleLinkError(err, "Google")
    } finally {
      setIsLinking(false)
    }
  }

  const handleAppleLink = async () => {
    if (isLinking) return
    setIsLinking(true)
    try {
      const { authorizationCode } = await signInWithApple()
      const res = await loginWithApple({ authorizationCode })
      if (res.code === "LOGIN_SUCCESS") {
        addToast({
          message: "이미 다른 계정에 연결된 Apple 계정입니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
        return
      }
      if (!res.oAuthVerificationToken)
        throw new Error("oAuthVerificationToken 없음")
      await addMemberOAuth({
        oAuthVerificationToken: res.oAuthVerificationToken,
      })
      await queryClient.invalidateQueries({ queryKey: MEMBER_OAUTH_QUERY_KEY })
      addToast({
        message: "Apple 계정이 연동되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch (err) {
      if (isApplePopupCancelled(err)) return
      handleLinkError(err, "Apple")
    } finally {
      setIsLinking(false)
    }
  }

  const handleKakaoLink = () => {
    setKakaoLinkIntent()
    startKakaoSignIn()
  }

  const handleUnlink = async () => {
    if (!unlinkTarget) return
    try {
      await removeMemberOAuth(unlinkTarget.memberOAuthId)
      await queryClient.invalidateQueries({ queryKey: MEMBER_OAUTH_QUERY_KEY })
      addToast({
        message: "소셜 연동이 해제되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch (err) {
      const code = getBeErrorCode(err)
      const message =
        code === "AUTHENTICATION-0016"
          ? "마지막 소셜 연동은 해제할 수 없습니다. 비밀번호를 먼저 설정해주세요."
          : "연동 해제에 실패했습니다. 다시 시도해주세요."
      addToast({
        message,
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setUnlinkTarget(null)
    }
  }

  return {
    unlinkTarget,
    setUnlinkTarget,
    handleGoogleLink,
    handleAppleLink,
    handleKakaoLink,
    handleUnlink,
  }
}
