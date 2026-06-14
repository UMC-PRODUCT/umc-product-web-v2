# 사이드바 역할/파트 뷰 스위처 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 다중 권한/파트 사용자가 사이드바 상단 드롭다운에서 뷰(admin/pm/others)를 선택하면, 그 정체성에 허용된 사이드바·라우트·페이지 권한만 사용하도록 하고, 학교 운영진의 '지원 현황'을 숨긴다.

**Architecture:** 선택된 `mode`로 `me`를 좁힌 `viewMe`를 만들어(`projectViewMe`) 기존 `identity` 함수에 그대로 전달한다. 권한 게이팅 소비처는 `useMe` → `useViewMe`로, 라우트 가드는 `ensureMe` 후 `projectViewMe`로 판정한다. 신원 표시(이름/아바타/역할칩)는 `me`를 유지한다.

**Tech Stack:** React, TanStack Router, Zustand(+persist), Vitest, Tailwind, Playwright(E2E)

> 커밋 규칙: 이 레포는 commitlint `extends: gitmoji`라 모든 커밋 메시지는 gitmoji prefix가 필요하다(예: `✨ feat: ...`). 본문과 footer 사이 빈 줄 필요.

---

## File Structure

**신규**

- `src/shared/view-mode/projectViewMe.ts` — `mode`로 `me`를 좁히는 순수 함수
- `src/shared/view-mode/projectViewMe.test.ts`
- `src/shared/view-mode/availableViewModes.ts` — 가용 mode 계산 순수 함수
- `src/shared/view-mode/availableViewModes.test.ts`
- `src/shared/view-mode/useViewMe.ts` — `useMe` + 현재 mode → `viewMe`
- `src/shared/view-mode/useAvailableViewModes.ts` — 훅 래퍼 + 현재 mode 보정
- `src/components/sidebar/SideBarViewSwitcher.tsx` — 드롭다운 UI + 전환 네비게이션

**수정**

- `src/shared/view-mode/index.ts` — store에서 `previewMode`/`viewerBranch` 제거, `sessionStorage` persist 추가
- `src/components/sidebar/utils.ts` + `utils.test.ts` — `canViewApplications` 플래그
- `src/components/sidebar/useVisibleSidebarSections.ts` — `useViewMe` 사용
- `src/components/sidebar/SideBar.tsx`, `MobileSidebarDrawerContent.tsx` — 드롭다운 배치
- `src/components/header/Header.tsx` — `navItems`를 `viewMe` 기반으로
- 라우트 가드 9곳, 페이지 권한 분기 6곳 — `viewMe` 전환

---

## Task 1: ViewMode store 정리 + sessionStorage persist

**Files:**

- Modify: `src/shared/view-mode/index.ts`

- [ ] **Step 1: store를 persist로 교체하고 미사용 필드 제거**

`src/shared/view-mode/index.ts` 전체를 아래로 교체:

```typescript
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export const VIEW_MODE_OPTIONS = [
  { mode: "admin", label: "Admin View" },
  { mode: "pm", label: "Challenger-Plan View" },
  { mode: "others", label: "Challenger-Others View" },
] as const

export type ViewMode = (typeof VIEW_MODE_OPTIONS)[number]["mode"]

interface ViewModeState {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  setModeByIndex: (index: number) => void
}

function modeFromIndex(index: number): ViewMode {
  return VIEW_MODE_OPTIONS[index]?.mode ?? "admin"
}

export function indexFromMode(mode: ViewMode): number {
  const idx = VIEW_MODE_OPTIONS.findIndex((item) => item.mode === mode)
  return idx === -1 ? 0 : idx
}

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      mode: "admin",
      setMode: (mode) => set({ mode }),
      setModeByIndex: (index) => set({ mode: modeFromIndex(index) }),
    }),
    {
      name: "umc-view-mode",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
```

- [ ] **Step 2: 기존 소비처 호환 확인 (`useMatchingStatusData`)**

Run: `pnpm exec tsc -b --noEmit`
Expected: PASS. `useMatchingStatusData.ts`는 `s.mode`만 읽으므로 영향 없음. (`previewMode`/`viewerBranch` 참조가 어딘가 남아 있으면 타입 에러가 나므로 여기서 잡힌다.)

- [ ] **Step 3: Commit**

