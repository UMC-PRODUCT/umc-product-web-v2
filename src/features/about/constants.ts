import anyang from "@/shared/assets/image/about/schools/anyang.webp"
import catholic from "@/shared/assets/image/about/schools/catholic.webp"
import chungang from "@/shared/assets/image/about/schools/chungang.webp"
import dankook from "@/shared/assets/image/about/schools/dankook.webp"
import dongduk from "@/shared/assets/image/about/schools/dongduk.webp"
import dongguk from "@/shared/assets/image/about/schools/dongguk.webp"
import dongyangMirae from "@/shared/assets/image/about/schools/dongyang-mirae.webp"
import duksung from "@/shared/assets/image/about/schools/duksung.webp"
import ewha from "@/shared/assets/image/about/schools/ewha.webp"
import gachon from "@/shared/assets/image/about/schools/gachon.webp"
import hansung from "@/shared/assets/image/about/schools/hansung.webp"
import hongik from "@/shared/assets/image/about/schools/hongik.webp"
import hufs from "@/shared/assets/image/about/schools/hufs.webp"
import inha from "@/shared/assets/image/about/schools/inha.webp"
import koreaAerospace from "@/shared/assets/image/about/schools/korea-aerospace.webp"
import sejong from "@/shared/assets/image/about/schools/sejong.webp"
import seokyeong from "@/shared/assets/image/about/schools/seokyeong.webp"
import seoulWomens from "@/shared/assets/image/about/schools/seoul-womens.webp"
import soongsil from "@/shared/assets/image/about/schools/soongsil.webp"
import sungshin from "@/shared/assets/image/about/schools/sungshin.webp"
import comgongSunbae from "@/shared/assets/image/about/sponsors/comgong-sunbae.webp"
import gridge from "@/shared/assets/image/about/sponsors/gridge.webp"
import jober from "@/shared/assets/image/about/sponsors/jober.webp"
import neordinary from "@/shared/assets/image/about/sponsors/neordinary.webp"
import softSquared from "@/shared/assets/image/about/sponsors/soft-squared.webp"
import vieworks from "@/shared/assets/image/about/sponsors/vieworks.webp"
import { APPLY_ENTRY_PATH } from "@/shared/config/headerRecruitingWindow"

