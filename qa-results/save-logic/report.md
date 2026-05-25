# 저장 로직 자동 테스트 결과 보고서

**테스트 대상**: 프로젝트 등록 1단계 — [임시 저장] / [다음] 버튼 저장 로직  
**테스트 일시**: 2026-05-24  
**테스트 환경**: 로컬 dev 서버 (http://localhost:5173), 계정 `schoolpresident@umc.it.kr`  
**코드 변경 브랜치**: `fix/basic-info-save-skip-no-change`

---

## 코드 변경 내용

### 1. `src/features/project/new/ui/basic-info/BasicInfoForm.tsx` (line 332-)

`onSubmit`에 `hasUnsavedChanges` 분기 추가 — 변경 없는 상태에서는 `handleTempSave` 호출 건너뜀.

```diff
 const onSubmit = async (data: BasicInfoFormData) => {
-  const ok = await handleTempSave({ silent: true })
-  if (!ok) return
+  if (hasUnsavedChanges) {
+    const ok = await handleTempSave({ silent: true })
+    if (!ok) return
+  }
   setBasicInfo(data)
   ...
   onNext()
 }
```

**효과**: 임시 저장 완료 후 [다음] 클릭 시 백엔드에 중복 PATCH 요청을 보내지 않고 바로 다음 단계로 이동.  
**TypeScript 타입 오류**: 없음 (`npx tsc --noEmit` 통과)

### 2. `src/routes/matching/projects/new.tsx` (line 207)

```diff
-duration: 3,
+duration: 3000,
```

`submitMutation.onError` 토스트의 `duration`을 3ms → 3000ms로 수정. 등록 실패 시 토스트가 화면에 표시되지 않던 문제 해결.

---

## 자동 실행 결과

| #   | 케이스                                                           | 결과     | 비고                                                                   |
| --- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| 1   | PM 미선택 + title 입력 → [임시 저장] 가드 토스트                 | **PASS** | 토스트 "PM을 선택한 뒤 임시 저장해 주세요.", POST 없음 확인            |
| 2   | PM 선택 → [임시 저장] → createProjectDraft                       | **SKIP** | 로컬에서 POST /v1/projects CORS 차단 (net::ERR_ABORTED)                |
| 3   | title/description 입력 → [임시 저장] → PATCH                     | **SKIP** | TC2 선행 필요 (CORS 차단)                                              |
| 4   | 변경 없음 → [임시 저장] 버튼 disabled                            | **SKIP** | TC3 선행 필요                                                          |
| 5   | 변경 있는 상태 [다음] → 저장 후 step 이동                        | **SKIP** | TC4 선행 필요                                                          |
| 6   | (버그 수정 검증) 변경 없는 상태 [다음] → PATCH 스킵 후 step 이동 | **SKIP** | TC5 선행 필요                                                          |
| 7   | 멀티 PM + PM2 추가 → [임시 저장]                                 | **SKIP** | TC3 선행 필요                                                          |
| 8   | 임시 저장 후 입력 변경 → 버튼 라벨 복귀                          | **SKIP** | TC3 선행 필요                                                          |
| 9   | 새로고침 후 draft hydrate                                        | **SKIP** | draft 없음 (CORS 차단으로 생성 불가)                                   |
| 10  | 변경 후 이탈 모달                                                | **SKIP** | store dirty 아님 (임시저장 전이라 projectId/pmInfo store에 반영 안 됨) |

---

## SKIP 원인 분석

### CORS 차단 (TC2~TC9)

로컬 dev 서버(`http://localhost:5173`)에서 `POST /api/v1/projects`(createProjectDraft) 요청이 `net::ERR_ABORTED`로 실패함:

- `origin: http://localhost:5173` → `sec-fetch-site: cross-site`
- 서버에서 POST 메서드에 대한 CORS preflight를 허용하지 않음
- GET 요청들(`/api/v1/gisu/active`, `/api/v1/member/me` 등)은 정상 작동
- 사용자가 사전에 언급한 "서버에서 로컬서버 CORS를 열어주지 않음" 제약과 동일한 원인으로 추정. S3뿐만 아니라 POST 메서드 전반에 영향.

### TC10 이탈 모달 (store dirty 없음)

`useBlocker`의 `shouldBlockFn`이 Zustand store의 `isStoreDirty`를 참조함:

```ts
const isStoreDirty = useProjectRegisterStore((s) => {
  return (
    s.projectId !== null ||    // createProjectDraft 이후에야 set
    s.pmInfo.pm1 !== null ||   // setPmInfo(임시저장 성공) 이후에야 set
    ...
  )
})
```

폼 입력값은 임시저장이 성공해야 store에 반영되므로, 임시저장 전 상태에서는 store가 dirty하지 않아 이탈 모달이 뜨지 않음.

---

## 코드 수준 정적 검증

### TC6 (핵심 버그 수정) 로직 검증

수정 전후 흐름 비교:

**수정 전:**

```
[다음 클릭] → onSubmit → handleTempSave(silent) → updateProjectDraft → [백엔드 거부] → catch → return false → step 이동 차단
```

**수정 후:**

```
[다음 클릭] → Zod validate → onSubmit(data)
  hasUnsavedChanges=true → handleTempSave(silent) → updateProjectDraft → 성공 → step 이동
  hasUnsavedChanges=false → handleTempSave 스킵 → step 이동 (PATCH 없음)
```

`hasUnsavedChanges`가 false가 되는 조건:

- `handleTempSave` 성공 후 `reset(values, { keepValues: true, keepDirty: false })` → `hasDirtyFields=false`
- `handleTempSave` 성공 후 `setSavedSnapshot({ pm1, pm2, isMultiPm })` → `isPmChanged=false`
- 두 조건 모두 `handleTempSave`가 한 번이라도 성공하면 충족 → 재클릭 시 스킵 보장

**엣지케이스 검토:**

| 상황                                           | hasUnsavedChanges | 동작                                                                  |
| ---------------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| 첫 진입, 아무것도 안 함                        | false             | Zod validation에서 title/description 빈 값으로 막힘 → onSubmit 미도달 |
| PM 선택 + title/description 입력 (임시저장 전) | true              | handleTempSave 호출 → createProjectDraft + updateProjectDraft         |
| 임시저장 성공 후 바로 [다음]                   | false             | handleTempSave 스킵 → step 이동                                       |
| 임시저장 후 title 수정 → [다음]                | true              | handleTempSave 호출 → updateProjectDraft                              |

---

## 수동 검증 권장 (서버/VPN 환경)

TC2-TC10은 API POST가 가능한 환경에서 아래 순서로 검증:

1. PM 선택 → [임시 저장] → 성공 토스트, POST /v1/projects 확인, 버튼 라벨 "저장 완료"
2. title/description 입력 → [임시 저장] → PATCH /v1/projects/{id} 확인
3. 변경 없이 [다음] 클릭 → **PATCH 호출 없이** step 이동 (버그 수정 검증 핵심)
4. step 2 → [이전] → 다시 [다음] → 동일하게 PATCH 없이 이동

---

## 결론

- **TC1 PASS**: PM 미선택 가드 정상 동작
- **코드 변경 타입 안정성**: `npx tsc --noEmit` 통과
- **TC2-TC10**: 로컬 CORS 제약으로 자동 실행 불가 — 서버 환경에서 수동 검증 필요
- **`duration: 3000` 수정**: 코드 diff로 확인 완료
