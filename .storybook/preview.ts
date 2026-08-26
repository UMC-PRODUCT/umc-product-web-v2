import "../src/app/app.css"

import { createElement } from "react"

import type { Decorator, Preview } from "@storybook/react-vite"

function getRoutePaths(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (!Array.isArray(value)) return []
  return value.filter((path): path is string => typeof path === "string")
}

const withRoutePath: Decorator = (Story, context) => {
  const routePaths = getRoutePaths(context.parameters.routePath)

  if (routePaths.length === 0) return createElement(Story)

  return createElement(
    "div",
    { className: "flex w-full flex-col gap-3" },
    createElement(
      "div",
      {
        "data-testid": "storybook-route-path",
        className:
          "flex flex-wrap items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-700",
      },
      createElement("span", { className: "font-semibold" }, "사용 라우트"),
      ...routePaths.map((routePath) =>
        createElement(
          "code",
          { key: routePath, className: "rounded bg-white px-2 py-1" },
          routePath,
        ),
      ),
    ),
    createElement(Story),
  )
}

const preview: Preview = {
  decorators: [withRoutePath],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
}

export default preview
