# 프로젝트 등록 페이지 권한별 기능 수정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/matching/projects/new` 페이지에서 ViewMode(admin/pm/others)에 따라 단계 흐름을 분기하고, 기획서 링크 섹션을 전체 제거한다.

**Architecture:** `permissions.ts`에 접근 권한 헬퍼를 추가하고, Stepper에 `disabledSteps` prop을 도입해 pm일 때 2단계를 disabled 처리한다. 라우트 컴포넌트에서 ViewMode를 읽어 단계 이동 로직을 분기한다.

**Tech Stack:** React 19, TypeScript, Zustand, TanStack Router, Tailwind CSS, Vitest

---

## 파일 목록

| 파일                                                           | 변경 |
| -------------------------------------------------------------- | ---- |
| `src/features/project/new/api/permissions.ts`                  | 수정 |
| `src/features/project/new/api/permissions.test.ts`             | 신규 |
| `src/features/project/new/model/basicInfoSchema.ts`            | 수정 |
| `src/features/project/new/model/useProjectRegisterStore.ts`    | 수정 |
| `src/features/project/new/model/draftHydrator.ts`              | 수정 |
| `src/features/project/new/ui/basic-info/BasicInfoForm.tsx`     | 수정 |
| `src/features/project/new/ui/basic-info/PlanningLinkInput.tsx` | 삭제 |
| `src/features/project/new/ui/stepper/StepperTab.tsx`           | 수정 |
| `src/features/project/new/ui/stepper/Stepper.tsx`              | 수정 |
| `src/routes/matching/projects/new.tsx`                         | 수정 |

---

## Task 1: canAccessProjectNew 권한 헬퍼 추가 (TDD)

**Files:**

- Modify: `src/features/project/new/api/permissions.ts`
- Create: `src/features/project/new/api/permissions.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/features/project/new/api/permissions.test.ts` 파일을 새로 만든다.

```ts
import { describe, expect, it } from "vitest"

import { canAccessProjectNew } from "./permissions"

describe("canAccessProjectNew", () => {
  it("admin은 접근 가능", () => {
    expect(canAccessProjectNew("admin")).toBe(true)
  })

  it("pm은 접근 가능", () => {
    expect(canAccessProjectNew("pm")).toBe(true)
  })

  it("others는 접근 불가", () => {
    expect(canAccessProjectNew("others")).toBe(false)
  })
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npx vitest run src/features/project/new/api/permissions.test.ts
```

Expected: FAIL — `canAccessProjectNew is not exported`

- [ ] **Step 3: 구현 추가**

`src/features/project/new/api/permissions.ts` 하단에 추가:

```ts
export function canAccessProjectNew(viewMode: ViewMode): boolean {
  return viewMode === "admin" || viewMode === "pm"
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/features/project/new/api/permissions.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/features/project/new/api/permissions.ts src/features/project/new/api/permissions.test.ts
git commit -m "✨ feat: canAccessProjectNew 권한 헬퍼 추가"
```

---

## Task 2: 기획서 링크 스키마·스토어·hydrator 제거

**Files:**

- Modify: `src/features/project/new/model/basicInfoSchema.ts`
- Modify: `src/features/project/new/model/useProjectRegisterStore.ts`
- Modify: `src/features/project/new/model/draftHydrator.ts`

- [ ] **Step 1: basicInfoSchema.ts — planningLink 필드 삭제**

현재:

```ts
export const basicInfoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  thumbnail: z.instanceof(File).superRefine((v, ctx) => {
    if (!THUMBNAIL_ACCEPTED_TYPES.includes(v.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
    if (v.size > MAX_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
  }),
  logo: z.instanceof(File).superRefine((v, ctx) => {
    if (!LOGO_ACCEPTED_TYPES.includes(v.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
    if (v.size > MAX_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
  }),
  planningLink: z.string().url(),
})
```

변경 후:

