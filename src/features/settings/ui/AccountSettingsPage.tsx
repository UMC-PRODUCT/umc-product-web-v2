import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useRef, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { deleteMember, updateMemberInfo } from "@/features/auth/api/me"
import { useMe } from "@/features/auth/hooks/useMe"
import { useMemberOAuthList } from "@/features/auth/hooks/useMemberOAuthList"
import { useOAuthLinking } from "@/features/auth/hooks/useOAuthLinking"
import {
  isGooglePopupCancelled,
  signInWithGoogle,
} from "@/features/auth/lib/googleSignIn"
import { toRoleTag } from "@/features/auth/model/mappers"
import { useAuthStore } from "@/features/auth/store/authStore"
import { uploadFileFlow } from "@/features/project/new/api/storage"
import EditIcon from "@/shared/assets/icon/edit/EditIcon"
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { Button } from "@/shared/ui/Button"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"
import { InputBox } from "@/shared/ui/input/InputBox"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { ChangePasswordForm } from "./ChangePasswordForm"
import { SocialButton } from "./SocialButton"

import type { OAuthProvider } from "@/features/auth/model/types"

import type { Social } from "./SocialButton"

const PROVIDER_TO_SOCIAL: Record<OAuthProvider, Social> = {
  GOOGLE: "google",
  KAKAO: "kakao",
  APPLE: "apple",
}

