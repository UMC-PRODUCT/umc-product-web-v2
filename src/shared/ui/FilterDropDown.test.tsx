import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FilterDropdown } from "./FilterDropDown"

const OPTIONS = [
  { value: "all", label: "전체" },
  { value: "web", label: "Web" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
]

describe("FilterDropdown 다중 선택", () => {
  it("선택한 값을 기존 배열에 추가하고 드롭다운을 유지한다", () => {
    const handleChange = vi.fn()
    const handleClose = vi.fn()

    render(
      <FilterDropdown
        label="파트"
        open
        options={OPTIONS}
        multiSelect
        selectedValues={["web"]}
        onSelectedValuesChange={handleChange}
        onRequestClose={handleClose}
      />,
    )

    fireEvent.click(screen.getByRole("option", { name: "iOS" }))

    expect(handleChange).toHaveBeenCalledWith(["web", "ios"])
    expect(handleClose).not.toHaveBeenCalled()
    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true",
    )
    expect(screen.getByRole("option", { name: "Web" })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })

  it("이미 선택한 값을 배열에서 제거한다", () => {
    const handleChange = vi.fn()

    render(
      <FilterDropdown
        label="파트"
        open
        options={OPTIONS}
        multiSelect
        selectedValues={["web", "ios"]}
        onSelectedValuesChange={handleChange}
      />,
    )

    fireEvent.click(screen.getByRole("option", { name: "Web" }))

    expect(handleChange).toHaveBeenCalledWith(["ios"])
  })

  it("전체 옵션을 선택하면 빈 배열로 정규화한다", () => {
    const handleChange = vi.fn()

    render(
      <FilterDropdown
        label="파트"
        open
        options={OPTIONS}
        multiSelect
        selectedValues={["all", "web"]}
        onSelectedValuesChange={handleChange}
        allValue="all"
      />,
    )

    fireEvent.click(screen.getByRole("option", { name: "전체" }))

    expect(handleChange).toHaveBeenCalledWith([])
  })

  it("전체 값이 선택 배열에 있어도 일반 옵션만 다음 배열에 포함한다", () => {
    const handleChange = vi.fn()

    render(
      <FilterDropdown
        label="파트"
        open
        options={OPTIONS}
        multiSelect
        selectedValues={["all"]}
        onSelectedValuesChange={handleChange}
        allValue="all"
      />,
    )

    fireEvent.click(screen.getByRole("option", { name: "Web" }))

    expect(handleChange).toHaveBeenCalledWith(["web"])
  })

  it("선택한 첫 옵션과 나머지 개수를 표시한다", () => {
    render(
      <FilterDropdown
        label="파트"
        options={OPTIONS}
        multiSelect
        selectedValues={["web", "ios", "android"]}
        onSelectedValuesChange={() => undefined}
      />,
    )

    expect(screen.getByRole("button", { name: "Web 외 2" })).toBeInTheDocument()
  })

  it("선택 옵션 포맷을 호출자가 재정의할 수 있다", () => {
    render(
      <FilterDropdown
        label="파트"
        options={OPTIONS}
        multiSelect
        selectedValues={["web", "ios"]}
        onSelectedValuesChange={() => undefined}
        formatSelectedLabel={(selectedOptions) =>
          `${selectedOptions.length}개 선택`
        }
      />,
    )

    expect(screen.getByRole("button", { name: "2개 선택" })).toBeInTheDocument()
  })
})

describe("FilterDropdown 단일 선택", () => {
  it("같은 값을 다시 선택해도 기존 callback과 닫기 정책을 유지한다", () => {
    const handleSelect = vi.fn()
    const handleClose = vi.fn()

    render(
      <FilterDropdown
        label="모집 상태"
        open
        options={OPTIONS}
        selectedValue="web"
        onSelect={handleSelect}
        onRequestClose={handleClose}
      />,
    )

    fireEvent.click(screen.getByRole("option", { name: "Web" }))

    expect(handleSelect).toHaveBeenCalledWith("web")
    expect(handleClose).toHaveBeenCalledOnce()
  })
})

describe("FilterDropdown 단일 선택 버튼 라벨", () => {
  it("선택한 값의 라벨을 버튼에 보여준다", () => {
    render(
      <FilterDropdown
        label="모집 상태"
        options={OPTIONS}
        selectedValue="web"
      />,
    )

    expect(screen.getByRole("button", { name: "Web" })).toBeInTheDocument()
  })

  it("선택이 없으면 기본 label 을 보여준다", () => {
    render(
      <FilterDropdown label="평가 결과" options={OPTIONS} selectedValue="" />,
    )

    expect(
      screen.getByRole("button", { name: "평가 결과" }),
    ).toBeInTheDocument()
  })

  it("selectedLabel 을 직접 넘기면 그 값이 우선한다", () => {
    render(
      <FilterDropdown
        label="모집 상태"
        options={OPTIONS}
        selectedValue="web"
        selectedLabel="직접 지정"
      />,
    )

    expect(
      screen.getByRole("button", { name: "직접 지정" }),
    ).toBeInTheDocument()
  })
})

describe("FilterDropdown 단일 선택 falsy 값", () => {
  const ZERO_OPTIONS = [
    { value: "0", label: "0순위" },
    { value: "1", label: "1순위" },
  ]

  it('값이 "0" 이어도 선택으로 보고 라벨을 보여준다', () => {
    render(
      <FilterDropdown
        label="우선순위"
        options={ZERO_OPTIONS}
        selectedValue="0"
      />,
    )

    expect(screen.getByRole("button", { name: "0순위" })).toBeInTheDocument()
  })

  it("selectedValue 를 넘기지 않으면 기본 label 을 보여준다", () => {
    render(<FilterDropdown label="우선순위" options={ZERO_OPTIONS} />)

    expect(screen.getByRole("button", { name: "우선순위" })).toBeInTheDocument()
  })
})
