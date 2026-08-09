// 소개 랜딩 카피 단일 소스. 시안(12836-123251)에 확정되지 않은 문구가 많아
// 화면 코드에 섞지 않고 여기 모아 둔다. 카피가 확정되면 이 파일만 고치면 된다.
//
// TODO: (미확정) 표시가 붙은 값은 시안의 임시 문구다. 기획·디자이너 확정 후 교체.

// 모집 분야 카드와 "이런 분이면 좋아요" 탭이 같은 4개 파트를 쓴다. 두 곳이
// 어긋나지 않도록 한 배열에서 뽑는다.
export const ABOUT_RECRUIT = {
  headline: "UMC 11기 모집 분야",
  // 시안 주석의 디자이너 제안. 본문의 "(어필하는 설명 필요)" 임시 문구는 쓰지 않는다.
  description:
    "하나의 프로덕트를 완성하는 4가지 핵심 분야. 당신의 역량을 가장 명확하게 보여줄 파트에 지원하세요.",
  traitsHeadline: "이런 분이면 좋아요 !",
  ctaLabel: "모집 안내 보러 가기 →",
  parts: [
    {
      id: "pm",
      tabLabel: "PM",
      // 카드 제목은 시안에서 줄바꿈이 지정돼 있어 줄 단위로 나눈다.
      titleLines: ["PM"],
      // TODO: (미확정) 시안 임시 문구
      description: "피엠에 대한 설명 피엠에 대한 설명피엠에 대한 설명",
      traits: [
        "마음에 품고 있는 서비스 목표나 아이디어가 있으신 분",
        "데이터 기반 의사 결정에 큰 관심이 있으신 분",
        "팀을 이끌어나갈 책임감이 있으신 분",
      ],
    },
    {
      id: "design",
      tabLabel: "Design",
      titleLines: ["Design"],
      // TODO: (미확정) 시안 임시 문구
      description:
        "프로덕트 디자인에 대한 설명 프로덕트 디자인에 대한 설명 디자인에 대한 설명",
      // TODO: (미확정) 시안에 PM 탭 내용만 있다. 나머지 파트 문구 필요.
      traits: [],
    },
    {
      id: "web-pe",
      tabLabel: "Web PE",
      titleLines: ["Web", "Product Engineer"],
      // TODO: (미확정) 시안 임시 문구
      description: "웹 프덕 엔지니어에 대한 설명 웹 프덕 엔지니어에 대한 설명",
      // TODO: (미확정) 시안에 내용 없음
      traits: [],
    },
    {
      id: "mobile-pe",
      tabLabel: "Mobile PE",
      titleLines: ["Mobile", "Product Engineer"],
      // TODO: (미확정) 시안 임시 문구
      description:
        "모바일 프덕 엔지니어에 대한 설명 모바일 프덕 엔지니어에 대한 설명 모바일 프덕 엔지니어에 대한 설명",
      // TODO: (미확정) 시안에 내용 없음
      traits: [],
    },
  ],
} as const

export const ABOUT_POSSIBILITY = {
  headline: "새로운 가능성을 UMC에서",
  description:
    "매칭된 팀원들과 함께 실제 서비스 런칭을 목표로 완성도 높은 서비스를 만들어요.",
  stats: [
    { label: "누적 활동 회원 수", value: "4000", unit: "명" },
    { label: "매 기수 평균 지원자 수", value: "1500", unit: "명" },
    { label: "누적 프로젝트 수", value: "600", unit: "개" },
  ],
  values: [
    {
      keyword: "성장",
      lines: [
        "실제 서비스를 기획하고 개발하며, 실무에 가까운 경험을 쌓을 수 있어요.",
        "스터디를 통해 기본기를 다진 뒤, 열정이 있다면 누구나 개발에 도전할 수 있어요.",
      ],
    },
    {
      keyword: "협업",
      lines: [
        "파트에 관계없이 누구나 아이디어를 제안하고, 직접 실현해 볼 수 있어요.",
        "수평적인 문화 속에서 자유롭게 의견을 나누며 함께 일하는 방법을 배워요.",
      ],
    },
    {
      keyword: "연결",
      lines: [
        "같은 목표를 향해 치열하게 고민하고 완성해 가는 과정을 함께해요.",
        "프로젝트 그 이상의 끈끈한 유대감을 형성해요.",
      ],
    },
  ],
} as const

export const ABOUT_INTRO = {
  eyebrow: "ABOUT UMC",
  headlineLines: [
    "기획자, 디자이너, 개발자가",
    "함께 아이디어를 현실로 만드는 대학생 IT 연합 동아리입니다",
  ],
  // TODO: (미확정) 시안 주석 "요거 중앙측에 문의 후 답신 드리겠습니다".
  description:
    "n주간 워크북으로 ~를 하고 마지막 n개월 동안 매칭된 팀원과 하나의 서비스 개발를 목표로 ~ (내용 필요)",
} as const

const EYEBROW = "UNIVERSITY MAKEUS CHALLENGE"

export const ABOUT_HERO = {
  eyebrow: EYEBROW,
  headlineAlt: "BREAK THE RULES",
  description:
    "기획부터 개발까지 가능한 대학생 IT 창업 연합 동아리, 새로운 가능성을 UMC에서",
  ctaLabel: "11기 지원하기",
} as const

export const ABOUT_SCHOOLS = {
  headline: "UMC와 함께하는 학교",
  // 시안 주석의 디자이너 제안. 본문의 "(어필하는 설명 필요)" 임시 문구는 쓰지 않는다.
  description:
    "전국 20여 개 이상의 대학이 함께 하고 있습니다. 지금 이 순간에도 지속적으로 확장되는 거대한 IT 네트워크를 경험하세요.",
  ctaLabel: "챌린저들의 프로젝트 구경하기 →",
  // TODO: 시안은 "한국대"·"한양대 ERICA" 를 반복한 자리표시자다. 실제 목록을
  // 어디서 가져올지(상수 유지 vs 서버 조회) 정해지지 않아 우선 상수로 둔다.
  // 아래는 2026-08-05 dev 응답에 실려 온 리크루팅 대상 학교다.
  names: [
    "가천대",
    "가톨릭대",
    "광운대",
    "단국대",
    "덕성여대",
    "동국대",
    "동덕여대",
    "동아대",
    "동양미래대",
    "서경대",
    "서울여대",
    "성신여대",
    "숙명여대",
    "숭실대",
    "안양대",
    "영남대",
    "이화여대",
    "인제대",
    "인하대",
    "중앙대",
    "한국공학대",
    "한국외대",
    "한국항공대",
    "한성대",
    "한양대 ERICA",
    "홍익대 서울",
    "홍익대 세종",
  ],
} as const

export const ABOUT_CLOSING = {
  eyebrow: EYEBROW,
  // TODO: 시안은 KIMM Bold 100px 이라 BreakTheRules 처럼 벡터가 필요하다.
  // 에셋이 들어오면 텍스트 대신 그 컴포넌트로 교체한다.
  headline: "UMC 11th",
  description:
    "기획부터 서비스 런칭까지 가능한 대학생 IT 창업 연합 동아리, 새로운 가능성을 UMC에서",
  ctaLabel: "11기 지원하기",
} as const
