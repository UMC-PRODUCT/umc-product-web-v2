import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import puppeteer from "puppeteer"
import { preview } from "vite"

const PORT = 4173
const DIST = join(process.cwd(), "dist")

const ROUTES = [
  { path: "/intro", titleMatch: "사용 가이드" },
  { path: "/login", titleMatch: "로그인" },
  { path: "/login/default", titleMatch: "UMC 계정 로그인" },
  { path: "/signup", titleMatch: "회원가입" },
]

const BLOCKED_HOSTS = ["googletagmanager.com", "google-analytics.com"]

async function run() {
  let server
  let browser

  try {
    server = await preview({ preview: { port: PORT, strictPort: true } })
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    for (const route of ROUTES) {
      const page = await browser.newPage()

      try {
        await page.setRequestInterception(true)
        page.on("request", (req) => {
          const url = req.url()
          if (BLOCKED_HOSTS.some((host) => url.includes(host))) req.abort()
          else req.continue()
        })

        const target = `http://localhost:${PORT}${route.path}`
        try {
          await page.goto(target, { waitUntil: "networkidle2", timeout: 20000 })
        } catch (err) {
          if (err.name !== "TimeoutError") throw err
          console.warn(`networkidle 대기 타임아웃, 계속 진행: ${target}`)
        }

        await page.waitForFunction(
          (match) => document.title.includes(match),
          { timeout: 15000 },
          route.titleMatch,
        )

        const html = await page.content()
        const outPath = join(DIST, route.path.replace(/^\//, ""), "index.html")
        mkdirSync(dirname(outPath), { recursive: true })
        writeFileSync(outPath, html, "utf-8")

        console.log(`prerendered ${route.path} -> ${outPath}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    if (browser) await browser.close()
    if (server) await server.close()
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
