import { describe, expect, it } from "vitest"

import { filterApplicationSectionsByPart } from "./applicationSectionFilter"

import type { Section } from "@/features/project/new/model/applicationQuestion"

const sections: Section[] = [
  { id: "common", name: "공통", isEnabled: true, questions: [] },
  { id: "design", name: "Design", isEnabled: true, questions: [] },
  { id: "frontend", name: "Frontend", isEnabled: true, questions: [] },
  { id: "backend", name: "Backend", isEnabled: true, questions: [] },
]

describe("filterApplicationSectionsByPart", () => {
  it("디자이너는 공통과 디자인 문항만 본다", () => {
    expect(filterApplicationSectionsByPart(sections, "DESIGN")).toEqual([
      sections[0],
      sections[1],
    ])
  })

  it("프론트엔드 파트는 공통과 프론트엔드 문항만 본다", () => {
    for (const part of ["WEB", "IOS", "ANDROID"]) {
      expect(filterApplicationSectionsByPart(sections, part)).toEqual([
        sections[0],
        sections[2],
      ])
    }
  })

  it("백엔드 파트는 공통과 백엔드 문항만 본다", () => {
    for (const part of ["SPRINGBOOT", "NODEJS"]) {
      expect(filterApplicationSectionsByPart(sections, part)).toEqual([
        sections[0],
        sections[3],
      ])
    }
  })

  it("알 수 없는 파트는 기존 문항 구성을 유지한다", () => {
    expect(filterApplicationSectionsByPart(sections, "PLAN")).toEqual(sections)
  })
})
