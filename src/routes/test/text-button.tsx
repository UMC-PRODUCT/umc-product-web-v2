import { createFileRoute } from "@tanstack/react-router"

import { TextButton } from "@/shared/ui/button/TextButton"

export const Route = createFileRoute("/test/text-button")({
  component: TextButtonTestPage,
})

function TextButtonSpecimen({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border-teal-gray-150 flex min-h-24 min-w-40 flex-col items-center justify-center gap-3 rounded-xl border bg-white px-4 py-5">
      {children}
      <span className="text-caption-2-regular text-teal-gray-400">{label}</span>
    </div>
  )
}

function TextButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 bp1:p-10 min-h-screen w-full p-6">
      <div className="mx-auto flex w-full max-w-240 flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-heading-6-semibold text-teal-gray-900">
            TextButton
          </h1>
          <p className="text-body-2-regular text-teal-gray-500">
            Figma 정의의 크기, 색상과 확장한 hover·active 상태를 확인하는
            페이지입니다.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-label-1-semibold text-teal-gray-700">16px</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextButtonSpecimen label="Neutral / Default">
              <TextButton>텍스트 버튼</TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Neutral / Hover">
              <TextButton className="underline underline-offset-3">
                텍스트 버튼
              </TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Neutral / Active">
              <TextButton className="text-teal-gray-700 underline underline-offset-3">
                텍스트 버튼
              </TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Primary / Default">
              <TextButton color="primary">텍스트 버튼</TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Primary / Hover">
              <TextButton
                color="primary"
                className="underline underline-offset-3"
              >
                텍스트 버튼
              </TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Primary / Active">
              <TextButton
                color="primary"
                className="text-teal-700 underline underline-offset-3"
              >
                텍스트 버튼
              </TextButton>
            </TextButtonSpecimen>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-label-1-semibold text-teal-gray-700">14px</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextButtonSpecimen label="Neutral / Default">
              <TextButton size="14">텍스트 버튼</TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Neutral / Hover">
              <TextButton size="14" className="underline underline-offset-3">
                텍스트 버튼
              </TextButton>
            </TextButtonSpecimen>
            <TextButtonSpecimen label="Neutral / Active">
              <TextButton
                size="14"
                className="text-teal-gray-900 underline underline-offset-3"
              >
                텍스트 버튼
              </TextButton>
            </TextButtonSpecimen>
          </div>
        </section>
      </div>
    </main>
  )
}
