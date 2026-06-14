import { useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

import GenerationListItem from "@/components/header/GenerationListItem"
import { logout as apiLogout } from "@/features/auth/api/credentials"
import { useMe } from "@/features/auth/hooks/useMe"
import { logout as localLogout } from "@/features/auth/lib/logout"
import { isCentralStaff, isSuperAdmin } from "@/features/auth/model/identity"
import { toRoleTag } from "@/features/auth/model/mappers"
import { useAuthStore } from "@/features/auth/store/authStore"
import { useSelectedChallengerStore } from "@/features/auth/store/selectedChallengerStore"
import { cn } from "@/shared/lib/utils"

import ProfileIcon from "../assets/icon/people/ProfileIcon"
import { TextButton } from "./button/TextButton"
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

  const { selectedGisuId, setSelectedGisuId } = useSelectedChallengerStore()

  // TODO: GET /api/v2/member/me 연동 후 challengerRecords → challengerHistory, record.gisu → record.generation 으로 교체
  useEffect(() => {
    if (selectedGisuId || !me?.challengerRecords?.length) return
    const latest = [...me.challengerRecords].sort(
      (a, b) => Number(b.gisuId) - Number(a.gisuId),
    )[0]
    if (latest) setSelectedGisuId(latest.gisuId)
  }, [me, selectedGisuId, setSelectedGisuId])

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

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    if (refreshToken) {
      try {
        await apiLogout(refreshToken)
      } catch {
        console.error("Failed to call logout API")
      }
    }
    localLogout()
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
            "shadow-drop-neutral-1 absolute top-10 right-0 z-40 flex w-max min-w-50 flex-col gap-3 rounded-[6px] bg-white px-3 pt-4.5 pb-3.5",
            dropdownClassName,
          )}
        >
          <div className="flex flex-col gap-2.5 px-2.5">
            <button
              type="button"
              className="h-11.5 w-11.5 shrink-0 overflow-hidden rounded-full"
              aria-label="프로필 이미지"
              onClick={() => {
                navigate({ to: "/settings" })
                handleOpenChange(false)
              }}
            >
              {me?.profileImageLink ? (
                <img
                  src={me.profileImageLink}
                  alt={me.name}
                  className="size-full object-cover"
                />
              ) : (
                <ProfileIcon className="size-full" />
              )}
            </button>

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
            <div className="flex w-full flex-col gap-0.5 px-1.5">
              <span className="text-caption-3-medium text-teal-gray-400 h-5.5 w-13 px-1.5 py-0.5">
                {/* TODO: "기수 변경"으로 롤백 */}
                기수
              </span>

              <div className="border-teal-gray-100 flex w-full flex-col gap-0.5 rounded-[10px] border px-[1px] py-[1px]">
                {me?.challengerRecords && me.challengerRecords.length > 0 ? (
                  me.challengerRecords
                    .slice()
                    .sort((a, b) => Number(b.gisuId) - Number(a.gisuId))
                    .map((record) => (
                      <GenerationListItem
                        key={record.challengerId}
                        generation={Number(record.gisu)}
                        active={record.gisuId === selectedGisuId}
                        // TODO: 클릭 시 기수 상태 변경
                        // onClick={() => setSelectedGisuId(record.gisuId)}
                        className="w-full cursor-default"
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

          {/* TODO: 기수 관리 페이지로 연결 */}
          <div className="flex flex-col gap-1 px-1.5">
            {canManageMembers && (
              <TextButton className="text-body-2-medium text-teal-gray-700 hover:decoration-teal-gray-700 h-6 w-15">
                기수 관리
              </TextButton>
            )}
            <TextButton
              onClick={() => navigate({ to: "/settings" })}
              className="text-body-2-medium text-teal-gray-700 hover:decoration-teal-gray-700 h-6 w-15"
            >
              계정 설정
            </TextButton>
            <TextButton
              onClick={() => void handleLogout()}
              className="text-body-2-medium text-error-500 hover:decoration-error-500 h-6 w-15"
            >
              로그아웃
            </TextButton>
          </div>
        </div>
      )}
    </div>
  )
}
