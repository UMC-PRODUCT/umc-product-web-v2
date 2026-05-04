import SvgCloseIcon from "@/shared/assets/icon/close/CloseIcon"
import { PartTagChip } from "@/shared/ui/chip/PartTagChip"
import MemberCount from "@/shared/ui/MemberCount"

import { TeamMemberRow } from "./TeamMemberRow"

type RoleKey =
  | "plan"
  | "design"
  | "web"
  | "ios"
  | "android"
  | "springboot"
  | "nodejs"

type Member = {
  id: number | string
  nickname: string
  name: string
  school: string
}

type TeamRole = {
  role: RoleKey
  current: number
  total: number
  members: Member[]
}

// 실제 API 연동 시 교체
const TEAM_DATA: TeamRole[] = [
  {
    role: "design",
    current: 2,
    total: 2,
    members: [
      { id: 1, nickname: "이방토룰루", name: "이예원", school: "한양대 ERICA" },
      { id: 2, nickname: "닉네임", name: "이름", school: "한국대" },
    ],
  },
  {
    role: "web",
    current: 3,
    total: 4,
    members: [
      { id: 1, nickname: "이방토", name: "이예원", school: "한양대 ERICA" },
      { id: 3, nickname: "제이", name: "정재현", school: "한양대 ERICA" },
      { id: 4, nickname: "해찬", name: "이동혁", school: "중앙대" },
    ],
  },
  {
    role: "springboot",
    current: 5,
    total: 6,
    members: [
      { id: 1, nickname: "이방토", name: "이예원", school: "한양대 ERICA" },
      { id: 2, nickname: "제이", name: "정재현", school: "한양대 ERICA" },
      { id: 3, nickname: "킴", name: "김정우", school: "중앙대" },
      { id: 4, nickname: "해찬", name: "이동혁", school: "중앙대" },
      { id: 5, nickname: "마크", name: "이민형", school: "홍익대" },
    ],
  },
]

interface TeamMemberModalProps {
  onClose: () => void
}

export function TeamMemberModal({ onClose }: TeamMemberModalProps) {
  return (
    <div className="border-teal-gray-100 relative flex max-h-[calc(100svh-4rem)] w-full max-w-[31.25rem] flex-col gap-6 rounded-xl border bg-white p-4">
      <button
        type="button"
        onClick={onClose}
        className="hover:bg-teal-gray-100 shadow-inner-neutral-2 absolute top-2.5 right-2.5 flex items-center justify-center rounded-lg transition-colors"
        aria-label="닫기"
      >
        <SvgCloseIcon width={26} height={26} />
      </button>

      <h2 className="text-heading-6-semibold text-teal-gray-900">팀원 구성</h2>

      <div className="border-teal-gray-100 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto rounded-xl border p-[10px]">
        <div className="flex flex-col gap-8">
          {TEAM_DATA.map((roleData) => (
            <div key={roleData.role} className="flex flex-col gap-2">
              <div className="flex items-end justify-between">
                <PartTagChip role={roleData.role} />
                <MemberCount
                  size="xs"
                  current={roleData.current}
                  total={roleData.total}
                  className="text-teal-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-1">
                {roleData.members.map((member, i) => (
                  <TeamMemberRow
                    key={`${roleData.role}-${member.id}`}
                    index={i + 1}
                    {...member}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
