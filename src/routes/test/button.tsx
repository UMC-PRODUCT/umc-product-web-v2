import { createFileRoute } from "@tanstack/react-router"

import SvgPersonButtonIcon from "@/assets/icon/people/PersonButtonIcon"
import { Button } from "@/components/common/Button"

export const Route = createFileRoute("/test/button")({
  component: ButtonTestPage,
})

const VARIANTS = ["fill", "weak"] as const
const COLORS = ["brand", "neutral"] as const
const SIZES = ["m", "s"] as const

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-label-1-semibold text-teal-gray-500 border-teal-gray-100 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-caption-2-regular text-teal-gray-400 w-28 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  )
}

function ButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Button Test Page
      </h1>

      <div className="flex flex-col gap-10">
        {SIZES.map((size) => (
          <Section key={size} title={`Size ${size.toUpperCase()} — Default`}>
            {VARIANTS.map((variant) => (
              <Row key={variant} label={`variant=${variant}`}>
                {COLORS.map((color) => (
                  <Button
                    key={color}
                    size={size}
                    variant={variant}
                    color={color}
                  >
                    {color === "brand" ? "Brand" : "Neutral"}
                  </Button>
                ))}
              </Row>
            ))}
          </Section>
        ))}

        <Section title="Size M — Disabled">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={`variant=${variant}`}>
              {COLORS.map((color) => (
                <Button
                  key={color}
                  size="m"
                  variant={variant}
                  color={color}
                  disabled
                >
                  {color === "brand" ? "Brand" : "Neutral"}
                </Button>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Size M — Loading">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={`variant=${variant}`}>
              {COLORS.map((color) => (
                <Button
                  key={color}
                  size="m"
                  variant={variant}
                  color={color}
                  isLoading
                >
                  {color === "brand" ? "Brand" : "Neutral"}
                </Button>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Icon — Default">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={`variant=${variant}`}>
              {COLORS.map((color) => (
                <Button key={color} size="icon" variant={variant} color={color}>
                  <SvgPersonButtonIcon />
                </Button>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Icon — Disabled">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={`variant=${variant}`}>
              {COLORS.map((color) => (
                <Button
                  key={color}
                  size="icon"
                  variant={variant}
                  color={color}
                  disabled
                >
                  <SvgPersonButtonIcon />
                </Button>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Icon — Loading">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={`variant=${variant}`}>
              {COLORS.map((color) => (
                <Button
                  key={color}
                  size="icon"
                  variant={variant}
                  color={color}
                  isLoading
                >
                  <SvgPersonButtonIcon />
                </Button>
              ))}
            </Row>
          ))}
        </Section>
      </div>
    </main>
  )
}
