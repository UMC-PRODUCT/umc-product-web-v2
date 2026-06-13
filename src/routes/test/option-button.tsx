import { createFileRoute } from "@tanstack/react-router"

import { OptionButton } from "@/shared/ui/option-button/OptionButton"
import { OptionButtonGroup } from "@/shared/ui/option-button/OptionButtonGroup"

export const Route = createFileRoute("/test/option-button")({
  component: OptionButtonTestPage,
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
      <h2 className="border-teal-gray-100 text-label-1-semibold text-teal-gray-500 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function OptionButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        OptionButton Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Segmented — 선택 이동 (예시 1~4)">
          <div className="flex flex-col gap-3">
            <OptionButtonGroup variant="segmented" defaultValue="design">
              <OptionButton value="design">Design</OptionButton>
              <OptionButton value="frontend">Frontend</OptionButton>
              <OptionButton value="backend">Backend</OptionButton>
              <OptionButton value="pm">PM</OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton value="design">Design</OptionButton>
              <OptionButton value="frontend">Frontend</OptionButton>
              <OptionButton value="backend">Backend</OptionButton>
              <OptionButton value="pm">PM</OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="backend">
              <OptionButton value="design">Design</OptionButton>
              <OptionButton value="frontend">Frontend</OptionButton>
              <OptionButton value="backend">Backend</OptionButton>
              <OptionButton value="pm">PM</OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="pm">
              <OptionButton value="design">Design</OptionButton>
              <OptionButton value="frontend">Frontend</OptionButton>
              <OptionButton value="backend">Backend</OptionButton>
              <OptionButton value="pm">PM</OptionButton>
            </OptionButtonGroup>
          </div>
        </Section>

        <Section title="Segmented — 선택 없음 (초기 상태)">
          <OptionButtonGroup variant="segmented">
            <OptionButton value="design">Design</OptionButton>
            <OptionButton value="frontend">Frontend</OptionButton>
            <OptionButton value="backend">Backend</OptionButton>
          </OptionButtonGroup>
        </Section>

        <Section title="Segmented — Disabled">
          <div className="flex flex-col gap-3">
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton value="design" disabled>
                Design
              </OptionButton>
              <OptionButton value="frontend">Frontend</OptionButton>
              <OptionButton value="backend" disabled>
                Backend
              </OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton value="design">Design</OptionButton>
              <OptionButton value="frontend" disabled>
                Frontend
              </OptionButton>
              <OptionButton value="backend">Backend</OptionButton>
            </OptionButtonGroup>
          </div>
        </Section>

        <Section title="Segmented sm — 선택 이동 (Left/Mid/Right/Last)">
          <div className="flex flex-col gap-3">
            <OptionButtonGroup variant="segmented" defaultValue="design">
              <OptionButton size="sm" value="design">
                Design
              </OptionButton>
              <OptionButton size="sm" value="frontend">
                Frontend
              </OptionButton>
              <OptionButton size="sm" value="backend">
                Backend
              </OptionButton>
              <OptionButton size="sm" value="pm">
                PM
              </OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton size="sm" value="design">
                Design
              </OptionButton>
              <OptionButton size="sm" value="frontend">
                Frontend
              </OptionButton>
              <OptionButton size="sm" value="backend">
                Backend
              </OptionButton>
              <OptionButton size="sm" value="pm">
                PM
              </OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="backend">
              <OptionButton size="sm" value="design">
                Design
              </OptionButton>
              <OptionButton size="sm" value="frontend">
                Frontend
              </OptionButton>
              <OptionButton size="sm" value="backend">
                Backend
              </OptionButton>
              <OptionButton size="sm" value="pm">
                PM
              </OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="pm">
              <OptionButton size="sm" value="design">
                Design
              </OptionButton>
              <OptionButton size="sm" value="frontend">
                Frontend
              </OptionButton>
              <OptionButton size="sm" value="backend">
                Backend
              </OptionButton>
              <OptionButton size="sm" value="pm">
                PM
              </OptionButton>
            </OptionButtonGroup>
          </div>
        </Section>

        <Section title="Segmented sm — 선택 없음">
          <OptionButtonGroup variant="segmented">
            <OptionButton size="sm" value="design">
              Design
            </OptionButton>
            <OptionButton size="sm" value="frontend">
              Frontend
            </OptionButton>
            <OptionButton size="sm" value="backend">
              Backend
            </OptionButton>
          </OptionButtonGroup>
        </Section>

        <Section title="Segmented sm — Disabled">
          <div className="flex flex-col gap-3">
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton size="sm" value="design" disabled>
                Design
              </OptionButton>
              <OptionButton size="sm" value="frontend">
                Frontend
              </OptionButton>
              <OptionButton size="sm" value="backend" disabled>
                Backend
              </OptionButton>
            </OptionButtonGroup>
            <OptionButtonGroup variant="segmented" defaultValue="frontend">
              <OptionButton size="sm" value="design">
                Design
              </OptionButton>
              <OptionButton size="sm" value="frontend" disabled>
                Frontend
              </OptionButton>
              <OptionButton size="sm" value="backend">
                Backend
              </OptionButton>
            </OptionButtonGroup>
          </div>
        </Section>
      </div>
    </main>
  )
}
