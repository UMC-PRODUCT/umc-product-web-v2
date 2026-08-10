import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { defineConfig } from "vite"
import { imagetools } from "vite-imagetools"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react(),
    imagetools({ removeMetadata: true }),
    svgr(),
    tailwindcss(),
  ],
  build: {
    /* 학교 로고는 소개 랜딩 하단 마퀴에서 loading="lazy" 로 받는다. WebP 로 바꾸며
       대부분 4KB 아래가 됐는데, 그러면 기본 assetsInlineLimit 에 걸려 JS 에
       base64 로 박힌다. lazy 가 무력화되고 엔트리 청크만 커지므로 제외한다. */
    assetsInlineLimit: (filePath) =>
      filePath.includes("/image/about/schools/") ? false : undefined,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://dev.api.university.neordinary.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
