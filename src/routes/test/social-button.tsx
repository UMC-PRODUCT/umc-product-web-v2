import { createFileRoute } from "@tanstack/react-router"

import { SocialButton } from "@/features/settings/ui/SocialButton"

export const Route = createFileRoute("/test/social-button")({
  component: SocialButtonTestPage,
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-label-1-semibold text-teal-gray-500 border-teal-gray-100 border-b pb-1">
        {title}
      </h2>
      <div className="flex items-center gap-8">{children}</div>
    </section>
  )
}

function SocialButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        SocialButton Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Linked">
          <SocialButton social="kakao" linked={true} />
          <SocialButton social="apple" linked={true} />
          <SocialButton social="google" linked={true} />
        </Section>

        <Section title="Unlinked">
          <SocialButton social="kakao" linked={false} />
          <SocialButton social="apple" linked={false} />
          <SocialButton social="google" linked={false} />
        </Section>
      </div>
    </main>
  )
}
