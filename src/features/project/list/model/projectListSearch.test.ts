import { describe, expect, it } from "vitest"

import { validateProjectListSearch } from "./projectListSearch"

// 이 파서가 /matching/projects 와 /projects 두 경로의 URL 계약을 함께 정한다.
// 여기서 규칙이 바뀌면 두 화면이 동시에 영향을 받는다.
describe("validateProjectListSearch", () => {
  describe("parts", () => {
    it("단일 값을 배열로 감싼다", () => {
      expect(validateProjectListSearch({ parts: "PLAN" }).parts).toEqual([
        "PLAN",
      ])
    })

    it("배열은 유효한 값만 남긴다", () => {
      expect(
        validateProjectListSearch({ parts: ["PLAN", "NOPE", "DESIGN"] }).parts,
      ).toEqual(["PLAN", "DESIGN"])
    })

    // 고른 파트가 없다는 뜻은 undefined 하나로만 표현한다.
    it("남는 값이 없으면 undefined 다", () => {
      expect(
        validateProjectListSearch({ parts: ["NOPE"] }).parts,
      ).toBeUndefined()
      expect(validateProjectListSearch({ parts: [] }).parts).toBeUndefined()
      expect(validateProjectListSearch({ parts: "NOPE" }).parts).toBeUndefined()
      expect(validateProjectListSearch({}).parts).toBeUndefined()
    })

    it("파트 목록 전체를 통과시킨다", () => {
      const all = [
        "PLAN",
        "DESIGN",
        "WEB",
        "ANDROID",
        "IOS",
        "NODEJS",
        "SPRINGBOOT",
        "ADMIN",
      ]

      expect(validateProjectListSearch({ parts: all }).parts).toEqual(all)
    })
  })

  describe("page", () => {
    it("문자열과 숫자를 모두 읽는다", () => {
      expect(validateProjectListSearch({ page: "3" }).page).toBe(3)
      expect(validateProjectListSearch({ page: 3 }).page).toBe(3)
    })

    // 페이지는 1부터다. 0 이나 음수가 그대로 넘어가면 조회가 빈 결과가 된다.
    it("1 미만이거나 읽을 수 없으면 1 로 되돌린다", () => {
      expect(validateProjectListSearch({ page: 0 }).page).toBe(1)
      expect(validateProjectListSearch({ page: -2 }).page).toBe(1)
      expect(validateProjectListSearch({ page: "abc" }).page).toBe(1)
      expect(validateProjectListSearch({}).page).toBe(1)
    })

    it("소수는 내림한다", () => {
      expect(validateProjectListSearch({ page: 2.9 }).page).toBe(2)
    })
  })

  describe("status", () => {
    it("정해진 값만 통과시킨다", () => {
      expect(validateProjectListSearch({ status: "RECRUITING" }).status).toBe(
        "RECRUITING",
      )
      expect(validateProjectListSearch({ status: "COMPLETED" }).status).toBe(
        "COMPLETED",
      )
    })

    it("그 밖의 값은 버린다", () => {
      expect(
        validateProjectListSearch({ status: "DONE" }).status,
      ).toBeUndefined()
      expect(validateProjectListSearch({ status: 1 }).status).toBeUndefined()
    })
  })

  describe("문자열 필터", () => {
    it("문자열만 받는다", () => {
      const search = validateProjectListSearch({
        branch: "Chromium",
        school: "가천대학교",
        keyword: "디자인",
      })

      expect(search.branch).toBe("Chromium")
      expect(search.school).toBe("가천대학교")
      expect(search.keyword).toBe("디자인")
    })

    it("문자열이 아니면 버린다", () => {
      const search = validateProjectListSearch({
        branch: 1,
        school: ["가천대학교"],
        keyword: null,
      })

      expect(search.branch).toBeUndefined()
      expect(search.school).toBeUndefined()
      expect(search.keyword).toBeUndefined()
    })
  })
})