```ts
export const basicInfoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(200),
  thumbnail: z.instanceof(File).superRefine((v, ctx) => {
    if (!THUMBNAIL_ACCEPTED_TYPES.includes(v.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
    if (v.size > MAX_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
  }),
  logo: z.instanceof(File).superRefine((v, ctx) => {
    if (!LOGO_ACCEPTED_TYPES.includes(v.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
    if (v.size > MAX_FILE_SIZE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom })
    }
  }),
})
```

- [ ] **Step 2: useProjectRegisterStore.ts — BasicDraftFields에서 planningLink 삭제**

현재:

```ts
interface BasicDraftFields {
  title: string
  description: string
  planningLink: string
}
```

변경 후:

```ts
interface BasicDraftFields {
  title: string
  description: string
}
```

- [ ] **Step 3: draftHydrator.ts — planningLink hydration 삭제**

현재:

```ts
store.setBasicDraftFields({
  title: draft.name ?? "",
  description: draft.description ?? "",
  planningLink: draft.externalLink ?? "",
})
```

변경 후:

```ts
store.setBasicDraftFields({
  title: draft.name ?? "",
  description: draft.description ?? "",
})
```

- [ ] **Step 4: 타입 에러 없음 확인**

```bash
npx tsc --noEmit 2>&1 | grep -E "basicInfoSchema|draftHydrator|useProjectRegisterStore"
```

Expected: 출력 없음

- [ ] **Step 5: 커밋**

```bash
git add src/features/project/new/model/basicInfoSchema.ts \
        src/features/project/new/model/useProjectRegisterStore.ts \
        src/features/project/new/model/draftHydrator.ts
git commit -m "♻️ refactor: 기획서 링크 스키마·스토어·hydrator에서 planningLink 제거"
```

---

## Task 3: BasicInfoForm에서 기획서 링크 섹션 제거

**Files:**

- Modify: `src/features/project/new/ui/basic-info/BasicInfoForm.tsx`
- Delete: `src/features/project/new/ui/basic-info/PlanningLinkInput.tsx`

- [ ] **Step 1: import 및 PlanningLinkInput 파일 삭제**

`BasicInfoForm.tsx` 상단에서 아래 줄 삭제:

```ts
import { PlanningLinkInput } from "./PlanningLinkInput"
```

그리고 파일 삭제:

```bash
git rm src/features/project/new/ui/basic-info/PlanningLinkInput.tsx
```

- [ ] **Step 2: useEffect에서 planningLink setValue 삭제**

현재:

```ts
useEffect(() => {
  if (!basicDraftFields) return
  const { title, description, planningLink } = basicDraftFields
  if (title) setValue("title", title, { shouldDirty: false })
  if (description) setValue("description", description, { shouldDirty: false })
  if (planningLink)
    setValue("planningLink", planningLink, { shouldDirty: false })
}, [basicDraftFields, setValue])
```

변경 후:

```ts
useEffect(() => {
  if (!basicDraftFields) return
  const { title, description } = basicDraftFields
  if (title) setValue("title", title, { shouldDirty: false })
  if (description) setValue("description", description, { shouldDirty: false })
}, [basicDraftFields, setValue])
```

- [ ] **Step 3: onInvalid에서 planningLink 분기 삭제**

현재 `onInvalid` 함수 내:

```ts
} else if (fieldErrors.planningLink) {
  message = "기획서 링크를 입력해주세요!"
  focusFn = () => setFocus("planningLink")
}
```

위 else-if 블록 전체를 삭제한다.

- [ ] **Step 4: handleTempSave에서 externalLink 삭제**

현재:

```ts
await updateProjectDraft(resolvedProjectId, {
  name: values.title,
  description: values.description,
  externalLink: values.planningLink,
  thumbnailFileId: thumbnailFileId ?? undefined,
  logoFileId: logoFileId ?? undefined,
})
```

변경 후:

```ts
await updateProjectDraft(resolvedProjectId, {
  name: values.title,
  description: values.description,
  thumbnailFileId: thumbnailFileId ?? undefined,
  logoFileId: logoFileId ?? undefined,
})
```

- [ ] **Step 5: JSX에서 섹션 3 "기획서 링크" 블록 삭제**

