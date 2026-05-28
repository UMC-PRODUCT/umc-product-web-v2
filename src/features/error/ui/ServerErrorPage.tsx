import { useRouter } from "@tanstack/react-router"

import errorCone from "@/shared/assets/icon/error/error-cone.svg"
import { Button } from "@/shared/ui/Button"

import type { ErrorComponentProps } from "@tanstack/react-router"

export function ServerErrorPage({ reset }: Partial<ErrorComponentProps>) {
  const router = useRouter()

  const handleRefresh = () => {
    if (reset) {
      reset()
      return
    }
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(-63.18deg, rgba(34, 144, 132, 0.06) 10.77%, rgba(255, 255, 255, 0.2) 29.55%), linear-gradient(121.23deg, rgba(34, 144, 132, 0.1) 5.09%, rgba(255, 255, 255, 0.2) 42.81%), linear-gradient(90deg, rgba(143, 255, 243, 0.08) 0%, rgba(143, 255, 243, 0.08) 100%), linear-gradient(90deg, #fff 0%, #fff 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-11.5">
        <img src={errorCone} alt="" width={192} height={180} />

        <div className="flex flex-col items-center gap-9.5">
          <div className="flex flex-col items-center gap-4.5 text-center">
            <h1 className="text-display-2-medium font-bold text-teal-500">
              일시적인 오류가 발생했습니다
            </h1>
            <p className="text-subtitle-1-medium text-teal-gray-600">
              페이지를 불러오지 못했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              size="xl"
              variant="weak"
              color="primary"
              onClick={() => router.history.back()}
            >
              이전으로 이동
            </Button>
            <Button
              size="xl"
              variant="fill"
              color="primary"
              onClick={handleRefresh}
            >
              새로고침
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
