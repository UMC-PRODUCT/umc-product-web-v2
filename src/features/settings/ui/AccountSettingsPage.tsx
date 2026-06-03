import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import { signInWithApple } from "@/features/auth/lib/appleSignIn"
import { signInWithGoogle } from "@/features/auth/lib/googleSignIn"
import { startKakaoSignIn } from "@/features/auth/lib/kakaoSignIn"
import { toRoleTag } from "@/features/auth/model/mappers"
import EditIcon from "@/shared/assets/icon/edit/EditIcon"
import ProfileIcon from "@/shared/assets/icon/people/ProfileIcon"
import { Button } from "@/shared/ui/Button"
import { RoleTagChip } from "@/shared/ui/chip/RoleTagChip"
import { InputBox } from "@/shared/ui/input/InputBox"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { ChangePasswordForm } from "./ChangePasswordForm"
import { SocialButton } from "./SocialButton"

// TODO: GET /v1/member-oauth/me 및 로컬 계정 여부 조회 API 연결 후 동적 처리
export type UserLoginType = "social" | "local" | "local-linked"
const MOCK_LOGIN_TYPE: UserLoginType = "local"

export function AccountSettingsPage() {
  const { data: me } = useMe()
  const role = me?.roles?.[0] ? toRoleTag(me.roles[0].roleType) : "challenger"
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()
  const addToast = useToastStore((s) => s.addToast)

  // TODO: API 연결 후 실제 값으로 교체
  const loginType: UserLoginType = MOCK_LOGIN_TYPE
  const isSocialOnly = loginType === "social"
  const emailInputClass = isSocialOnly
    ? "!text-teal-gray-700"
    : "!text-teal-600"

  return (
    <div className="flex w-full justify-center pt-14 pb-[8.4375rem]">
      <div className="flex w-full max-w-250 flex-col items-start gap-11">
        <h1 className="text-heading-5-semibold text-teal-gray-900 self-stretch">
          계정 설정
        </h1>

        <div className="flex w-full flex-col items-start">
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-4.5 px-3.5 py-0">
            <div className="relative flex h-[6.25rem] w-[6.25rem] flex-shrink-0 items-center justify-center">
              <div className="bg-teal-gray-100 flex h-[6.25rem] w-[6.25rem] items-center justify-center overflow-hidden rounded-full">
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
              <button
                type="button"
                aria-label="프로필 사진 변경"
                className="border-teal-gray-100 absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-[0.875rem] border bg-white"
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
                    {/* TODO: API 연결 후 linked 값 동적으로 처리 */}
                    <div className="flex items-center gap-8">
                      <SocialButton
                        social="kakao"
                        linked={true}
                        onClick={startKakaoSignIn}
                      />
                      <SocialButton
                        social="apple"
                        linked={false}
                        onClick={() => void signInWithApple()}
                      />
                      <SocialButton
                        social="google"
                        linked={false}
                        onClick={() => void signInWithGoogle()}
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
          // TODO: 계정 삭제 API 연결
          setShowDeleteModal(false)
          addToast({
            message: "계정이 삭제되어 로그아웃되었습니다.",
            color: "red",
            variant: "deep",
            type: "default",
            duration: 3000,
          })
          void navigate({ to: "/login" })
        }}
      />
    </div>
  )
}
