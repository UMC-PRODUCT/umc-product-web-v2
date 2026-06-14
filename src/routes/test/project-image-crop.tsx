import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { ImageUploader } from "@/shared/ui/ImageUploader"

export const Route = createFileRoute("/test/project-image-crop")({
  component: ProjectImageCropTestPage,
})

interface PreviewState {
  file: File
  url: string
}

function ProjectImageCropTestPage() {
  const [thumbnail, setThumbnail] = useState<PreviewState | null>(null)
  const [logo, setLogo] = useState<PreviewState | null>(null)

  useEffect(() => {
    return () => {
      if (thumbnail) URL.revokeObjectURL(thumbnail.url)
    }
  }, [thumbnail])

  useEffect(() => {
    return () => {
      if (logo) URL.revokeObjectURL(logo.url)
    }
  }, [logo])

  const handleThumbnailChange = (file: File) => {
    setThumbnail({ file, url: URL.createObjectURL(file) })
  }

  const handleLogoChange = (file: File) => {
    setLogo({ file, url: URL.createObjectURL(file) })
  }

  return (
    <main className="bg-teal-gray-50 flex min-h-screen w-full flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-6-semibold text-teal-gray-900">
          프로젝트 이미지 크롭 테스트
        </h1>
        <p className="text-body-2-medium text-teal-gray-500">
          로그인 라우팅 가드 없이 썸네일과 로고 업로더의 크롭 결과를 확인합니다.
        </p>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <h2 className="text-body-1-semibold text-teal-gray-900">
            썸네일 업로드
          </h2>
          <ImageUploader
            variant="thumbnail"
            onChange={handleThumbnailChange}
            onRemove={() => setThumbnail(null)}
          />
        </div>
        <PreviewPanel
          title="썸네일 크롭 결과"
          preview={thumbnail}
          expected="540 : 286"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,540px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <h2 className="text-body-1-semibold text-teal-gray-900">
            로고 업로드
          </h2>
          <ImageUploader
            variant="logo"
            onChange={handleLogoChange}
            onRemove={() => setLogo(null)}
          />
        </div>
        <PreviewPanel title="로고 크롭 결과" preview={logo} expected="1 : 1" />
      </section>
    </main>
  )
}

interface PreviewPanelProps {
  title: string
  preview: PreviewState | null
  expected: string
}

function PreviewPanel({ title, preview, expected }: PreviewPanelProps) {
  return (
    <div className="border-teal-gray-100 flex min-h-56 flex-col gap-4 rounded-lg border bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-body-1-semibold text-teal-gray-900">{title}</h2>
        <p className="text-body-2-medium text-teal-gray-500">
          기대 비율: {expected}
        </p>
      </div>
      {preview ? (
        <div className="flex flex-col gap-4">
          <img
            src={preview.url}
            alt={title}
            className="border-teal-gray-100 max-h-72 max-w-full self-start rounded-lg border object-contain"
          />
          <dl className="text-body-2-medium text-teal-gray-700 grid gap-2 sm:grid-cols-3">
            <div>
              <dt className="text-teal-gray-400">파일명</dt>
              <dd className="break-all">{preview.file.name}</dd>
            </div>
            <div>
              <dt className="text-teal-gray-400">타입</dt>
              <dd>{preview.file.type || "-"}</dd>
            </div>
            <div>
              <dt className="text-teal-gray-400">용량</dt>
              <dd>{formatFileSize(preview.file.size)}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="text-body-2-medium text-teal-gray-400 border-teal-gray-100 flex min-h-40 items-center justify-center rounded-lg border border-dashed">
          이미지를 업로드하면 크롭된 파일 정보가 표시됩니다.
        </div>
      )}
    </div>
  )
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
