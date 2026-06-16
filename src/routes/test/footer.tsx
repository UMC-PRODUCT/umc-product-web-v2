import { createFileRoute } from "@tanstack/react-router"

import Footer from "@/components/footer/Footer"

export const Route = createFileRoute("/test/footer")({
  component: FooterTestPage,
})

function FooterTestPage() {
  return (
    <div className="flex min-h-screen flex-col gap-0">
      <section className="flex flex-col">
        <div className="bg-teal-gray-50 border-teal-gray-100 flex items-center border-b px-6 py-3">
          <span className="text-label-1-medium text-teal-gray-500">
            variant="light"
          </span>
        </div>
        <div className="bg-teal-gray-50 flex min-h-40 items-center justify-center">
          <p className="text-body-2-regular text-teal-gray-300">
            페이지 컨텐츠 영역
          </p>
        </div>
        <Footer variant="light" />
      </section>

      <section className="flex flex-col">
        <div className="bg-teal-gray-50 border-teal-gray-100 flex items-center border-b px-6 py-3">
          <span className="text-label-1-medium text-teal-gray-500">
            variant="dark"
          </span>
        </div>
        <div className="bg-teal-gray-50 flex min-h-40 items-center justify-center">
          <p className="text-body-2-regular text-teal-gray-300">
            페이지 컨텐츠 영역
          </p>
        </div>
        <Footer variant="dark" />
      </section>
    </div>
  )
}
