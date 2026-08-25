import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  core: {
    builder: {
      name: "@storybook/builder-vite",
      options: {
        viteConfigPath: "./.storybook/vite.config.ts",
      },
    },
    disableTelemetry: true,
  },
  docs: {
    autodocs: "tag",
  },
}

export default config
