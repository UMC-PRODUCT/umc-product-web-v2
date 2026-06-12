import { createFileRoute } from "@tanstack/react-router"

import Footer from "@/components/footer/Footer"

export const Route = createFileRoute("/test/footer")({
  component: FooterTestPage,
})

function FooterTestPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-teal-gray-400 text-body-2-regular">
          페이지 컨텐츠 영역
        </p>
      </div>
      <Footer />
    </div>
  )
}
