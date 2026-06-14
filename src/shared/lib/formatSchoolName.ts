import { SCHOOLS_BY_BRANCH } from "@/shared/config/schools"

const KNOWN_ABBREVIATIONS: ReadonlySet<string> = new Set(
  Object.values(SCHOOLS_BY_BRANCH).flat(),
)

const FULL_TO_ABBR: Readonly<Record<string, string>> = {
  가천대학교: "가천대",
  가톨릭대학교: "가톨릭대",
  강릉원주대학교: "강릉원주대",
  경상국립대학교: "경상국립대",
  경희대학교: "경희대",
  광운대학교: "광운대",
  국립부경대학교: "부경대",
  단국대학교: "단국대",
  덕성여자대학교: "덕성여대",
  동국대학교: "동국대",
  동덕여자대학교: "동덕여대",
  동아대학교: "동아대",
  동양미래대학교: "동양미래대",
  명지대학교: "명지대",
  상명대학교: "상명대",
  서경대학교: "서경대",
  서울여자대학교: "서울여대",
  성신여자대학교: "성신여대",
  숙명여자대학교: "숙명여대",
  숭실대학교: "숭실대",
  안양대학교: "안양대",
  연세대학교: "연세대",
  영남대학교: "영남대",
  울산대학교: "울산대",
  이화여자대학교: "이화여대",
  인제대학교: "인제대",
  인하대학교: "인하대",
  전북대학교: "전북대",
  중앙대학교: "중앙대",
  한국공학대학교: "한국공학대",
  한국외국어대학교: "한국외대",
  한국항공대학교: "한국항공대",
  한성대학교: "한성대",
  "한양대학교 ERICA": "한양대 ERICA",
  한양사이버대학교: "한양사이버대",
  "홍익대학교 서울캠퍼스": "홍익대 서울",
  "홍익대학교 세종캠퍼스": "홍익대 세종",
}

export function formatSchoolName(
  schoolName: string | null | undefined,
): string {
  if (!schoolName) return ""
  if (FULL_TO_ABBR[schoolName]) return FULL_TO_ABBR[schoolName]
  if (KNOWN_ABBREVIATIONS.has(schoolName)) return schoolName
  return schoolName
}
