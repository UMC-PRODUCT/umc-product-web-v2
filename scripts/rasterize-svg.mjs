import { statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const here = path.dirname(fileURLToPath(import.meta.url))
const assetDir = path.resolve(here, "../src/features/intro/assets/06")

// width = 표시 크기의 2x (retina). intro는 1440px 고정폭 데스크톱 전용.
const targets = [
  { file: "mockup06-01.svg", width: 1300 },
  { file: "mockup06-02-01.svg", width: 1300 },
  { file: "mockup06-02-02.svg", width: 676 },
  { file: "mockup06-04-02.svg", width: 556 },
  { file: "mockup06-06-02.svg", width: 342 },
  { file: "mockup06-08-02.svg", width: 810 },
]

const kb = (n) => `${(n / 1024).toFixed(1)}KB`

for (const { file, width } of targets) {
  const src = path.join(assetDir, file)
  const out = src.replace(/\.svg$/, ".webp")
  const before = statSync(src).size
  // density를 높여 큰 픽셀로 렌더한 뒤 목표 width로 다운스케일 → 선명도 확보
  await sharp(src, { density: 300 })
    .resize({ width })
    .webp({ quality: 85 })
    .toFile(out)
  const after = statSync(out).size
  const cut = Math.round((1 - after / before) * 100)
  console.log(
    `${file} (${kb(before)}) -> ${path.basename(out)} @${width}px (${kb(after)}, ${cut}% 감소)`,
  )
}
