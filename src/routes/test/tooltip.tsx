import { createFileRoute } from "@tanstack/react-router"

import { Tooltip } from "@/components/tooltip/Tooltip"

export const Route = createFileRoute("/test/tooltip")({
  component: TooltipTestPage,
})

const SIZES = ["big", "small"] as const
const DARKS = [true, false] as const
const SIDES = ["top", "bottom", "left", "right"] as const

function TooltipTestPage() {
  return (
    <main className="flex min-h-screen flex-col gap-12 p-16">
      <h1 className="text-heading-6-semibold text-teal-gray-900">
        Tooltip Test Page
      </h1>

      {SIDES.map((side) => (
        <section key={side} className="flex flex-col gap-6">
          <h2 className="text-subtitle-3-semibold text-teal-gray-700 capitalize">
            side: {side}
          </h2>
          <div className="flex flex-wrap gap-16">
            {SIZES.map((size) =>
              DARKS.map((dark) => (
                <div
                  key={`${side}-${size}-${String(dark)}`}
                  className="flex flex-col items-center gap-2"
                >
                  <Tooltip
                    content={
                      size === "big"
                        ? "사용자에게 정보를 안내 할 Tooltip Message사용자에게 정보를 안내 할 Tooltip Message사용자에게 정보를 안내 할 Tooltip Message"
                        : "Tooltips"
                    }
                    size={size}
                    dark={dark}
                    side={side}
                  >
                    <button
                      type="button"
                      className="bg-teal-gray-100 text-teal-gray-700 text-label-2-medium cursor-pointer rounded-[6px] px-3 py-1.5"
                    >
                      hover
                    </button>
                  </Tooltip>
                  <span className="text-caption-2-regular text-teal-gray-400">
                    {size} / {dark ? "dark" : "light"}
                  </span>
                </div>
              )),
            )}
          </div>
        </section>
      ))}
    </main>
  )
}
