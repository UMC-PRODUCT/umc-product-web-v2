import js from "@eslint/js"
import boundaries from "eslint-plugin-boundaries"
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
    // FSD 레이어 경계 규칙. 의존 방향 (상위 -> 하위):
    // app > routes(pages) > widgets > features > entities > shared|types
    // 하위 레이어는 상위 레이어를 import 할 수 없다. 베이스라인 확보를 위해 warn으로
    // 시작하고, 구조 개편 완료 후 error로 전환한다.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}", "src/test/**"],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "routes", pattern: "src/routes" },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        { type: "shared", pattern: "src/shared" },
        { type: "types", pattern: "src/types" },
      ],
      "boundaries/include": ["src/**/*"],
      "import/resolver": {
        typescript: {
          project: "tsconfig.app.json",
        },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "warn",
        {
          default: "disallow",
          policies: [
            {
              // app은 조립 루트: 자기 자신과 routes를 포함한 모든 하위 레이어 참조 가능
              from: [{ element: { type: "app" } }],
              allow: [
                { to: { element: { type: "app" } } },
                { to: { element: { type: "routes" } } },
                { to: { element: { type: "widgets" } } },
                { to: { element: { type: "features" } } },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "routes" } }],
              allow: [
                { to: { element: { type: "routes" } } },
                { to: { element: { type: "widgets" } } },
                { to: { element: { type: "features" } } },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "widgets" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "widgets",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
                { to: { element: { type: "features" } } },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "features" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "features",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "entities" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "entities",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [
                { element: { type: "shared" } },
                { element: { type: "types" } },
              ],
              allow: [
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  {
    files: ["src/shared/analytics/ga.ts"],
    rules: {
      "prefer-rest-params": "off",
    },
  },
)
