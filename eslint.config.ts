import js from "@eslint/js"
import perfectionist from "eslint-plugin-perfectionist"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
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
        "error",
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
        "error",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
      "perfectionist/sort-exports": [
        "error",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
      "perfectionist/sort-named-exports": [
        "error",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
)