```bash
git add src/shared/view-mode/index.ts
git commit -m "$(printf '♻️ refactor: view-mode 스토어를 sessionStorage persist로 정리\n\n미사용 previewMode/viewerBranch 제거하고 setMode 추가, sessionStorage 영속화')"
```

---

## Task 2: `projectViewMe` 순수 함수 (TDD)

**Files:**

- Create: `src/shared/view-mode/projectViewMe.ts`
- Test: `src/shared/view-mode/projectViewMe.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/shared/view-mode/projectViewMe.test.ts`:

```typescript
import { describe, expect, it } from "vitest"

import { projectViewMe } from "./projectViewMe"

import type { MemberInfoResponse } from "@/features/auth/api/me"

const baseMe = {
  id: 1,
  name: "홍길동",
  nickname: "길동",
  email: "a@b.com",
  schoolId: 1,
  schoolName: "UMC",
  profileImageLink: "",
  status: "ACTIVE",
  roles: [{ roleType: "CENTRAL_OPERATING_TEAM_MEMBER" }],
  challengerRecords: [
    { challengerId: "1", gisuId: "10", part: "PLAN" },
    { challengerId: "2", gisuId: "9", part: "WEB" },
  ],
} as unknown as MemberInfoResponse

describe("projectViewMe", () => {
  it("admin: challengerRecords를 비운다", () => {
    const v = projectViewMe(baseMe, "admin")
    expect(v?.roles).toHaveLength(1)
    expect(v?.challengerRecords).toEqual([])
  })

  it("pm: roles를 비우고 PLAN 기록만 남긴다", () => {
    const v = projectViewMe(baseMe, "pm")
    expect(v?.roles).toEqual([])
    expect(v?.challengerRecords?.map((r) => r.part)).toEqual(["PLAN"])
  })

  it("others: roles를 비우고 비-PLAN 기록만 남긴다", () => {
    const v = projectViewMe(baseMe, "others")
    expect(v?.roles).toEqual([])
    expect(v?.challengerRecords?.map((r) => r.part)).toEqual(["WEB"])
  })

  it("me가 undefined면 undefined 반환", () => {
    expect(projectViewMe(undefined, "admin")).toBeUndefined()
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm exec vitest run src/shared/view-mode/projectViewMe.test.ts`
Expected: FAIL — `projectViewMe` 모듈 없음.

- [ ] **Step 3: 최소 구현**

`src/shared/view-mode/projectViewMe.ts`:

```typescript
import type { MemberInfoResponse } from "@/features/auth/api/me"
import type { ViewMode } from "."

export function projectViewMe(
  me: MemberInfoResponse | undefined,
  mode: ViewMode,
): MemberInfoResponse | undefined {
  if (!me) return me
  const records = me.challengerRecords ?? []
  switch (mode) {
    case "admin":
      return { ...me, challengerRecords: [] }
    case "pm":
      return {
        ...me,
        roles: [],
        challengerRecords: records.filter((r) => r.part === "PLAN"),
      }
    case "others":
      return {
        ...me,
        roles: [],
        challengerRecords: records.filter((r) => r.part !== "PLAN"),
      }
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm exec vitest run src/shared/view-mode/projectViewMe.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/shared/view-mode/projectViewMe.ts src/shared/view-mode/projectViewMe.test.ts
git commit -m "$(printf '✨ feat: 선택 mode로 me를 좁히는 projectViewMe 추가\n\nadmin/pm/others 뷰별로 roles·challengerRecords를 투영하는 순수 함수와 테스트')"
```

---

## Task 3: `useViewMe` 훅

**Files:**

- Create: `src/shared/view-mode/useViewMe.ts`

- [ ] **Step 1: 구현 작성**

`src/shared/view-mode/useViewMe.ts`:

```typescript
import { useMe } from "@/features/auth/hooks/useMe"

import { useViewModeStore } from "."
import { projectViewMe } from "./projectViewMe"

import type { MemberInfoResponse } from "@/features/auth/api/me"

export function useViewMe(): {
  viewMe: MemberInfoResponse | undefined
  isLoading: boolean
} {
  const { data: me, isLoading } = useMe()
  const mode = useViewModeStore((s) => s.mode)
  return { viewMe: projectViewMe(me, mode), isLoading }
}
```

- [ ] **Step 2: 타입 체크**

