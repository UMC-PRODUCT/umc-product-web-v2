import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import GenerationListItem from "@/components/header/GenerationListItem"
import { useMe } from "@/features/auth/hooks/useMe"
import { logout } from "@/features/auth/lib/logout"
import { isCentralStaff, isSuperAdmin } from "@/features/auth/model/identity"
import { toRoleTag } from "@/features/auth/model/mappers"
import { cn } from "@/shared/lib/utils"

import ProfileIcon from "../assets/icon/people/ProfileIcon"
import { RoleTagChip } from "./chip/RoleTagChip"

interface ProfileDropdownProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
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

  const { data: me } = useMe()
  const canManageMembers = isSuperAdmin(me) || isCentralStaff(me)

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

  const navigate = useNavigate()
  const role = me?.roles?.[0] ? toRoleTag(me.roles[0].roleType) : "challenger"

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
            "shadow-drop-neutral-1 absolute top-10 right-0 z-40 flex w-max min-w-50 flex-col gap-3 rounded-[6px] bg-white px-3 pt-4.5 pb-3.5",
            dropdownClassName,
          )}
        >
          <div className="flex flex-col gap-2.5 px-2.5">
            <div className="h-11.5 w-11.5 shrink-0 overflow-hidden rounded-full">
              {me?.profileImageLink ? (
                <img
                  src={me.profileImageLink}
                  alt={me.name}
                  className="size-full object-cover"
                />
              ) : (
                <ProfileIcon className="size-full" />
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-teal-gray-900 text-subtitle-3-semibold whitespace-nowrap">
                  {me ? `${me.nickname}/${me.name}` : ""}
                </span>

                <RoleTagChip role={role} className="shrink-0" />
              </div>

              <span className="text-caption-2-medium text-teal-gray-500">
                {me?.schoolName ?? ""}
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
                {me?.challengerRecords && me.challengerRecords.length > 0 ? (
                  me.challengerRecords.map((record, index) => (
                    <GenerationListItem
                      key={record.challengerId}
                      generation={Number(record.gisu)}
                      active={index === 0} // 현재는 첫 번째 항목을 활성 상태로 표시
                      className="w-full"
                    />
                  ))
                ) : (
                  <div className="text-caption-3-medium text-teal-gray-400 py-2 text-center">
                    참여 기록이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="bg-teal-gray-100 h-px w-full rounded-[0.5px]"
          />

          {/* TODO: 기수 관리 페이지로 연결/계정 설정 페이지로 연결/로그아웃 API 연동 */}
          <div className="flex flex-col gap-1 px-2.5">
            {canManageMembers && (
              <button type="button" className="h-6 w-15">
                <span className="text-body-2-medium text-teal-gray-700">
                  기수 관리
                </span>
              </button>
            )}
            <button
              type="button"
              className="h-6 w-15"
              onClick={() => navigate({ to: "/settings" })}
            >
              <span className="text-body-2-medium text-teal-gray-700">
                계정 설정
              </span>
            </button>
            <button type="button" onClick={logout} className="h-6 w-15">
              <span className="text-body-2-medium text-error-500">
                로그아웃
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
