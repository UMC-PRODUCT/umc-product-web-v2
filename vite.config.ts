import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig, loadEnv } from "vite"
import svgr from "vite-plugin-svgr"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiOrigin = new URL(env.VITE_API_BASE_URL).origin

  return {
    plugins: [
      TanStackRouterVite({
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
        autoCodeSplitting: true,
      }),
      react(),
      svgr(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