Run: `pnpm exec tsc -b --noEmit`
Expected: PASS. (`useMe`가 `{ data, isLoading }`를 반환하는지 확인 — `ProfileDropdown.tsx`에서 `const { data: me } = useMe()` 패턴 사용 중.)

- [ ] **Step 3: Commit**

```bash
git add src/shared/view-mode/useViewMe.ts
git commit -m "$(printf '✨ feat: 현재 mode 기준 viewMe를 반환하는 useViewMe 훅 추가')"
```

---

## Task 4: 가용 ViewMode 계산 (TDD) + 훅

**Files:**

- Create: `src/shared/view-mode/availableViewModes.ts`
- Test: `src/shared/view-mode/availableViewModes.test.ts`
- Create: `src/shared/view-mode/useAvailableViewModes.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/shared/view-mode/availableViewModes.test.ts`:

```typescript
import { describe, expect, it } from "vitest"

import { computeAvailableViewModes } from "./availableViewModes"

import type { MemberInfoResponse } from "@/features/auth/api/me"

function makeMe(roleTypes: string[], parts: string[]): MemberInfoResponse {
  return {
    roles: roleTypes.map((roleType) => ({ roleType })),
    challengerRecords: parts.map((part, i) => ({
      challengerId: String(i),
      gisuId: String(10 - i),
      part,
    })),
  } as unknown as MemberInfoResponse
}

describe("computeAvailableViewModes", () => {
  it("운영진 + 비-PLAN 챌린저 → [admin, others]", () => {
    const me = makeMe(["CENTRAL_OPERATING_TEAM_MEMBER"], ["WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["admin", "others"])
  })

  it("운영진 + PLAN 챌린저 → [admin, pm]", () => {
    const me = makeMe(["CHAPTER_PRESIDENT"], ["PLAN"])
    expect(computeAvailableViewModes(me)).toEqual(["admin", "pm"])
  })

  it("PLAN + 비-PLAN만 → [pm, others]", () => {
    const me = makeMe([], ["PLAN", "WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["pm", "others"])
  })

  it("비-PLAN 챌린저만 → [others]", () => {
    const me = makeMe([], ["WEB"])
    expect(computeAvailableViewModes(me)).toEqual(["others"])
  })

  it("학교 운영진 단일 → [admin]", () => {
    const me = makeMe(["SCHOOL_PRESIDENT"], [])
    expect(computeAvailableViewModes(me)).toEqual(["admin"])
  })

  it("me undefined → []", () => {
    expect(computeAvailableViewModes(undefined)).toEqual([])
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm exec vitest run src/shared/view-mode/availableViewModes.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 최소 구현**

`src/shared/view-mode/availableViewModes.ts`:

```typescript
import { isAnyOperator } from "@/features/auth/model/identity"

import type { ViewMode } from "."
import type { MemberInfoResponse } from "@/features/auth/api/me"

export function computeAvailableViewModes(
  me: MemberInfoResponse | undefined,
): ViewMode[] {
  if (!me) return []
  const modes: ViewMode[] = []
  if (isAnyOperator(me)) modes.push("admin")
  const records = me.challengerRecords ?? []
  if (records.some((r) => r.part === "PLAN")) modes.push("pm")
  if (records.some((r) => r.part !== "PLAN")) modes.push("others")
  return modes
}
```

(우선순위 `admin > pm > others` 순서로 push하므로 결과 배열이 곧 우선순위 순서다.)

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm exec vitest run src/shared/view-mode/availableViewModes.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: 훅 작성 (현재 mode 보정 포함)**

`src/shared/view-mode/useAvailableViewModes.ts`:

```typescript
import { useEffect } from "react"

import { useMe } from "@/features/auth/hooks/useMe"

import { useViewModeStore } from "."
import { computeAvailableViewModes } from "./availableViewModes"

