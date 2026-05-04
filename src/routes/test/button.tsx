import { createFileRoute } from "@tanstack/react-router"

import { Button } from "@/shared/ui/Button"

export const Route = createFileRoute("/test/button")({
  component: ButtonTestPage,
})

const VARIANTS = ["fill", "weak"] as const
const COLORS = ["primary", "neutral"] as const
const SIZES = ["xs", "s", "m", "lg", "xl"] as const

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

function ButtonTable({
  rows,
}: {
  rows: { label: string; cells: React.ReactNode[] }[]
}) {
  return (
    <table className="border-collapse">
      <thead>
        <tr>
          <th className="text-caption-2-regular text-teal-gray-400 w-36 pr-8 pb-3 text-left font-normal">
            variant / color
          </th>
          {SIZES.map((s) => (
            <th
              key={s}
              className="text-caption-2-regular text-teal-gray-400 px-2 pb-3 text-center font-normal"
            >
              {s.toUpperCase()}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className="text-caption-2-regular text-teal-gray-400 py-2 pr-8 align-middle whitespace-nowrap">
              {row.label}
            </td>
            {row.cells.map((cell, i) => (
              <td key={i} className="px-2 py-2 text-center align-middle">
                {cell ?? (
                  <span className="text-caption-2-regular text-teal-gray-200">
                    —
                  </span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ButtonTestPage() {
  return (
    <main className="bg-teal-gray-50 min-h-screen w-full p-10">
      <h1 className="text-heading-6-semibold text-teal-gray-900 mb-10">
        Button Test Page
      </h1>

      <div className="flex flex-col gap-10">
        <Section title="Default">
          <ButtonTable
            rows={VARIANTS.flatMap((variant) =>
              COLORS.map((color) => ({
                label: `${variant} / ${color}`,
                cells: SIZES.map((size) => (
                  <Button size={size} variant={variant} color={color}>
                    버튼
                  </Button>
                )),
              })),
            )}
          />
        </Section>

        <Section title="Disabled">
          <ButtonTable
            rows={VARIANTS.flatMap((variant) =>
              COLORS.map((color) => ({
                label: `${variant} / ${color}`,
                cells: SIZES.map((size) => (
                  <Button size={size} variant={variant} color={color} disabled>
                    버튼
                  </Button>
                )),
              })),
            )}
          />
        </Section>

        <Section title="Loading">
          <ButtonTable
            rows={VARIANTS.flatMap((variant) =>
              COLORS.map((color) => ({
                label: `${variant} / ${color}`,
                cells: SIZES.map((size) => (
                  <Button size={size} variant={variant} color={color} isLoading>
                    버튼
                  </Button>
                )),
              })),
            )}
          />
        </Section>

        <Section title="With Icon — Default">
          <ButtonTable
            rows={[
              ...VARIANTS.flatMap((variant) =>
                COLORS.map((color) => ({
                  label: `${variant} / ${color}`,
                  cells: [
                    null,
                    <Button size="s" variant={variant} color={color} icon>
                      버튼
                    </Button>,
                    <Button size="m" variant={variant} color={color} icon>
                      버튼
                    </Button>,
                    null,
                    null,
                  ],
                })),
              ),
              ...VARIANTS.map((variant) => ({
                label: `${variant} / white`,
                cells: [
                  <Button size="xs" variant={variant} color="white" icon>
                    버튼
                  </Button>,
                  null,
                  null,
                  null,
                  null,
                ],
              })),
            ]}
          />
        </Section>

        <Section title="With Icon — Disabled">
          <ButtonTable
            rows={[
              ...VARIANTS.flatMap((variant) =>
                COLORS.map((color) => ({
                  label: `${variant} / ${color}`,
                  cells: [
                    null,
                    <Button
                      size="s"
                      variant={variant}
                      color={color}
                      icon
                      disabled
                    >
                      버튼
                    </Button>,
                    <Button
                      size="m"
                      variant={variant}
                      color={color}
                      icon
                      disabled
                    >
                      버튼
                    </Button>,
                    null,
                    null,
                  ],
                })),
              ),
              ...VARIANTS.map((variant) => ({
                label: `${variant} / white`,
                cells: [
                  <Button
                    size="xs"
                    variant={variant}
                    color="white"
                    icon
                    disabled
                  >
                    버튼
                  </Button>,
                  null,
                  null,
                  null,
                  null,
                ],
              })),
            ]}
          />
        </Section>

        <Section title="With Icon — Loading">
          <ButtonTable
            rows={VARIANTS.flatMap((variant) =>
              COLORS.map((color) => ({
                label: `${variant} / ${color}`,
                cells: [
                  null,
                  <Button
                    size="s"
                    variant={variant}
                    color={color}
                    icon
                    isLoading
                  >
                    버튼
                  </Button>,
                  <Button
                    size="m"
                    variant={variant}
                    color={color}
                    icon
                    isLoading
                  >
                    버튼
                  </Button>,
                  null,
                  null,
                ],
              })),
            )}
          />
        </Section>
      </div>
    </main>
  )
}
