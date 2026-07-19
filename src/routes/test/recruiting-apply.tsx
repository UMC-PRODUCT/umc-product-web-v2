import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { RecruitingApplyForm } from "@/features/recruiting"
import { RECRUITING_APPLY_FORM_MOCK } from "@/features/recruiting/model/applyForm.mock"
import PersonIcon from "@/shared/assets/icon/people/PersonIcon"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"
import Footer from "@/widgets/footer/Footer"
import Header from "@/widgets/navigation/header/Header"

const APPLICANT_SIDEBAR_ITEMS = ["지원 방법", "모집 공고", "내 지원서"]

export const Route = createFileRoute("/test/recruiting-apply")({
  component: RecruitingApplyTestPage,
})

function RecruitingApplyTestPage() {
  const navigate = useNavigate()

  return (
    <main className="flex h-full min-h-screen w-full flex-col">
      <Header activePathname="/recruiting" />
      <div className="flex w-full flex-1">
        <aside className="border-teal-gray-100 w-55 shrink-0 border-r bg-white px-4 pt-8">
          <span className="text-caption-1-medium text-teal-gray-400 px-2">
            UMC 10th
          </span>
          <nav className="mt-4 flex flex-col gap-0.5">
            {APPLICANT_SIDEBAR_ITEMS.map((label, index) => (
              <span
                key={label}
                className={
                  index === 0
                    ? "text-body-2-medium flex h-12 items-center gap-2 rounded-[10px] bg-teal-50 px-3 text-teal-700"
                    : "text-body-2-medium text-teal-gray-500 flex h-12 items-center gap-2 px-3"
                }
              >
                <PersonIcon className="size-5 shrink-0" />
                {label}
              </span>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-200 px-8 pt-10 pb-20">
            <div className="flex w-full max-w-265 flex-col">
              <PageLabel
                breadcrumb={[
                  { id: "recruiting", label: "리크루팅" },
                  { id: "apply", label: "지원하기" },
                  { id: "guide", label: "지원 방법" },
                ]}
                title="모집 공고"
                className="pl-3"
              />
              <RecruitingApplyForm
                config={RECRUITING_APPLY_FORM_MOCK}
                onExit={() => navigate({ to: "/test" })}
                className="mt-8"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
