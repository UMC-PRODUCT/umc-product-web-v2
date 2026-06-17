import js from "@eslint/js"
import perfectionist from "eslint-plugin-perfectionist"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import tseslint from "typescript-eslint"

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  {
    ignores: [
      ".claude/**",
      ".playwright-mcp/**",
      "dist",
      "src/routeTree.gen.ts",
      "src/assets/svg/**",
      "src/types/api.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      perfectionist,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "perfectionist/sort-imports": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
          newlinesBetween: 1,
          internalPattern: ["^@/.+"],
          groups: [
            "side-effect",
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
            ["type-builtin", "type-external"],
            "type-internal",
            ["type-parent", "type-sibling", "type-index"],
            "unknown",
          ],
        },
      ],
      "perfectionist/sort-named-imports": [
        "warn",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
      "perfectionist/sort-exports": [
        "warn",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
      "perfectionist/sort-named-exports": [
        "warn",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
)
