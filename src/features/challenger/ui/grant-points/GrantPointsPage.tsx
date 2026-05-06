import { useState } from "react"

import { ChallengerRecordDetail } from "@/features/challenger/ui/grant-points/ChallengerRecordDetail"
import { GrantPointsForm } from "@/features/challenger/ui/grant-points/GrantPointsForm"
import { MemberRecordList } from "@/features/challenger/ui/grant-points/MemberRecordList"
import { MemberSearchPanel } from "@/features/challenger/ui/grant-points/MemberSearchPanel"
import { SectionCard } from "@/features/challenger/ui/shared/SectionCard"

import type {
  ChallengerInfoResponse,
  SearchMemberItem,
} from "@/features/challenger/model/types"

export function GrantPointsPage() {
  const [selectedMember, setSelectedMember] = useState<SearchMemberItem | null>(
    null,
  )
  const [selectedChallengerId, setSelectedChallengerId] = useState<
    string | null
  >(null)

  const handleSelectMember = (member: SearchMemberItem) => {
    setSelectedMember(member)
    setSelectedChallengerId(null)
  }

  const handleSelectRecord = (record: ChallengerInfoResponse) => {
    setSelectedChallengerId(record.challengerId)
  }

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col gap-6 px-8.5 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-5-semibold text-teal-gray-900">
          챌린저 상벌점 부여
        </h1>
        <p className="text-body-2-regular text-teal-gray-500">
          회원을 검색하여 챌린저 기록을 선택하고, 상벌점을 부여할 수 있습니다.
        </p>
      </header>

      <SectionCard
        title="1. 회원 검색"
        description="이름, 닉네임, 이메일로 회원을 찾아 선택하세요."
      >
        <MemberSearchPanel
          selectedMember={selectedMember}
          onSelectMember={handleSelectMember}
        />
      </SectionCard>

      {selectedMember && (
        <SectionCard
          title="2. 챌린저 기록 선택"
          description={`${selectedMember.nickname}/${selectedMember.name} 회원의 챌린저 기록입니다.`}
        >
          <MemberRecordList
            memberId={selectedMember.memberId}
            selectedChallengerId={selectedChallengerId}
            onSelect={handleSelectRecord}
          />
        </SectionCard>
      )}

      {selectedChallengerId && (
        <SectionCard
          title="3. 챌린저 정보"
          description="선택한 챌린저 기록의 상세 정보와 상벌점 내역입니다."
        >
          <ChallengerRecordDetail challengerId={selectedChallengerId} />
        </SectionCard>
      )}

      {selectedChallengerId && (
        <SectionCard
          title="4. 상벌점 부여"
          description="유형과 점수, 사유를 입력해 상벌점을 부여하세요."
        >
          <GrantPointsForm challengerId={selectedChallengerId} />
        </SectionCard>
      )}
    </div>
  )
}
