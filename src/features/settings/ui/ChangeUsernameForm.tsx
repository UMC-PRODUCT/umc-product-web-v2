import { useEmailVerification } from "@/features/auth/hooks/useEmailVerification"
import CheckIcon from "@/shared/assets/icon/check/CheckIcon"
import { Button } from "@/shared/ui/Button"
import { InputBox } from "@/shared/ui/input/InputBox"

interface ChangeUsernameFormProps {
  currentEmail: string
  onSuccess: () => void
  onBack: () => void
}

export function ChangeUsernameForm({
  currentEmail,
  onSuccess: _,
  onBack: _2,
}: ChangeUsernameFormProps) {
  const {
    email: next,
    setEmail: setNext,
    code,
    setCode,
    isLoading,
    isCodeVisible,
    remainingSeconds,
    isDuplicated,
    isCodeInvalid,
    isExpired,
    isEmailValid,
    verificationToken,
    handleVerificationClick,
    handleCodeVerify,
  } = useEmailVerification("REGISTER")

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col items-start gap-4">
        <span className="text-heading-7-semibold text-teal-gray-900">
          아이디 변경
        </span>
      </div>
      <div className="flex w-full flex-col items-start gap-8">
        {/* 현재 아이디 */}
        <div className="flex w-full flex-col items-start gap-1.5">
          <div className="flex items-center gap-0.5">
            <span className="text-body-1-medium text-teal-gray-600">
              현재 아이디
            </span>
            <span className="text-body-1-medium text-error-500">*</span>
          </div>
          <InputBox
            state="disabled"
            value={currentEmail}
            onChange={() => {}}
            className="w-full"
          />
        </div>

        {/* 새 아이디 */}
        <div className="flex w-full flex-col items-start gap-1.5">
          <div className="flex items-center gap-0.5">
            <span className="text-body-1-medium text-teal-gray-600">
              새 아이디
            </span>
            <span className="text-body-1-medium text-error-500">*</span>
          </div>
          <div className="flex h-11 w-full items-start justify-between gap-1.5">
            <InputBox
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="이메일 형식의 아이디"
              state={isDuplicated ? "error" : "default"}
              className="w-full"
            />
            <Button
              variant="weak"
              color="neutral"
              size="s"
              disabled={!isEmailValid || isLoading || isDuplicated}
              isLoading={isLoading}
              onClick={() => void handleVerificationClick()}
              className="h-11"
            >
              인증하기
            </Button>
          </div>
          {isDuplicated && (
            <div className="flex items-center gap-1">
              <CheckIcon className="text-error-500 h-4 w-4" />
              <p className="text-error-500 text-body-2-medium">
                이미 가입된 아이디입니다.
              </p>
            </div>
          )}
        </div>

        {/* 인증번호 */}
        {isCodeVisible && (
          <div className="flex w-full flex-col items-start gap-1.5 pb-[21px]">
            <div className="flex items-center gap-0.5">
              <span className="text-body-1-medium text-teal-gray-600">
                인증번호
              </span>
              <span className="text-body-1-medium text-error-500">*</span>
            </div>
            <div className="flex h-11 w-full items-start justify-between gap-1.5">
              <InputBox
                type="verification"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="숫자 6자리 입력"
                remainingSeconds={remainingSeconds}
                inputMode="numeric"
                maxLength={6}
                state={isCodeInvalid ? "error" : "default"}
                className="w-full"
              />
              <Button
                variant="weak"
                color="neutral"
                size="s"
                disabled={code.length !== 6 || isExpired || !!verificationToken}
                onClick={() => void handleCodeVerify()}
                className="h-11"
              >
                확인
              </Button>
            </div>
            <div className="flex h-5.5 items-center gap-1">
              {isCodeInvalid && !isExpired && (
                <>
                  <CheckIcon className="text-error-500 h-4 w-4" />
                  <p className="text-error-500 text-body-2-medium">
                    인증번호가 일치하지 않아요.
                  </p>
                </>
              )}
              {isExpired && (
                <>
                  <CheckIcon className="text-error-500 h-4 w-4" />
                  <p className="text-error-500 text-body-2-medium">
                    인증번호 입력 시간이 지났어요.
                  </p>
                </>
              )}
              {verificationToken && (
                <>
                  <CheckIcon className="text-success-500 h-4 w-4" />
                  <p className="text-success-500 text-body-2-medium">
                    인증이 완료되었습니다.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="fill"
        color="primary"
        size="s"
        disabled={!verificationToken}
        className="h-11 w-full bg-teal-300 disabled:bg-teal-200"
      >
        변경하기
      </Button>
    </div>
  )
}
