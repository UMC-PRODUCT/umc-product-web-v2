import errorCone from "@/shared/assets/icon/error/error-cone.svg"
import { Button } from "@/shared/ui/Button"
import { useToastStore } from "@/shared/ui/toast/useToastStore"

// clipboard API 는 보안 컨텍스트(https, localhost)에서만 쓸 수 있다. 사내망 IP
// 처럼 http 로 연 화면에서는 아예 없고, 있어도 문서 포커스나 권한 때문에 던진다.
// 어느 쪽이든 구식 방식으로 한 번 더 시도한 뒤에 실패로 본다.
async function copyText(text: string) {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // 아래 구식 방식으로 재시도한다.
    }
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand("copy")
  document.body.removeChild(textarea)
  if (!copied) throw new Error("clipboard copy failed")
}

// 좁은 화면에서 앱 대부분은 min-w-[1440px] 때문에 가로로 잘린다. 리다이렉트로
// 보내면 원래 주소를 잃어 "데스크톱에서 다시 열어달라"는 안내가 성립하지 않는다.
// 그래서 주소는 그대로 두고 위를 덮는다.
//
// 이 화면만은 모바일에서 보이는 화면이므로 모바일 기준으로 짠다. 데스크톱 폭은
// 고려하지 않는다 — 넓어지면 호출부(__root)가 이 컴포넌트를 걷어낸다.
export function DesktopOnlyOverlay() {
  const addToast = useToastStore((state) => state.addToast)

  const handleCopy = async () => {
    try {
      await copyText(window.location.href)
      addToast({
        message: "주소가 복사되었어요",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    } catch {
      // 복사가 막혀도 주소는 select-all 로 직접 집을 수 있다.
      addToast({
        message:
          "주소를 복사하지 못했어요.\n위 주소를 길게 눌러 복사해 주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="데스크톱 환경 안내"
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto px-6 py-10"
      style={{
        backgroundImage:
          "linear-gradient(-63.18deg, rgba(34, 144, 132, 0.06) 10.77%, rgba(255, 255, 255, 0.2) 29.55%), linear-gradient(121.23deg, rgba(34, 144, 132, 0.1) 5.09%, rgba(255, 255, 255, 0.2) 42.81%), linear-gradient(90deg, rgba(143, 255, 243, 0.08) 0%, rgba(143, 255, 243, 0.08) 100%), linear-gradient(90deg, #fff 0%, #fff 100%)",
      }}
    >
      <div className="flex w-full max-w-90 flex-col items-center gap-8">
        <img src={errorCone} alt="" width={132} height={124} />

        <div className="flex w-full flex-col items-center gap-7">
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-heading-5-bold text-teal-500">
              데스크톱에서 확인해 주세요
            </h1>
            <p className="text-body-1-regular text-teal-gray-600">
              이 화면은 아직 모바일을 지원하지 않습니다.
              <br />
              아래 주소를 데스크톱 브라우저에서 열어 주세요.
            </p>
          </div>

          <p className="text-label-1-medium text-teal-gray-500 bg-teal-gray-50 w-full rounded-[10px] px-4 py-3 text-center break-all select-all">
            {window.location.href}
          </p>

          <Button
            size="lg"
            variant="fill"
            color="primary"
            className="w-full"
            onClick={() => void handleCopy()}
          >
            주소 복사하기
          </Button>
        </div>
      </div>
    </div>
  )
}
