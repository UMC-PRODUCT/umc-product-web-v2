import { isAnyOperator, isCurrentTermPm } from "@/features/auth/model/identity"

import type { MemberInfoResponse } from "@/features/auth/api/me"

import type { NoticeItem } from "../ui/NoticeCardList"

export type DefaultNoticeAudience = "all" | "pm" | "operator"

export type DefaultNoticeItem = NoticeItem & {
  audience: DefaultNoticeAudience
}

export function canViewDefaultNotice(
  audience: DefaultNoticeAudience,
  me: MemberInfoResponse | undefined,
) {
  if (audience === "all") return true

  const isAdmin = Boolean(me?.currentGisuMemberInfo?.isAdmin)
  const isAdminPart = me?.currentGisuMemberInfo?.challenger?.part === "ADMIN"
  const isPm = isCurrentTermPm(me)
  const isOperator = isAnyOperator(me)

  if (audience === "pm") {
    return isPm || isOperator || isAdmin || isAdminPart
  }

  return isOperator || isAdmin || isAdminPart
}

export const DEFAULT_PROJECT_SETTING_NOTICES: DefaultNoticeItem[] = [
  {
    id: "default-project-menu",
    title: "[PM] 플랜 챌린저인데 프로젝트 등록 메뉴가 보이지 않아요.",
    date: "2026.06.18",
    chip: "필독",
    audience: "pm",
  },
  {
    id: "default-project-status",
    title: "[운영진] 프로젝트 상태는 어떻게 구분되나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "operator",
  },
  {
    id: "default-project-abort",
    title:
      "[운영진] 실수로 프로젝트를 중단 처리했어요. 다시 공개로 되돌릴 수 있나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "operator",
  },
  {
    id: "default-project-publish",
    title: "[지부장] 반드시 매칭 시작 전까지 프로젝트를 공개 처리해야 하나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "operator",
  },
  {
    id: "default-project-edit",
    title: "[PM, 지부장] 프로젝트 정보는 언제든지 수정할 수 있나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "pm",
  },
  {
    id: "default-project-application-form",
    title: "[PM, 지부장] 지원 폼을 변경하면 기존 지원서는 어떻게 표시되나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "pm",
  },
]

export const DEFAULT_PROJECT_SETTING_CONTENTS: Record<string, string> = {
  "default-project-menu": `**프로젝트 등록 메뉴는 이번 기수 플랜 챌린저에게만 표시돼요.**

UMC 앱에서 플랜 챌린저로 표시되는데도 메뉴가 보이지 않는다면 프로덕트팀에 문의해주세요.`,
  "default-project-status": `**프로젝트는 아래 상태를 가져요.**

1. **초안**
PM이 본인의 프로젝트를 등록하는 과정이에요. 본인만 볼 수 있어요.

2. **검토 대기**
지부장이나 중앙운영사무국에서 파트별 TO를 등록하고 공개 처리하기 전까지의 상태예요. 이 상태에서는 프로젝트 목록에서 다른 챌린저가 볼 수 없어요.

3. **공개**
운영진이 승인한 이후 지원서를 받을 수 있는 상태예요. 프로젝트 목록에서 조회할 수 있고, 매칭 기간이면 지원서를 제출할 수 있어요.

4. **종료**
데모데이까지 모두 완료한 상태예요. 이 시점부터 프로젝트 관련 정보 변경은 운영진이 더 이상 개입할 수 없고 PO만 개입할 수 있어요.

5. **중단**
데모데이까지 프로젝트를 완수하지 못하고 팀이 와해된 경우예요. 프로젝트 목록에서 더 이상 조회할 수 없고 지원도 불가능해요. 중단된 프로젝트는 다시 다른 상태로 변경할 수 없으므로 유의해주세요.

**상태 변경 규칙은 아래와 같아요.**

- 초안 → 검토 대기 : 플랜 챌린저가 프로젝트 등록을 완료하면 자동으로 진행돼요.
- 검토 대기 → 공개 : 각 지부장 및 중앙운영사무국 총괄단만 가능해요. 공개하려면 각 파트별 TO를 설정해야 해요.
- 공개 → 종료 : 데모데이가 끝나고 기수가 종료되면 자동으로 변경돼요.
- 중단 처리 : 중앙운영사무국 총괄단만 가능해요.`,
  "default-project-abort": `**불가능해요. 프로젝트 중단 처리는 프로젝트를 제명시키는 작업이에요.**

프로젝트 멤버, 연관 지원서 등 여러 데이터에 비가역적인 작업이 수행돼요. 프로덕트팀에 문의해도 복구를 도와드릴 수 없어요.

아직 매칭 기간이 시작되지 않았다면 프로젝트를 삭제한 뒤 다시 생성해주세요.`,
  "default-project-publish": `**아니요. 프로젝트 공개 처리와 매칭 차수는 관계 없어요.**

단, 프로젝트를 공개 처리하기 전까지는 챌린저가 프로젝트를 조회하거나 지원할 수 없으므로 주의해주세요.`,
  "default-project-edit": `**시기에 따라 달라요.**

- 매칭 기간이 시작되면 프로젝트 이름, 설명 같은 기본 정보부터 지원 폼까지 전부 수정이 제한돼요.

- 매칭 기간이 아닐 때는 PO가 지원 폼이나 프로젝트 정보를 변경할 수 있어요.`,
  "default-project-application-form": `**질문을 변경해도 각 지원서는 응답한 시점의 질문과 응답으로 표시돼요.**

예를 들어 1차 매칭 때 질문이 "나이를 입력해주세요"였고, 2차 매칭 때 "태어난 연도를 입력해주세요"로 변경된 경우 각 차수별 지원서는 아래처럼 확인할 수 있어요.

- 1차 매칭 지원자 : Q. "나이를 입력해주세요" A. 26살
- 2차 매칭 지원자 : Q. "태어난 연도를 입력해주세요" A. 2001년

객관식 유형에서 보기를 변경하는 경우에도 지원자가 응답한 값 기준으로 표시돼요.`,
}