export function AccountSettingsPage() {
  const { data: me } = useMe()
  const { data: oauths = [] } = useMemberOAuthList()
  const role = me?.roles?.[0] ? toRoleTag(me.roles[0].roleType) : "challenger"
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    unlinkTarget,
    setUnlinkTarget,
    handleGoogleLink,
    handleAppleLink,
    handleKakaoLink,
    handleUnlink,
  } = useOAuthLinking()

  const linkedMap = new Map(
    oauths.map((o) => [PROVIDER_TO_SOCIAL[o.provider], o.memberOAuthId]),
  )

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const { fileId } = await uploadFileFlow(file, "PROFILE_IMAGE")
      await updateMemberInfo({ profileImageId: fileId })
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
      addToast({
        message: "프로필 이미지가 변경되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      addToast({
        message: "이미지 업로드에 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } finally {
      setIsUploadingImage(false)
      e.target.value = ""
    }
  }

  const handleDeleteAccount = async () => {
    let googleAccessToken: string | undefined
    if (linkedMap.has("google")) {
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
          return
        }
      }
    }
    try {
      await deleteMember({ googleAccessToken })
      useAuthStore.getState().clear()
      addToast({
        message: "계정이 삭제되어 로그아웃되었습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      void navigate({ to: "/login" })
    } catch {
      addToast({
        message: "계정 삭제에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      setShowDeleteModal(false)
    }
  }

  const getSocialProps = (social: Social) => {
    const memberOAuthId = linkedMap.get(social)
    const linked = memberOAuthId !== undefined
    const onLink =
      social === "kakao"
        ? handleKakaoLink
        : social === "google"
          ? handleGoogleLink
          : handleAppleLink
    const onUnlink = () => setUnlinkTarget({ memberOAuthId: memberOAuthId! })
    return { linked, onClick: linked ? onUnlink : onLink }
  }

  // TODO: 로컬 계정 여부 조회 API 연결 후 동적 처리
  const isSocialOnly = false

  const emailInputClass = isSocialOnly
    ? "!text-teal-gray-700"
    : "!text-teal-600"

  return (
    <div className="flex w-full justify-center pt-14 pb-33.75">
      <div className="flex w-full max-w-250 flex-col items-start gap-11">
        <h1 className="text-heading-5-semibold text-teal-gray-900 self-stretch">
          계정 설정
        </h1>

        <div className="flex w-full flex-col items-start">
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-4.5 px-3.5 py-0">
            <div className="relative flex h-25 w-25 shrink-0 items-center justify-center">
              <div className="bg-teal-gray-100 flex h-25 w-25 items-center justify-center overflow-hidden rounded-full">
                {me?.profileImageLink ? (
                  <img
                    src={me.profileImageLink}
                    alt={me.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ProfileIcon className="text-teal-gray-300 size-full" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
              <button
                type="button"
                aria-label="프로필 사진 변경"
                disabled={isUploadingImage}
                className="border-teal-gray-100 absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-[0.875rem] border bg-white disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <EditIcon className="text-teal-gray-500" />
              </button>
            </div>

            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="text-heading-4-semibold text-teal-gray-900">
                  {me ? `${me.nickname}/${me.name}` : ""}
                </span>
                <RoleTagChip role={role} />
              </div>
              <span className="text-body-1-medium text-teal-gray-500">
                {me?.schoolName ?? ""}
              </span>
            </div>
          </div>

          {/* 설정 카드 */}
          <div className="border-teal-gray-100 mt-8 flex w-full items-start gap-2.5 rounded-xl border bg-white py-9 pl-11">
            {showPasswordChange ? (
              <ChangePasswordForm
                onSuccess={() => setShowPasswordChange(false)}
              />
            ) : (
              <div className="flex w-full max-w-100 flex-col items-start gap-20">
                <div className="flex w-full flex-col items-start gap-14">
                  {/* 계정 연동 */}
                  <div className="flex flex-col items-start gap-4">
                    <span className="text-heading-7-semibold text-teal-gray-900">
                      계정 연동
                    </span>
                    <div className="flex items-center gap-8">
                      <SocialButton
                        social="kakao"
                        {...getSocialProps("kakao")}
                      />
                      <SocialButton
                        social="apple"
                        {...getSocialProps("apple")}
                      />
                      <SocialButton
                        social="google"
                        {...getSocialProps("google")}
                      />
                    </div>
                  </div>

                  {/* 아이디 */}
                  <div className="flex w-full flex-col items-start gap-4">
                    <span className="text-heading-7-semibold text-teal-gray-900">
                      아이디
                    </span>
                    <div className="flex h-11 w-full items-start justify-between gap-1.5">
                      <InputBox
                        state="disabled"
                        value={me?.email ?? ""}
                        onChange={() => {}}
                        inputClassName={emailInputClass}
                      />
                      <Button
                        variant="weak"
                        color="neutral"
                        size="s"
                        className="h-11"
                      >
                        변경하기
                      </Button>
                    </div>
                  </div>

                  {/* 비밀번호: 소셜 전용 로그인 유저는 표시하지 않음 */}
                  {!isSocialOnly && (
                    <div className="flex w-full flex-col items-start gap-4">
                      <span className="text-heading-7-semibold text-teal-gray-900">
                        비밀번호
                      </span>
                      <Button
                        variant="weak"
                        color="neutral"
                        size="s"
                        onClick={() => setShowPasswordChange(true)}
                        className="w-full"
                      >
                        비밀번호 변경
                      </Button>
                    </div>
                  )}
                </div>

                {/* 계정 삭제 */}
                <button
                  type="button"
                  className="text-subtitle-2-medium text-error-500"
                  onClick={() => setShowDeleteModal(true)}
                >
                  계정 삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 연동 해제 확인 모달 */}
      <CtaModal
        open={unlinkTarget !== null}
        variant="error"
        title="연동을 해제하시겠습니까?"
        content="해제하면 해당 소셜 계정으로 로그인할 수 없게 됩니다."
        cancelText="돌아가기"
        confirmText="연동 해제"
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null)
        }}
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={() => void handleUnlink()}
      />

      <CtaModal
        open={showDeleteModal}
        variant="error"
        title="계정을 삭제하시겠습니까?"
        content={
          <>
            계정을 삭제하면 저장된 모든 데이터가 영구적으로 삭제되며,
            <br />
            이후에는 복구할 수 없습니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="계정 삭제"
        onOpenChange={setShowDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false)
          void handleDeleteAccount()
        }}
      />
    </div>
  )
}
