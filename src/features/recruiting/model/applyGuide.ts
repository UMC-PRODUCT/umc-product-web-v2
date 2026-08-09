/**
 * 지원 방법 안내 공지.
 *
 * 지원자가 보는 화면은 로그인을 요구하지 않는데 공지 조회 API 는 인증을 받는다.
 * 게스트가 부르면 401 이라 여기서 상수로 들고 있다. 공지를 종류로 나눌 필드도
 * 아직 없어서 목록에서 골라낼 수도 없다.
 *
 * 공개 공지 API 가 생기면 이 파일만 조회 훅으로 바꾸면 된다. 화면은 여기서만
 * 내용을 가져가므로 바꿀 곳이 한 군데다.
 */

export interface ApplyGuideNotice {
  chip: string
  title: string
  date: string
}

export interface ApplyGuideQaItem {
  id: string
  question: string
  answer: string
}

export const APPLY_GUIDE_NOTICE: ApplyGuideNotice = {
  chip: "필독",
  title: "UMC 11기 지원 방법에 대해 안내해드립니다.",
  date: "2026.07.04",
}

export const APPLY_GUIDE_QA_ITEMS: ApplyGuideQaItem[] = [
  {
    id: "account",
    question: "UMC 계정이 없습니다. 회원가입을 해야 하나요?",
    answer:
      "아니요, 별도의 회원가입이나 로그인 절차 없이 간편하게 지원하실 수 있습니다.",
  },
  {
    id: "which-notice",
    question: "모집 공고가 많아 보입니다. 어떤 공고에 지원해야 하나요?",
    answer:
      "반드시 본인이 소속된 대학교의 공고에 지원하셔야 합니다. 타 학교 공고에 지원하실 경우, 추후 신분 확인 과정에서 합격이 취소될 수 있습니다. [모집 공고] 페이지에서 소속 학교명을 검색하신 후 알맞은 공고에 지원해 주시기 바랍니다.",
  },
  {
    id: "result-notification",
    question: "지원서를 제출했습니다. 전형 안내는 어떻게 받을 수 있나요?",
    answer:
      "향후 합격 여부를 포함한 모든 전형 안내는 지원서에 기재해 주신 이메일로 상세히 발송됩니다. 중요한 일정을 놓치지 않도록 이메일 주소를 정확하게 입력해 주시고, 전형 기간 중에는 메일 수신함을 자주 확인해 주시기를 당부드립니다.",
  },
  {
    id: "edit-application",
    question: "이미 제출한 지원서를 수정하거나 삭제할 수 있나요?",
    answer:
      "네, [내 지원서] 페이지를 통해 가능합니다. 지원서 최종 제출 시 발급되는 고유 ‘지원 번호’를 입력하시면 본인의 지원 내역을 확인하고 수정 및 삭제하실 수 있습니다. 단, 서류 모집 기간이 종료된 이후에는 수정 및 삭제가 불가하오니 유의해 주시기 바랍니다.",
  },
  {
    id: "contact",
    question: "질문이 있습니다. 어디로 문의하면 되나요?",
    answer:
      "웹사이트 상단의 [문의사항] 메뉴를 클릭하시어 UMC 카카오톡 채널로 문의해 주시기 바랍니다. 리크루팅 담당자가 내용을 확인하는 대로 최대한 신속하고 친절하게 안내해 드리겠습니다.",
  },
]
