// FSD 레이어 경계 위반 래칫(ratchet) 체크.
// boundaries/dependencies 위반은 현재 warn이라 빌드를 막지 않는다. 이 스크립트는
// 위반 수가 baseline을 넘으면 실패시켜 "신규 위반 유입"만 차단한다.
// 위반이 baseline보다 줄면 통과시키되 baseline을 낮추라고 안내한다(점진 강화).
//
// 사용: node scripts/check-boundaries.mjs
// baseline을 줄였다면 아래 BASELINE 값을 실제 수치로 낮춰 커밋한다.

import { execSync } from "node:child_process"

// 2026-07-07 기준 남은 위반 20건(전부 정당한 feature 간 수평 결합).
// 역방향/순환 위반은 0. 위반을 더 줄이면 이 값을 낮춘다.
const BASELINE = 20
const RULE = "boundaries/dependencies"

let raw
try {
  raw = execSync("npx eslint src --format json", {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
} catch (err) {
  // eslint가 error(비 boundaries 규칙)로 non-zero 종료해도 stdout에 JSON은 실려 온다.
  raw = err.stdout
  if (!raw) {
    console.error("eslint 실행 실패:", err.message)
    process.exit(1)
  }
}

const results = JSON.parse(raw)
const violations = []
for (const file of results) {
  for (const msg of file.messages) {
    if (msg.ruleId === RULE) {
      violations.push(`${file.filePath}:${msg.line} ${msg.message}`)
    }
  }
}

const count = violations.length
console.log(`FSD 경계 위반: ${count}건 (baseline ${BASELINE})`)

if (count > BASELINE) {
  console.error(
    `\n❌ 위반이 baseline(${BASELINE})보다 ${count - BASELINE}건 늘었습니다. ` +
      `신규 위반을 제거하거나 하위 레이어로 의존을 정리하세요.\n`,
  )
  for (const v of violations) console.error(`  - ${v}`)
  process.exit(1)
}

if (count < BASELINE) {
  console.log(
    `\n✅ 위반이 baseline보다 ${BASELINE - count}건 줄었습니다. ` +
      `scripts/check-boundaries.mjs의 BASELINE을 ${count}로 낮춰 커밋하세요.`,
  )
} else {
  console.log("✅ 신규 위반 없음.")
}