export const ABOUT_RECRUIT = {
  headline: "UMC 11기 모집 분야",
  descriptionLines: [
    "AI를 활용해 기획하고, 디자인하고, 직접 서비스를 만드는 11기 UMC",
  ],
  traitsHeadline: "이런 분이면 좋아요 !",
  ctaLabel: "모집 안내 보러 가기 →",
  ctaTo: "/projects/notice",
  parts: [
    {
      id: "pm",
      tabLabel: "PM",
      titleLines: ["PM"],
      descriptionLines: [
        "서비스의 문제를 정의하고,",
        "아이디어를 구체화해 실제 제품으로",
        "만들어가는 역할입니다.",
      ],
      traits: [
        "아이디어를 실제 제품으로 만들어보고 싶은 분",
        "사용자와 서비스의 문제를 발견하고 해결하는 과정을 즐기는 분",
        "다양한 직군과 협업하며 프로젝트를 끝까지 이끌어보고 싶은 분",
      ],
    },
    {
      id: "design",
      tabLabel: "Design",
      titleLines: ["Design"],
      descriptionLines: [
        "사용자에게 필요한 경험을 고민하고,",
        "이를 직관적이고 매력적인 화면과",
        "인터랙션으로 구현하는 역할입니다.",
      ],
      traits: [
        "사용자가 더 쉽고 편리하게 사용할 수 있는 경험을 고민하는 것이 재미있는 분",
        "UX/UI를 통해 아이디어를 실제 제품 경험으로 만들어보고 싶은 분",
        "기획·개발과 함께 협업하며 제품을 완성해보고 싶은 분",
      ],
    },
    {
      id: "web-pe",
      tabLabel: "Web PE",
      titleLines: ["Web", "Product Engineer"],
      descriptionLines: [
        "웹 서비스의 기획된 기능을",
        "실제 동작하는 제품으로",
        "구현하는 역할입니다.",
        "Frontend와 Backend를",
        "아우르며 화면 구현부터 API,",
        "데이터베이스, 인증, 배포까지",
        "제품 개발의 전 과정을 경험합니다.",
      ],
      traits: [
        "기획된 아이디어를 실제 웹 서비스로 구현해보고 싶은 분",
        "Frontend와 Backend를 함께 경험하며 제품 개발의 전 과정을 배우고 싶은 분",
        "AI를 적극 활용해 더 빠르고 효율적으로 개발하는 방식을 경험해보고 싶은 분",
      ],
    },
    {
      id: "mobile-pe",
      tabLabel: "Mobile PE",
      titleLines: ["Mobile", "Product Engineer"],
      descriptionLines: [
        "모바일 환경에서 사용자가",
        "직접 사용하는 앱 서비스를",
        "기획된 기능에 맞춰 구현하는",
        "역할입니다. 화면 구현부터",
        "기능 개발, 서버 연동,",
        "데이터 처리, 배포까지 모바일",
        "제품 개발의 전 과정을 경험합니다.",
      ],
      traits: [
        "사용자가 직접 사용하는 모바일 앱을 만들어보고 싶은 분",
        "기획된 아이디어를 실제 앱 서비스로 구현해보고 싶은 분",
        "하나의 제품팀에서 협업하며 서비스를 완성해보고 싶은 분",
      ],
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
  descriptionLines: [
    "기획부터 개발까지 가능한 대학생 IT 창업 연합 동아리,",
    "새로운 가능성을 UMC에서",
  ],
  ctaLabel: "11기 지원하기",
  // 헤더 지원하기와 같은 곳으로 보낸다. 진입로가 갈리면 한쪽만 바뀐다.
  ctaTo: APPLY_ENTRY_PATH,
} as const

export const ABOUT_SCHOOLS = {
  headline: "UMC와 함께하는 학교",
  descriptionLines: [
    "전국 20여 개 이상의 대학이 함께 하고 있습니다.",
    "지금 이 순간에도 지속적으로 확장되는 거대한 IT 네트워크를 경험하세요!",
  ],
  ctaLabel: "챌린저들의 프로젝트 구경하기 →",
  ctaTo: "/projects",
  // 11기 참여 학교. 기수마다 바뀌지만 서버에 랜딩용 조회 API 가 없어 상수로 둔다.
  // 홍익대는 서울·세종 캠퍼스가 같은 엠블럼을 쓴다(원본 파일 md5 동일).

  // TODO: 기수 전환 때 목록·로고를 함께 갱신해야 한다. 서버에서 내려주게 되면
  // 이 배열을 지우고 조회로 바꾼다.
  schools: [
    { name: "가천대", logo: gachon },
    { name: "가톨릭대", logo: catholic },
    { name: "단국대", logo: dankook },
    { name: "덕성여대", logo: duksung },
    { name: "동국대", logo: dongguk },
    { name: "동덕여대", logo: dongduk },
    { name: "동양미래대", logo: dongyangMirae },
    { name: "서경대", logo: seokyeong },
    { name: "서울여대", logo: seoulWomens },
    { name: "성신여대", logo: sungshin },
    { name: "숭실대", logo: soongsil },
    { name: "세종대", logo: sejong },
    { name: "안양대", logo: anyang },
    { name: "이화여대", logo: ewha },
    { name: "인하대", logo: inha },
    { name: "중앙대", logo: chungang },
    { name: "한국외대", logo: hufs },
    { name: "한국항공대", logo: koreaAerospace },
    { name: "한성대", logo: hansung },
    { name: "홍익대(서울)", logo: hongik },
    { name: "홍익대(세종)", logo: hongik },
  ],
} as const

export const ABOUT_SPONSORS = {
  headline: "후원사",
  descriptionLines: [
    "UMC의 성장을 함께 만들어주시는 후원사와 함께",
    "더 많은 배움과 도전의 기회를 이어가고 있습니다.",
  ],
  ctaLabel: "후원 문의하기 →",
  ctaHref: "mailto:university@makeus.in",
  lead: [
    {
      name: "컴공선배",
      logo: comgongSunbae,
      width: "w-[53px] md:w-[94px] lg:w-[150px]",
    },
    {
      name: "너디너리",
      logo: neordinary,
      width: "w-[113px] md:w-[200px] lg:w-[321px]",
    },
  ],
  partners: [
    {
      name: "소프트스퀘어드",
      logo: softSquared,
      width: "w-[113px] md:w-[139px] lg:w-[222px]",
    },
    {
      name: "그릿지",
      logo: gridge,
      width: "w-[98px] md:w-[120px] lg:w-[193px]",
    },
    { name: "jober", logo: jober, width: "w-[90px] md:w-[110px] lg:w-[177px]" },
    {
      name: "vieworks",
      logo: vieworks,
      width: "w-[114px] md:w-[140px] lg:w-[225px]",
    },
  ],
} as const

export const ABOUT_CLOSING = {
  eyebrow: EYEBROW,
  // 텍스트가 아니라 벡터(UmcEleventh)로 그린다. 대체 텍스트로만 쓴다.
  headline: "UMC 11th",
  descriptionLines: [
    "기획부터 서비스 런칭까지 가능한 대학생 IT 창업 연합 동아리,",
    "새로운 가능성을 UMC에서",
  ],
  ctaLabel: "11기 지원하기",
  // 헤더 지원하기와 같은 곳으로 보낸다. 진입로가 갈리면 한쪽만 바뀐다.
  ctaTo: APPLY_ENTRY_PATH,
} as const
