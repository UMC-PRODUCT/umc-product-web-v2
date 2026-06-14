# 프로젝트 등록 페이지 권한별 기능 수정 설계

Date: 2026-05-17
Route: `/matching/projects/new`

---

## 요구사항 요약

| 항목                | 내용                                                 |
| ------------------- | ---------------------------------------------------- |
| 접근 가능 ViewMode  | `admin`, `pm`                                        |
| `others`            | 접근 불가 — `/matching/projects`로 리다이렉트        |
| admin 단계 흐름     | 1단계 → 2단계 → 3단계                                |
| pm 단계 흐름        | 1단계 → 3단계 (2단계 건너뜀)                         |
| pm Stepper 2단계 탭 | 표시하되 `disabled` + tooltip("수정이 불가능합니다") |
| 기획서 링크 섹션    | 모든 ViewMode에서 제거                               |

---

## A. 기획서 링크 제거

### 변경 파일

**`src/features/project/new/model/basicInfoSchema.ts`**

- `planningLink: z.string().url()` 필드 삭제
- `BasicInfoFormData` 타입에서 자동 제거됨

**`src/features/project/new/model/useProjectRegisterStore.ts`**

- `BasicDraftFields` 인터페이스에서 `planningLink: string` 삭제

**`src/features/project/new/model/draftHydrator.ts`**

- `setBasicDraftFields` 호출에서 `planningLink: draft.externalLink ?? ""` 삭제

**`src/features/project/new/ui/basic-info/BasicInfoForm.tsx`**

- `PlanningLinkInput` import 삭제
- 섹션 3 "기획서 링크" JSX 블록 삭제
- `onInvalid`에서 `planningLink` 관련 분기 삭제
- `useEffect`(basicDraftFields)에서 `planningLink` setValue 삭제
- `handleTempSave`에서 `externalLink: values.planningLink` 삭제

**`src/features/project/new/ui/basic-info/PlanningLinkInput.tsx`**

- 파일 삭제 (사용처 없음)

---

## B. ViewMode 기반 단계 흐름

### Stepper 변경

**`src/features/project/new/ui/stepper/StepperTab.tsx`**

- `disabled?: boolean` prop 추가
- `disabledTooltip?: string` prop 추가
- `disabled`일 때:
  - 클릭 이벤트 차단 (`onClick={disabled ? undefined : onClick}`)
  - 탭 버튼에 `aria-disabled` 적용 (cursor-not-allowed, opacity 감소)
  - `disabledTooltip`이 있을 경우 `@/components/tooltip/Tooltip` (`hoverOnly`) 래핑하여 hover 시 툴팁 표시

**`src/features/project/new/ui/stepper/Stepper.tsx`**

- `disabledSteps?: number[]` prop 추가
- 각 `StepperTab`에 `disabled={disabledSteps?.includes(item.idx) ?? false}` 전달

### 라우트 변경

**`src/routes/matching/projects/new.tsx`**

접근 제어:

```
useEffect(() => {
  if (viewMode === "others") navigate({ to: "/matching/projects" })
}, [viewMode])
```

Stepper:

```
<Stepper
  step={step}
  onStepChange={setStep}
  disabledSteps={viewMode === "pm" ? [2] : []}
/>
```

단계 분기 — `onNext` / `onPrev`:

```
BasicInfoForm onNext:
  admin → setStep(2)
  pm    → setStep(3)

RecruitInfoForm onPrev: setStep(1)
RecruitInfoForm onNext: setStep(3)

ApplicationForm onPrev:
  admin → setStep(2)
  pm    → setStep(1)
```

---

## C. 권한 헬퍼

**`src/features/project/new/api/permissions.ts`**

- `canAccessProjectNew(viewMode: ViewMode): boolean` 추가
  - `admin`, `pm` → `true`
  - `others` → `false`

---

## 변경 파일 목록

| 파일                                  | 변경 유형 |
| ------------------------------------- | --------- |
| `model/basicInfoSchema.ts`            | 수정      |
| `model/useProjectRegisterStore.ts`    | 수정      |
| `model/draftHydrator.ts`              | 수정      |
| `ui/basic-info/BasicInfoForm.tsx`     | 수정      |
| `ui/basic-info/PlanningLinkInput.tsx` | 삭제      |
| `ui/stepper/StepperTab.tsx`           | 수정      |
| `ui/stepper/Stepper.tsx`              | 수정      |
| `api/permissions.ts`                  | 수정      |
| `routes/matching/projects/new.tsx`    | 수정      |

---

## 비고

- 2단계(RecruitInfoForm) 컴포넌트 자체는 삭제하지 않음 — admin 흐름에서 그대로 사용
- `externalLink` API 파라미터는 서버로 전송하지 않음 (전송 시 빈 값이 아니라 아예 생략)
- tooltip은 별도 라이브러리 없이 Tailwind group/peer 방식으로 구현
