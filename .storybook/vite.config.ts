import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { defineConfig } from "vite"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
})
