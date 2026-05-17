import { SCHOOLS_BY_BRANCH } from "@/features/project/list/model/projectFilterOptions"

const KNOWN_ABBREVIATIONS: ReadonlySet<string> = new Set(
  Object.values(SCHOOLS_BY_BRANCH).flat(),
)

const FULL_TO_ABBR: Readonly<Record<string, string>> = {
  광운대학교: "광운대",
  동양미래대학교: "동양미래대",
  서울여자대학교: "서울여대",
  한국공학대학교: "한국공학대",
  한국외국어대학교: "한국외대",
  동국대학교: "동국대",
  이화여자대학교: "이화여대",
  "홍익대학교 서울": "홍익대 서울",
  "홍익대학교 세종": "홍익대 세종",
  가천대학교: "가천대",
  동덕여자대학교: "동덕여대",
  숙명여자대학교: "숙명여대",
  인하대학교: "인하대",
  한국항공대학교: "한국항공대",
  동아대학교: "동아대",
  영남대학교: "영남대",
  인제대학교: "인제대",
  서경대학교: "서경대",
  성신여자대학교: "성신여대",
  숭실대학교: "숭실대",
  안양대학교: "안양대",
  "한양대학교 ERICA": "한양대 ERICA",
  가톨릭대학교: "가톨릭대",
  단국대학교: "단국대",
  덕성여자대학교: "덕성여대",
  중앙대학교: "중앙대",
  한성대학교: "한성대",
}

export function formatSchoolName(
  schoolName: string | null | undefined,
): string {
  if (!schoolName) return ""
  if (FULL_TO_ABBR[schoolName]) return FULL_TO_ABBR[schoolName]
  if (KNOWN_ABBREVIATIONS.has(schoolName)) return schoolName
  return schoolName
}
