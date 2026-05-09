import { useEffect, useRef, useState } from "react"

import GenerationListItem from "@/components/header/GenerationListItem"
import { cn } from "@/shared/lib/utils"

import ProfileIcon from "../assets/icon/people/ProfileIcon"
import { RoleTagChip } from "./chip/RoleTagChip"

interface ProfileDropdownProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  selectedValue?: string
  onSelect?: (value: string) => void
  children?: React.ReactNode
  dropdownClassName?: string
  triggerClassName?: string
  triggerStyle?: React.CSSProperties
}

export function ProfileDropdown({
  open = false,
  onOpenChange,
  children,
  dropdownClassName,
  triggerClassName,
  triggerStyle,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(open)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        onOpenChange?.(false)
      }
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [isOpen, onOpenChange])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => handleOpenChange(!isOpen)}
        className={cn("flex items-center", triggerClassName)}
        style={triggerStyle}
      >
        <div className="size-full">{children}</div>
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            "shadow-drop-neutral-1 fixed top-15 right-8.5 flex min-w-50 flex-col gap-3 rounded-[6px] bg-white px-3 pt-4.5 pb-3.5",
            dropdownClassName,
          )}
        >
          {/* TODO: 사용자 정보 API 연동 */}
          <div className="flex flex-col gap-2.5 px-2.5">
            <div className="h-11.5 w-11.5 shrink-0 overflow-hidden rounded-full">
              <ProfileIcon className="size-full" />
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-teal-gray-900 text-subtitle-3-semibold">
                  이방토/이예원
                </span>

                <RoleTagChip role="challenger" />
              </div>

              <span className="text-caption-2-medium text-teal-gray-500">
                한양대 ERICA
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div
              aria-hidden="true"
              className="bg-teal-gray-100 h-px w-full rounded-[0.5px]"
            />

            {/* 기수 */}
            <div className="flex w-full flex-col gap-0.5 px-2.5">
              <span className="text-caption-3-medium text-teal-gray-400 flex h-5.5 w-13 items-center justify-center">
                기수 변경
              </span>

              <div className="border-teal-gray-100 flex w-full flex-col gap-0.5 rounded-[10px] border px-0.5 py-0.5">
                {/* TODO: 기수 선택 시 글로벌 상태 변경 */}
                <GenerationListItem
                  generation={10}
                  year={2026}
                  active={true}
                  className="w-full"
                />
                <GenerationListItem
                  generation={9}
                  year={2025}
                  className="w-full"
                />
                <GenerationListItem
                  generation={8}
                  year={2025}
                  className="w-full"
                />
                <GenerationListItem
                  generation={7}
                  year={2024}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="bg-teal-gray-100 h-px w-full rounded-[0.5px]"
          />

          {/* TODO: 계정 연동/계정 삭제/로그아웃 기능 추가 */}
          <div className="flex flex-col gap-0.5 px-2.5">
            <button className="h-6 w-15">
              <span className="text-body-2-medium text-teal-gray-700">
                계정 연동
              </span>
            </button>
            <button className="h-6 w-15">
              <span className="text-body-2-medium text-teal-gray-700">
                계정 삭제
              </span>
            </button>
            <button className="h-6 w-15">
              <span className="text-body-2-medium text-teal-gray-700">
                로그아웃
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