export function useAvailableViewModes() {
  const { data: me } = useMe()
  const mode = useViewModeStore((s) => s.mode)
  const setMode = useViewModeStore((s) => s.setMode)

  const availableModes = computeAvailableViewModes(me)
  const defaultMode = availableModes[0] ?? "admin"

  useEffect(() => {
    if (availableModes.length > 0 && !availableModes.includes(mode)) {
      setMode(defaultMode)
    }
  }, [availableModes, mode, defaultMode, setMode])

  return { availableModes, defaultMode }
}
```

- [ ] **Step 6: 타입 체크**

Run: `pnpm exec tsc -b --noEmit`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/shared/view-mode/availableViewModes.ts src/shared/view-mode/availableViewModes.test.ts src/shared/view-mode/useAvailableViewModes.ts
git commit -m "$(printf '✨ feat: 사용자 권한 기반 가용 ViewMode 계산 추가\n\nisAnyOperator·challengerRecords로 admin/pm/others 가용성 산출, 현재 mode 보정 훅 포함')"
```

---

## Task 5: 사이드바 권한을 viewMe로 + 학교운영진 지원현황 숨김 (TDD)

**Files:**

- Modify: `src/components/sidebar/utils.ts`
- Modify: `src/components/sidebar/utils.test.ts`
- Modify: `src/components/sidebar/useVisibleSidebarSections.ts`

- [ ] **Step 1: utils.test.ts에 실패 테스트 추가**

`src/components/sidebar/utils.test.ts`의 `ALL` 상수에 `canViewApplications: true`를 추가하고, `describe` 블록 안에 아래 테스트를 추가:

```typescript
it("canViewApplications=false면 지원 현황 항목 제거", () => {
  const result = filterSectionsByPermission(SIDEBAR_ITEMS, {
    ...ALL,
    canViewApplications: false,
  })
  expect(menuIds(result, "team-matching")).not.toContain(
    "matching-applications",
  )
})

it("canViewApplications=true면 지원 현황 항목 노출", () => {
  const result = filterSectionsByPermission(SIDEBAR_ITEMS, ALL)
  expect(menuIds(result, "team-matching")).toContain("matching-applications")
})
```

수정된 `ALL`:

```typescript
const ALL = {
  canAccessProjectSettings: true,
  canManageProjects: true,
  canManageRecruitment: true,
  canViewApplications: true,
}
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm exec vitest run src/components/sidebar/utils.test.ts`
Expected: FAIL — `SidebarPermissions`에 `canViewApplications` 없음(타입) 또는 항목 미필터.

- [ ] **Step 3: utils.ts에 canViewApplications 반영**

`src/components/sidebar/utils.ts`의 `SidebarPermissions` 인터페이스에 필드 추가:

```typescript
export interface SidebarPermissions {
  canAccessProjectSettings: boolean
  canManageProjects: boolean
  canManageRecruitment: boolean
  canViewApplications: boolean
}
```

함수 시그니처 구조분해에 `canViewApplications` 추가:

```typescript
export function filterSectionsByPermission(
  sections: readonly SideBarSection[],
  {
    canAccessProjectSettings,
    canManageProjects,
    canManageRecruitment,
    canViewApplications,
  }: SidebarPermissions,
): SideBarSection[] {
```

teamMatching 섹션의 `menus.filter` 콜백을 아래로 교체:

```typescript
if (section.id === SIDEBAR_ID.section.teamMatching) {
  return {
    ...section,
    menus: section.menus.filter((menu) => {
      if (menu.id === SIDEBAR_ID.item.matchingRounds)
        return canManageRecruitment
      if (menu.id === SIDEBAR_ID.item.matchingApplications)
        return canViewApplications
      return true
    }),
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm exec vitest run src/components/sidebar/utils.test.ts`
Expected: PASS (기존 + 신규 2 tests).

- [ ] **Step 5: useVisibleSidebarSections를 viewMe로 전환**

`src/components/sidebar/useVisibleSidebarSections.ts` 전체를 교체:

```typescript
import { useMemo } from "react"

import {
  canAccessProjectSettings,
  canManageProjects,
  isCurrentTermPm,
  isOperator,
} from "@/features/auth/model/identity"
import { SIDEBAR_ITEMS } from "@/shared/config/navigation"
import { useViewMe } from "@/shared/view-mode/useViewMe"

import { filterSectionsByPermission } from "./utils"

export function useVisibleSidebarSections() {
  const { viewMe, isLoading } = useViewMe()
  const canAccessSettings = canAccessProjectSettings(viewMe)
  const canManage = canManageProjects(viewMe)
  const canRecruit = isOperator(viewMe) || isCurrentTermPm(viewMe)
  const canViewApplications = isOperator(viewMe) || isCurrentTermPm(viewMe)

  const visibleSections = useMemo(
    () =>
      filterSectionsByPermission(SIDEBAR_ITEMS, {
        canAccessProjectSettings: canAccessSettings,
        canManageProjects: canManage,
        canManageRecruitment: canRecruit,
        canViewApplications,
      }),
    [canAccessSettings, canManage, canRecruit, canViewApplications],
  )

  return { visibleSections, isLoading }
}
```

