import { useEffect, useRef, useState } from "react"

import DownChevronIcon from "@/shared/assets/icon/chevron/sidebar/DownChevronIcon"
import { cn } from "@/shared/lib/utils"

import KakaoChannelListItem from "./KakaoChannelListItem"

interface HeaderButtonProps {
  label: string
  type?: "trailing-icon" | "text"
  className?: string
}

export default function HeaderButton({
  label,
  type = "text",
  className,
}: HeaderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "text-body-1-medium text-teal-gray-600 hover:bg-teal-gray-100 flex h-9 items-center rounded-full transition-colors",
          type === "trailing-icon" ? "pr-3 pl-4.5" : "px-4.5",
          className,
        )}
      >
        {label}
        {type === "trailing-icon" && (
          <DownChevronIcon className="ml-0.5 size-4" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="shadow-drop-neutral-1 border-teal-gray-50 fixed top-15 right-22.5 flex flex-col rounded-[8px] border bg-white p-0.5"
        >
          <div className="h-[26px] w-full px-3 pt-[7px] pb-[1px]">
            <span className="text-caption-2-medium text-teal-gray-400">
              카카오톡 채널
            </span>
          </div>

          {/* TODO: 카카오톡 채널 연동 */}
          <KakaoChannelListItem label="UMC" />
          <KakaoChannelListItem label="UMC PRODUCT" />
        </div>
      )}
    </div>
  )
}