현재:

```tsx
<div className="flex flex-col gap-4">
  <SectionHeader index={3} title="기획서 링크" />
  <PlanningLinkInput register={register} error={errors.planningLink} />
</div>
```

위 `<div>` 블록 전체를 삭제한다.

- [ ] **Step 6: 타입 에러 없음 확인**

```bash
npx tsc --noEmit 2>&1 | grep "BasicInfoForm"
```

Expected: 출력 없음

- [ ] **Step 7: 커밋**

```bash
git add src/features/project/new/ui/basic-info/BasicInfoForm.tsx
git commit -m "♻️ refactor: BasicInfoForm에서 기획서 링크 섹션 제거"
```

---

## Task 4: StepperTab disabled + tooltip 구현

**Files:**

- Modify: `src/features/project/new/ui/stepper/StepperTab.tsx`

현재 `StepperTab`은 `<button>`을 직접 반환한다. disabled일 때 브라우저가 hover 이벤트를 막으므로, wrapper `<div>`를 추가해 tooltip을 붙인다.

- [ ] **Step 1: StepperTab.tsx 전체를 아래로 교체**

```tsx
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/shared/lib/utils"

interface StepperTabProps {
  idx: number
  label: string
  isSelected: boolean
  disabled?: boolean
  onClick: () => void
}

export function StepperTab({
  idx,
  label,
  isSelected = false,
  disabled = false,
  onClick,
}: StepperTabProps) {
  return (
    <div className="group relative flex h-9.5 w-full flex-1">
      {disabled && (
        <span className="bg-teal-gray-800 text-label-3-semibold pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-[6px] px-2.5 py-1.5 whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
          수정이 불가능합니다
        </span>
      )}
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "relative flex h-full w-full cursor-pointer items-center gap-2 rounded-[12px] py-1 pr-5 pl-3",
          disabled && "cursor-not-allowed opacity-40",
        )}
      >
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 rounded-[12px] bg-white shadow-[13px_0_14px_rgba(211,216,216,0.4),0_1px_2px_rgba(99,196,184,0.2),0_0_10px_rgba(156,163,163,0.3)]"
            />
          )}
        </AnimatePresence>
        <div
          aria-hidden="true"
          className={cn(
            "text-label-3-semibold text-teal-gray-600 relative flex h-5 w-5 items-center justify-center rounded-full",
            isSelected ? "bg-teal-gray-150" : "bg-teal-gray-200",
          )}
        >
          {idx}
        </div>
        <span
          className={cn(
            "text-label-1-semibold relative",
            isSelected ? "text-teal-gray-800" : "text-teal-600",
          )}
        >
          {label}
        </span>
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 타입 에러 없음 확인**

```bash
npx tsc --noEmit 2>&1 | grep "StepperTab"
```

Expected: 출력 없음

- [ ] **Step 3: 커밋**

```bash
git add src/features/project/new/ui/stepper/StepperTab.tsx
git commit -m "✨ feat: StepperTab에 disabled prop 및 tooltip 추가"
```

---

## Task 5: Stepper에 disabledSteps prop 추가

**Files:**

- Modify: `src/features/project/new/ui/stepper/Stepper.tsx`

- [ ] **Step 1: Stepper.tsx 전체를 아래로 교체**

```tsx
import { StepperTab } from "./StepperTab"

const ITEMS = [
  { idx: 1, label: "기본 정보" },
  { idx: 2, label: "모집 정보" },
  { idx: 3, label: "지원 문항" },
]

interface StepperProps {
  step: number
  onStepChange: (idx: number) => void
  disabledSteps?: number[]
}