- [ ] **Step 6: 타입 체크 + 전체 테스트**

Run: `pnpm exec tsc -b --noEmit && pnpm exec vitest run src/components/sidebar`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/sidebar/utils.ts src/components/sidebar/utils.test.ts src/components/sidebar/useVisibleSidebarSections.ts
git commit -m "$(printf '✨ feat: 사이드바 권한을 viewMe 기반으로 전환하고 지원현황 가시성 제어\n\ncanViewApplications 플래그로 학교 운영진의 지원 현황 메뉴를 숨기고, 사이드바 섹션 계산을 선택 뷰(viewMe) 기준으로 변경')"
```

---

## Task 6: `SideBarViewSwitcher` 드롭다운 UI + 배치 + 전환 네비게이션

**Files:**

- Create: `src/components/sidebar/SideBarViewSwitcher.tsx`
- Modify: `src/components/sidebar/SideBar.tsx`
- Modify: `src/components/sidebar/MobileSidebarDrawerContent.tsx`

- [ ] **Step 1: 드롭다운 컴포넌트 작성**

`src/components/sidebar/SideBarViewSwitcher.tsx`:

```typescript
import { useEffect, useRef, useState } from "react"

import ChevronDownIcon from "@/shared/assets/icon/chevron/ChevronDownIcon"
import { cn } from "@/shared/lib/utils"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import {
  VIEW_MODE_OPTIONS,
  useViewModeStore,
  type ViewMode,
} from "@/shared/view-mode"
import { useAvailableViewModes } from "@/shared/view-mode/useAvailableViewModes"

interface SideBarViewSwitcherProps {
  onSelect?: (mode: ViewMode) => void
  className?: string
}