export const DEFAULT_TEAM_MATCHING_NOTICES: DefaultNoticeItem[] = [
  {
    id: "default-matching-application-count",
    title: "[공통] 지원 현황의 학교별 인원 수가 실제와 달라 보여요.",
    date: "2026.06.18",
    chip: "필독",
    audience: "all",
  },
  {
    id: "default-matching-application-deadline",
    title: "[공통] 지원서 제출 및 철회는 언제까지 가능한가요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "all",
  },
  {
    id: "default-matching-review-deadline",
    title:
      "[PM] 접수된 지원서는 언제 확인하고 언제까지 합/불을 결정해야 하나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "pm",
  },
  {
    id: "default-matching-reject-limit",
    title: "[PM] 지원서를 불합격 처리할 수 없어요.",
    date: "2026.06.18",
    chip: "필독",
    audience: "pm",
  },
  {
    id: "default-matching-round-warning",
    title: "[지부장] 매칭 기간 설정 시 경고문이 계속 떠요.",
    date: "2026.06.18",
    chip: "필독",
    audience: "operator",
  },
  {
    id: "default-matching-round-edit",
    title: "[지부장] 매칭 차수는 언제든지 바꿀 수 있나요?",
    date: "2026.06.18",
    chip: "필독",
    audience: "operator",
  },
]

export const DEFAULT_TEAM_MATCHING_CONTENTS: Record<string, string> = {
  "default-matching-application-count": `**해당 인원은 "지원 가능한 인원"을 기준으로 산출돼요.**

기수 내 챌린저 중 플랜 파트와 프로젝트를 하지 않는 운영진을 제외한 값이에요.`,
  "default-matching-application-deadline": `**지원서 제출 및 철회는 각 매칭 차수 종료 시점까지 가능해요.**

각 지부장이 설정한 값에 따라 종료 시점이 59분 00초일 수도, 59분 59초일 수도 있으니 미리 제출하는 것을 추천드려요.

- 같은 매칭 차수 내 중복 지원은 불가능해요.
- 다른 프로젝트에 지원하고 싶다면 기존 지원서를 철회한 뒤 새로운 프로젝트에 지원해주세요.
- 각 매칭 차수가 끝나기 전까지는 운영진이나 플랜 챌린저도 지원자가 어디에 지원했는지 확인할 수 없어요.
- 운영 관리를 위해 학교별, 프로젝트별 지원자 수만 표시돼요.

**단, 철회한 지원서는 복구가 어려우니 신중하게 결정해주세요.**`,
  "default-matching-review-deadline": `**지원서는 각 매칭 차수별로 관리돼요.**

챌린저가 마음 편히 철회할 수 있도록, 내 프로젝트에 접수된 지원서는 매칭 차수 종료 시점 이후부터 확인할 수 있어요.

- 합격/불합격 처리는 종료 시점 이후 결정 마감 기한까지 가능해요.
- 결정 마감 기한까지 합격/불합격 여부가 정해지지 않은 지원서는 시스템에서 임의로 합격 또는 불합격 처리돼요.
- 임의 처리 시에는 매칭 규정에 명시된 TO 대비 지원자 수에 따른 최소 선발 인원을 보장해요.`,
  "default-matching-reject-limit": `**매칭 규정에 따른 최소 선발 인원이 보장되지 않은 경우 불합격 처리가 불가능해요.**

TO 대비 지원자 수에 따른 최소 선발 인원을 합격시킨 뒤 나머지 지원서를 불합격 처리해주세요. 참고로 TO는 각 지원 차수별로 별도로 산정돼요.

예를 들어 내 프로젝트에 배정된 SpringBoot 파트 TO가 4명이고 5명이 지원한 경우, TO의 100% 이상이 지원했으므로 TO의 50%인 2명 이상을 합격시켜야 해요.

**예시**

- 합/불 결정을 하지 않으면 시스템에서 랜덤으로 2명을 합격시키고 나머지는 불합격 처리해요.
- 1명만 합격 처리한 경우에는 최소 선발 인원 2명을 보장하기 위해 1명을 랜덤으로 추가 합격시키고 나머지는 불합격 처리해요.`,
  "default-matching-round-warning": `**매칭 차수는 10기 중앙운영사무국에서 아래와 같이 공지했어요.**

- 1차 매칭 : 00:00 ~ 23:59
- 2차 매칭 : 1차 익일 12:05 ~ 23:59
- 3차 매칭 : 2차 익일 12:05 ~ 종료 23:59

중앙운영사무국과 논의 후 지부별로 상이한 매칭 기간을 적용하는 경우에만 다른 값을 적용해주세요.

**아래 사항을 반드시 고려해야 해요.**

- N차 매칭에 접수된 지원서는 N차 매칭의 지원서 결정 마감 기한까지만 PM 챌린저가 합격 및 불합격 여부를 결정할 수 있어요.
- 지원서 결정 마감 기한은 웹사이트 기준으로 1차는 2차 매칭 시작 5분 전, 2차는 3차 매칭 시작 5분 전, 3차는 3차 매칭 종료 12시간 이후예요.
- 1차 종료와 2차 시작 사이, 2차 종료와 3차 시작 사이는 최소 5분 이상이어야 해요.`,
  "default-matching-round-edit": `**아니요. 매칭 차수는 1차 매칭이 시작되면 변경할 수 없어요.**

불가피하게 변경이 필요한 경우 프로덕트팀으로 문의해주세요.`,
}
