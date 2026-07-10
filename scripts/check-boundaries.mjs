// FSD 레이어 경계 위반 래칫(ratchet) 체크.
// boundaries/dependencies 위반은 현재 warn이라 빌드를 막지 않는다. 이 스크립트는
// 위반을 방향별로 분류해 두 가지 정책을 적용한다.
//   1) upward(하위 레이어 -> 상위 레이어 역방향): 무조건 실패(무관용).
//      lateral 위반을 제거하며 역방향을 하나 끼워 넣어도(총량 동일) 차단된다.
//   2) lateral(같은 레이어 슬라이스 간 수평 결합): baseline 래칫으로 관리.
//      baseline을 넘으면 실패, 줄면 baseline 갱신을 강제(실패)해 드리프트를 막는다.
//
// 주의: FSD "레이어 역방향/순환 0"이 곧 "모듈 순환 0"은 아니다. 같은 레이어의
// 슬라이스 lateral 순환(예: features/application <-> features/project)은 아래
// LATERAL_BASELINE에 포함돼 있으며, 실제 런타임 순환 검출은 madge/dependency-cruiser
// 같은 별도 도구가 필요하다.
//
// 사용: node scripts/check-boundaries.mjs
// lateral 위반을 줄였다면 아래 LATERAL_BASELINE 값을 실제 수치로 낮춰 커밋한다.

import { execSync } from "node:child_process"

// 2026-07-10 기준 lateral 위반 13건(features 슬라이스 간 수평 결합).
// upward(역방향) 위반은 0이며 baseline 없이 무조건 차단한다.
const LATERAL_BASELINE = 13
const RULE = "boundaries/dependencies"

// 레이어 상하 순서(위->아래). 숫자가 클수록 하위 레이어다.
// 하위(큰 값) -> 상위(작은 값) 참조가 upward(역방향) 위반이다.
const LAYER_RANK = {
  app: 0,
  routes: 1,
  widgets: 2,
  features: 3,
  entities: 4,
  shared: 5,
  types: 5,
}

// boundaries 위반 메시지에서 from/to 레이어 타입을 추출해 방향을 분류한다.
// 메시지 형식: '... from elements of type "X" ... to elements of type "Y" ...'
function classifyDirection(message) {
  const match = message.match(
    /from elements of type "([^"]+)".*to elements of type "([^"]+)"/,
  )
  if (!match) return "unknown"

  const fromRank = LAYER_RANK[match[1]]
  const toRank = LAYER_RANK[match[2]]
  if (fromRank === undefined || toRank === undefined) return "unknown"

  if (toRank < fromRank) return "upward" // 하위 -> 상위 역방향
  if (toRank === fromRank) return "lateral" // 같은 레이어 수평 결합
  return "downward" // 정상 방향은 애초에 위반으로 뜨지 않는다
}

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
const buckets = { upward: [], lateral: [], downward: [], unknown: [] }
for (const file of results) {
  for (const msg of file.messages) {
    if (msg.ruleId !== RULE) continue
    const label = `${file.filePath}:${msg.line} ${msg.message}`
    buckets[classifyDirection(msg.message)].push(label)
  }
}

const upward = buckets.upward.length
const lateral = buckets.lateral.length
const unknown = buckets.unknown.length + buckets.downward.length
console.log(
  `FSD 경계 위반: upward ${upward}건 / lateral ${lateral}건 ` +
    `(lateral baseline ${LATERAL_BASELINE})`,
)

let failed = false

// 1) upward(역방향)는 무관용. lateral을 지우며 역방향을 끼워 넣는 "교체"를 차단한다.
if (upward > 0) {
  console.error(`\n❌ 역방향(하위->상위) 위반 ${upward}건. 무조건 차단됩니다.\n`)
  for (const v of buckets.upward) console.error(`  - ${v}`)
  failed = true
}

// 방향을 분류하지 못한 위반은 래칫이 놓칠 수 있으므로 실패시키고 스크립트 갱신을 요구한다.
if (unknown > 0) {
  console.error(
    `\n❌ 방향 분류 불가 위반 ${unknown}건. ` +
      `LAYER_RANK/메시지 파싱을 점검해 스크립트를 갱신하세요.\n`,
  )
  for (const v of [...buckets.unknown, ...buckets.downward]) {
    console.error(`  - ${v}`)
  }
  failed = true
}

// 2) lateral은 baseline 래칫. 늘면 실패, 줄면 baseline 갱신을 강제(드리프트 방지).
if (lateral > LATERAL_BASELINE) {
  console.error(
    `\n❌ lateral 위반이 baseline(${LATERAL_BASELINE})보다 ` +
      `${lateral - LATERAL_BASELINE}건 늘었습니다. 신규 수평 결합을 제거하세요.\n`,
  )
  for (const v of buckets.lateral) console.error(`  - ${v}`)
  failed = true
} else if (lateral < LATERAL_BASELINE) {
  console.error(
    `\n❌ lateral 위반이 baseline보다 ${LATERAL_BASELINE - lateral}건 줄었습니다. ` +
      `scripts/check-boundaries.mjs의 LATERAL_BASELINE을 ${lateral}로 낮춰 커밋하세요.\n`,
  )
  failed = true
}

if (failed) process.exit(1)
console.log("✅ 신규 위반 없음.")