export function SideBarViewSwitcher({
  onSelect,
  className,
}: SideBarViewSwitcherProps) {
  const { availableModes } = useAvailableViewModes()
  const mode = useViewModeStore((s) => s.mode)
  const setMode = useViewModeStore((s) => s.setMode)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false)
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [isOpen])

  if (availableModes.length < 2) return null

  const options = VIEW_MODE_OPTIONS.filter((o) =>
    availableModes.includes(o.mode),
  )
  const currentLabel =
    VIEW_MODE_OPTIONS.find((o) => o.mode === mode)?.label ?? options[0]?.label

  const handleSelect = (next: ViewMode) => {
    setIsOpen(false)
    if (next === mode) return
    setMode(next)
    onSelect?.(next)
  }

  return (
    <div ref={ref} className={cn("relative w-full px-3 pt-3", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="border-teal-gray-100 text-body-2-medium text-teal-gray-700 flex h-10 w-full items-center justify-between rounded-lg border bg-white px-4"
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="shadow-drop-neutral-1 absolute top-12 right-3 left-3 z-50 flex flex-col gap-0.5 rounded-lg bg-white p-1"
        >
          {options.map((o) => (
            <DropdownItem
              key={o.mode}
              label={o.label}
              isSelected={o.mode === mode}
              onClick={() => handleSelect(o.mode)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

> 주의: `ChevronDownIcon` import 경로는 실제 아이콘 파일 위치에 맞춘다. 없으면 `src/shared/assets/icon/chevron/` 하위에서 적절한 아이콘(예: `FilterDropDownIcon`)을 사용하거나 인라인 SVG로 대체한다. 구현 시 `ls src/shared/assets/icon/chevron/`로 확인.

- [ ] **Step 2: SideBar.tsx 상단에 배치 + 전환 네비게이션**

`SideBar.tsx`는 이미 `const { visibleSections } = useVisibleSidebarSections()`와 `pathname`, `resolveNavigationFromPathname` import를 가지고 있다. 드롭다운 `onSelect`는 mode만 바꾸고, 네비게이션은 `pathname`/`visibleSections` 변화를 보는 `useEffect`로 처리한다.

import 추가(누락 시만):

```typescript
import { useNavigate } from "@tanstack/react-router"

import { SideBarViewSwitcher } from "./SideBarViewSwitcher"
```

컴포넌트 본문에 추가:

```typescript
const navigate = useNavigate()

useEffect(() => {
  if (visibleSections.length === 0) return
  const active = resolveNavigationFromPathname(pathname, visibleSections)
  if (!active && visibleSections[0]?.menus[0]) {
    navigate({ to: visibleSections[0].menus[0].to })
  }
}, [visibleSections, pathname, navigate])
```

그리고 `<nav>` 내부, `Demo Day` span 위에 스위처를 렌더:

```tsx
      <SideBarViewSwitcher />
      {!isLoading && (
        <div className="flex flex-col py-4">
```

> 주의: 이 `useEffect`는 Task 5에서 추가한 `openSectionId` 동기화 `useEffect`와 별개다. `visibleSections`가 비어 있는 동안(로딩)에는 navigate하지 않는다.

- [ ] **Step 3: MobileSidebarDrawerContent에도 스위처 배치**

`src/components/sidebar/MobileSidebarDrawerContent.tsx` 상단(`<section>` 시작 직후, "Demo Day" span 위)에 추가:

```tsx
import { SideBarViewSwitcher } from "./SideBarViewSwitcher"
```

렌더 부분(섹션 최상단):

```tsx
    <section className="border-teal-gray-100 flex flex-col gap-3 border-t pt-4">
      <SideBarViewSwitcher
        className="px-0 pt-0"
        onSelect={onNavigate}
      />
      <span className="text-caption-2-medium text-teal-gray-400 px-1">
        Demo Day
      </span>
```

(모바일에서는 뷰 변경 시 드로어를 닫도록 `onSelect={onNavigate}`.)

- [ ] **Step 4: 빌드 + dev 서버로 렌더 확인**

Run: `pnpm build`
Expected: PASS. (dev 서버가 떠 있으면 `/test/header`에서 드롭다운 노출 확인 — 단 `/test/header`의 프리뷰 유저는 운영진 단일이라 옵션 1개로 드롭다운이 숨겨질 수 있다. 실제 다중자격 검증은 Task 10.)

- [ ] **Step 5: Commit**

```bash
git add src/components/sidebar/SideBarViewSwitcher.tsx src/components/sidebar/SideBar.tsx src/components/sidebar/MobileSidebarDrawerContent.tsx
git commit -m "$(printf '✨ feat: 사이드바 상단 역할/파트 뷰 스위처 드롭다운 추가\n\n가용 뷰가 2개 이상일 때만 노출되며, 선택 시 현재 경로가 새 뷰에서 사라지면 첫 메뉴로 이동')"
```

---

## Task 7: 라우트 가드를 viewMe 기준으로 전환

**Files (각 파일의 `beforeLoad`):**

- `src/routes/matching/rounds.tsx`
- `src/routes/matching/applications.tsx`
- `src/routes/matching/notice-publish.tsx`
- `src/routes/matching/index.tsx`
- `src/routes/matching/projects/management.tsx`
- `src/routes/matching/projects/new.tsx`
- `src/routes/matching/projects/announce/index.tsx`
- `src/routes/matching/projects/announce/notice-publish.tsx`
- `src/routes/admin/route.tsx`

- [ ] **Step 1: 공통 패턴 적용**

각 파일의 `beforeLoad`에서 `ensureMe`로 받은 `me`를 `projectViewMe(me, mode)`로 바꿔 판정한다. 파일 상단에 import 추가:

```typescript
import { projectViewMe } from "@/shared/view-mode/projectViewMe"
import { useViewModeStore } from "@/shared/view-mode"
```

패턴 (대표: `applications.tsx`):

```typescript
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)
    if (!isOperator(viewMe) && !isCurrentTermPm(viewMe))
      throw redirect({ to: "/" })
  },
```

대표 (`rounds.tsx`, `notice-publish.tsx`, `admin/route.tsx`, `announce/notice-publish.tsx`):

```typescript
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)
    if (!isOperator(viewMe)) throw redirect({ to: "/" })
  },
```

대표 (`projects/management.tsx`):

```typescript
  beforeLoad: async ({ context }) => {
    const me = await ensureMe(context.queryClient)
    const viewMe = projectViewMe(me, useViewModeStore.getState().mode)
    if (!canManageProjects(viewMe))
      throw redirect({ to: "/matching/projects" })
  },
```

각 파일에서 `me`를 직접 판정에 쓰던 부분을 모두 `viewMe`로 바꾼다. `index.tsx`/`announce/index.tsx`의 "지부 강제 redirect" 분기(`isSuperAdmin || isCentralStaff`)와 `projects/new.tsx`의 추가 리소스 권한 분기도 동일하게 `viewMe` 기준으로 변경한다.

> `index.tsx`(`/matching/`)와 `announce/index.tsx`는 `me` 대신 `viewMe`로 `isSuperAdmin`/`isCentralStaff`/`isChapterPresident`를 판정하도록만 바꾸고, 그 외 로직(chapter 파라미터 처리)은 유지한다.

- [ ] **Step 2: 타입 체크 + 빌드**

Run: `pnpm exec tsc -b --noEmit && pnpm build`
Expected: PASS.

- [ ] **Step 3: 회귀 확인 (단일 권한 사용자 무변화)**

`projectViewMe(me, "admin")`은 운영진 단일 사용자에게 `me`와 동일한 판정을 주므로(운영진은 roles 유지, challengerRecords는 원래 권한에 영향 없음) 기존 동작이 유지된다. dev 서버 `/test/header`(운영진 프리뷰)로 사이드바/접근 정상 확인.

- [ ] **Step 4: Commit**

```bash
git add src/routes/matching src/routes/admin/route.tsx
git commit -m "$(printf '✨ feat: 매칭/어드민 라우트 가드를 선택 뷰(viewMe) 기준으로 전환\n\nbeforeLoad에서 현재 mode로 투영한 viewMe로 접근 권한을 판정')"
```

---

## Task 8: 페이지 내 권한 분기를 viewMe로 전환

**Files:**

- `src/features/project/management/ui/ProjectManagementPage.tsx`
- `src/features/project/list/ui/ProjectDetailCard.tsx`
- `src/features/project/list/model/matchingProjectList.ts`
- `src/features/project/new/ui/basic-info/BasicInfoForm.tsx`
- `src/routes/matching/applications.tsx` (컴포넌트 분기)
- `src/routes/matching/index.tsx` / `src/routes/matching/projects/announce/index.tsx` (컴포넌트 분기)

- [ ] **Step 1: 컴포넌트의 useMe 권한 판정을 viewMe로 교체**

각 컴포넌트에서 권한 판정(`isOperator`/`isCurrentTermPm`/`isAnyOperator`/`canManageProjects`/`getProjectPmSearchScope` 등)에 넘기는 `me`를 `viewMe`로 바꾼다. 패턴:

```typescript
// before
const { data: me } = useMe()
const canApprove = isOperator(me)

// after
import { useViewMe } from "@/shared/view-mode/useViewMe"
const { viewMe } = useViewMe()
const canApprove = isOperator(viewMe)
```

`matchingProjectList.ts`(훅/모델 함수)가 `me`를 인자로 받는다면 호출부에서 `viewMe`를 전달하도록 바꾼다. 함수 시그니처는 유지(`me: MemberInfoResponse`)하고 호출부만 교체한다.

> 신원 표시(이름/아바타/역할칩)에 쓰는 `me`는 그대로 둔다. 권한 게이팅에 쓰는 값만 `viewMe`로 바꾼다. 한 컴포넌트에서 둘 다 필요하면 `useMe`와 `useViewMe`를 함께 호출한다.

> **Resource Permission 충돌 점검:** `ProjectManagementPage.tsx`, `BasicInfoForm.tsx`, `projects/new.tsx`가 리소스 권한 API 훅을 함께 쓰면, 그 훅 입력도 `viewMe`의 식별자를 쓰도록 맞춘다. 불명확하면 해당 부분은 `me` 유지하고 주석으로 남긴 뒤 Task 10 검증에서 재확인.

- [ ] **Step 2: 타입 체크 + 빌드 + 테스트**

Run: `pnpm exec tsc -b --noEmit && pnpm build && pnpm exec vitest run`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features src/routes/matching
git commit -m "$(printf '✨ feat: 페이지 내 권한 분기를 선택 뷰(viewMe) 기준으로 전환\n\n승인/관리 버튼 등 페이지 권한 판정을 viewMe로 변경, 신원 표시는 me 유지')"
```

---

## Task 9: 헤더 네비게이션 항목을 viewMe로 전환

**Files:**

- Modify: `src/components/header/Header.tsx`

- [ ] **Step 1: navItems 계산을 viewMe 기준으로**

`Header.tsx`에 import 추가:

```typescript
import { useViewMe } from "@/shared/view-mode/useViewMe"
```

`navItems` 계산부를 교체:

```typescript
const { viewMe } = useViewMe()

const navItems = useMemo(() => {
  if (isOperator(viewMe)) return [...BASE_NAV, MANAGE_NAV, SYSTEM_NAV]
  if (isSchoolStaff(viewMe)) return [...BASE_NAV, MANAGE_NAV]
  return BASE_NAV
}, [viewMe])
```

(기존 `const { data: me } = useMe()`는 신원 표시/Profile용으로 유지.)

- [ ] **Step 2: 타입 체크 + 빌드**

Run: `pnpm exec tsc -b --noEmit && pnpm build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/header/Header.tsx
git commit -m "$(printf '✨ feat: 헤더 상단 네비게이션 항목을 선택 뷰(viewMe) 기준으로 전환')"
```

---

## Task 10: E2E 검증 (테스트 계정)

**Files:** (없음 — 수동/Playwright 검증)

- [ ] **Step 1: dev 서버 확인 후 로그인**

dev 서버(`http://localhost:5176` 또는 표시된 포트)에 Playwright로 접속, 로그인:

- 계정: `xenon_chapterpresident@university.neordinary.com`
- 비밀번호: `password12!`

- [ ] **Step 2: 다중자격 드롭다운 노출 확인**

`/matching`으로 이동. 챕터 회장 + 챌린저 기록이 있으면 가용 옵션 ≥2 → 사이드바 상단 드롭다운 노출 확인. 스크린샷 저장: `.playwright-mcp/screenshots/view-switcher-admin.png`.

- [ ] **Step 3: 뷰 전환별 권한 확인**

- `Admin View`: 운영 메뉴(매칭 차수 설정 등)와 지원 현황 노출 확인.
- `Challenger-Others View`(또는 `Plan`): 운영 메뉴 사라짐, `/matching/rounds` 직접 접근 시 `/`로 redirect 확인.
- 전환 시 현재 경로가 새 뷰에서 사라지면 첫 메뉴로 이동하는지 확인.
- 각 뷰 스크린샷 저장(`.playwright-mcp/screenshots/`).

- [ ] **Step 4: 학교운영진 지원현황 숨김 확인**

학교 운영진 계정이 있으면(또는 시드) 로그인하여 `admin` 뷰에서 '지원 현황' 메뉴가 없고 `/matching/applications` 직접 접근 시 redirect되는지 확인. 계정이 없으면 이 항목은 `projectViewMe`/`filterSectionsByPermission` 단위 테스트로 대체 확인되었음을 명시.

- [ ] **Step 5: 단일권한 사용자 회귀 확인**

옵션이 1개뿐인 계정(운영진 단일 또는 챌린저 단일)으로 드롭다운이 숨겨지고 기존과 동일하게 동작하는지 확인.

- [ ] **Step 6: 최종 커밋(검증 메모, 필요 시)**

검증에서 발견된 수정이 있으면 해당 Task로 돌아가 반영 후 커밋. 없으면 별도 커밋 불필요.

---

## Self-Review (작성자 체크 완료)

- **Spec coverage:** ViewMode/viewMe 매핑(T2), 옵션 가용성·드롭다운(T4·T6), 적용 범위 사이드바(T5)·라우트(T7)·페이지권한(T8)·헤더(T9), 상태 저장 persist(T1), 전환 네비게이션(T6), 작업1(T5), 테스트(T2·T4·T5·T10) — 모두 매핑됨.
- **Placeholder scan:** 모든 코드 블록은 실제 코드. `ChevronDownIcon` 경로와 Resource Permission 훅 입력은 구현 시 확인 지시를 명시(코드베이스 의존 부분).
- **Type consistency:** `projectViewMe(me, mode)`, `useViewMe(): { viewMe, isLoading }`, `computeAvailableViewModes(me): ViewMode[]`, `SidebarPermissions.canViewApplications`, store `setMode`/`setModeByIndex` — 전 Task에서 동일하게 사용.