export function Stepper({
  step,
  onStepChange,
  disabledSteps = [],
}: StepperProps) {
  return (
    <section
      role="tablist"
      aria-label="등록 단계"
      className="bg-teal-gray-100 flex h-11.5 min-w-225 items-center gap-2 rounded-[14px] p-1"
    >
      {ITEMS.map((item) => (
        <StepperTab
          key={item.idx}
          isSelected={item.idx === step}
          disabled={disabledSteps.includes(item.idx)}
          onClick={() => onStepChange(item.idx)}
          {...item}
        />
      ))}
    </section>
  )
}
```

- [ ] **Step 2: 타입 에러 없음 확인**

```bash
npx tsc --noEmit 2>&1 | grep "Stepper"
```

Expected: 출력 없음

- [ ] **Step 3: 커밋**

```bash
git add src/features/project/new/ui/stepper/Stepper.tsx
git commit -m "✨ feat: Stepper에 disabledSteps prop 추가"
```

---

## Task 6: 라우트에 ViewMode 기반 흐름 구현

**Files:**

- Modify: `src/routes/matching/projects/new.tsx`

- [ ] **Step 1: import 추가**

파일 상단 import 블록에 아래 두 줄을 추가한다.

```ts
import { canAccessProjectNew } from "@/features/project/new/api/permissions"
import { useViewModeStore } from "@/shared/view-mode"
```

- [ ] **Step 2: viewMode 구독 및 접근 제어 추가**

`ProjectRegisterPage` 함수 내 `const navigate = useNavigate()` 바로 아래에 추가:

```ts
const viewMode = useViewModeStore((s) => s.mode)

useEffect(() => {
  if (!canAccessProjectNew(viewMode)) {
    navigate({ to: "/matching/projects" })
  }
}, [viewMode, navigate])
```

- [ ] **Step 3: 단계 이동 핸들러를 ViewMode에 따라 분기**

기존 `handleRegister` 함수 바로 위에 아래 두 핸들러를 추가한다:

```ts
const handleBasicInfoNext = () => {
  setStep(viewMode === "pm" ? 3 : 2)
}

const handleApplicationFormPrev = () => {
  setStep(viewMode === "pm" ? 1 : 2)
}
```

- [ ] **Step 4: JSX에서 Stepper와 각 폼의 콜백을 교체**

현재:

```tsx
;<Stepper step={step} onStepChange={setStep} />
{
  step === 1 && <BasicInfoForm onNext={() => setStep(2)} />
}
{
  step === 2 && (
    <RecruitInfoForm onPrev={() => setStep(1)} onNext={() => setStep(3)} />
  )
}
{
  step === 3 && (
    <ApplicationForm onPrev={() => setStep(2)} onNext={handleRegister} />
  )
}
```

변경 후:

```tsx
;<Stepper
  step={step}
  onStepChange={setStep}
  disabledSteps={viewMode === "pm" ? [2] : []}
/>
{
  step === 1 && <BasicInfoForm onNext={handleBasicInfoNext} />
}
{
  step === 2 && (
    <RecruitInfoForm onPrev={() => setStep(1)} onNext={() => setStep(3)} />
  )
}
{
  step === 3 && (
    <ApplicationForm
      onPrev={handleApplicationFormPrev}
      onNext={handleRegister}
    />
  )
}
```

- [ ] **Step 5: 전체 타입 에러 없음 확인**

```bash
npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 6: 전체 테스트 통과 확인**

```bash
npx vitest run
```

Expected: 기존 테스트 포함 전체 PASS

- [ ] **Step 7: 커밋**

```bash
git add src/routes/matching/projects/new.tsx
git commit -m "✨ feat: 프로젝트 등록 페이지 ViewMode 기반 단계 흐름 구현"
```

---

## 셀프 리뷰 체크리스트

- [x] **스펙 커버리지**: A(기획서 링크 제거) → Task 2, 3 / B(Stepper disabled+tooltip) → Task 4, 5 / B(단계 분기) → Task 6 / C(접근 제어) → Task 1, 6
- [x] **Placeholder 없음**: 모든 단계에 실제 코드 포함
- [x] **타입 일관성**: `disabledSteps: number[]`가 Task 5(Stepper)와 Task 6(new.tsx)에서 동일하게 사용됨, `canAccessProjectNew`가 Task 1(구현)과 Task 6(사용)에서 동일한 시그니처 사용
