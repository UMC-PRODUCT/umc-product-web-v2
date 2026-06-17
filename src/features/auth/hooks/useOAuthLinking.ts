import { useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
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

export function useOAuthLinking() {
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const [isLinking, setIsLinking] = useState(false)
  const [isUnlinkBlockedOpen, setIsUnlinkBlockedOpen] = useState(false)

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
      addToast({
        message: "Google 연동에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
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
      addToast({
        message: "Apple 연동에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsLinking(false)
    }
  }

  const handleKakaoLink = () => {
    setKakaoLinkIntent()
    startKakaoSignIn().catch((error: unknown) => {
      console.error("[Kakao Link]", error)
    })
  }

  const handleUnlink = async (
    memberOAuthId: number,
    social: "google" | "kakao" | "apple",
  ) => {
    let googleAccessToken: string | undefined

    if (social === "google") {
      try {
        const result = await signInWithGoogle()
        googleAccessToken = result.accessToken
      } catch (err) {
        if (!isGooglePopupCancelled(err)) {
          addToast({
            message: "Google 인증에 실패했습니다. 다시 시도해주세요.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
        }
        return
      }
    }

    try {
      await removeMemberOAuth(memberOAuthId, { googleAccessToken })
      await queryClient.invalidateQueries({ queryKey: MEMBER_OAUTH_QUERY_KEY })
      addToast({
        message: "소셜 연동이 해제되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch (err) {
      const errorCode = isAxiosError(err)
        ? (err.response?.data as { code?: string } | undefined)?.code
        : undefined
      if (errorCode === "AUTHENTICATION-0016") {
        setIsUnlinkBlockedOpen(true)
        return
      }
      addToast({
        message: "연동 해제에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  return {
    handleGoogleLink,
    handleAppleLink,
    handleKakaoLink,
    handleUnlink,
    isUnlinkBlockedOpen,
    setIsUnlinkBlockedOpen,
  }
}
