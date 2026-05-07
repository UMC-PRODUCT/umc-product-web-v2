import { useState } from "react"

import CloseIcon from "@/shared/assets/icon/close/CloseIcon"
import InfoCircleIcon from "@/shared/assets/icon/infomation/InfoCircleIcon"
import SearchIcon from "@/shared/assets/icon/search/SearchIcon"
import { Button } from "@/shared/ui/Button"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import {
  MOCK_ASSIGNABLE_CHALLENGERS,
  ROLE_LABEL_TO_PART,
} from "../model/matchingStatusMock"
import { AssignmentChallengerRow } from "./AssignmentChallengerRow"

import type { AssignableChallenger } from "../model/matchingStatusMock"

interface AssignmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  challengerName: string
  challengerUniversity: string
  role: string
  onAssign: (challenger: AssignableChallenger) => void
}

export function AssignmentModal({
  open,
  onOpenChange,
  projectName,
  challengerName,
  challengerUniversity,
  role,
  onAssign,
}: AssignmentModalProps) {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showComplete, setShowComplete] = useState(false)

  const partRole = ROLE_LABEL_TO_PART[role]

  const filtered =
    search.trim() === ""
      ? []
      : MOCK_ASSIGNABLE_CHALLENGERS.filter(
          (c) => c.partRole === partRole && c.nickname.includes(search.trim()),
        )

  const handleAssign = () => {
    const challenger = MOCK_ASSIGNABLE_CHALLENGERS.find(
      (c) => c.id === selectedId,
    )
    if (!challenger) return
    onAssign(challenger)
    setShowComplete(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearch("")
    setSelectedId(null)
    setShowComplete(false)
  }

  return (
    <Modal.Root open={open} onOpenChange={(next) => !next && handleClose()}>
      <Modal.Portal>
        <Modal.Overlay tone="deep" />
        <Modal.Content className="flex w-160 max-w-[calc(100vw-32px)] flex-col rounded-xl bg-white px-12.5 pt-14 pb-10 shadow-lg focus:outline-none">
          <Modal.Title className="sr-only">팀원 임의 배정</Modal.Title>

          {/* 헤더 */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-4">
              <span className="text-subtitle-4-semibold text-teal-600">
                팀원 임의 배정
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-heading-5-bold text-teal-gray-800">
                  {projectName}
                </span>
                <span className="text-body-2-medium text-teal-gray-600 tracking-[-0.14px]">
                  {challengerName} · {challengerUniversity}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <InfoCircleIcon className="text-teal-gray-400 h-6 w-6" />
              <button
                type="button"
                onClick={handleClose}
                className="text-teal-gray-500 hover:text-teal-gray-700 cursor-pointer"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* 검색바 */}
          <div className="mt-8">
            <div className="shadow-inner-neutral-2 bg-teal-gray-100 flex h-11 items-center justify-between rounded-xl px-4">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedId(null)
                }}
                placeholder="닉네임 또는 이름으로 검색하세요"
                className="text-body-2-regular text-teal-gray-900 placeholder:text-teal-gray-400 w-full bg-transparent focus:outline-none"
              />
              <SearchIcon className="text-teal-gray-400 h-6 w-6 shrink-0" />
            </div>
          </div>

          {/* 검색 결과 */}
          {search.trim() !== "" && (
            <div className="mt-4 flex flex-col gap-0.5">
              {/* 테이블 헤더 */}
              <div className="bg-teal-gray-100 flex items-center gap-5 rounded-t-xl px-[35px] py-2">
                <span className="text-body-3-medium text-teal-gray-500 w-[142px] shrink-0">
                  닉네임/이름
                </span>
                <span className="text-body-3-medium text-teal-gray-500 w-36 shrink-0">
                  학교
                </span>
                <span className="text-body-3-medium text-teal-gray-500 w-34 shrink-0">
                  파트
                </span>
              </div>

              {/* 챌린저 목록 */}
              <div className="flex max-h-55 flex-col gap-px overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-body-3-medium text-teal-gray-400">
                      검색 결과가 없습니다
                    </span>
                  </div>
                ) : (
                  filtered.map((c) => (
                    <AssignmentChallengerRow
                      key={c.id}
                      nickname={c.nickname}
                      university={c.university}
                      partRole={c.partRole}
                      selected={selectedId === c.id}
                      onClick={() =>
                        setSelectedId(selectedId === c.id ? null : c.id)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* 하단 버튼 */}
          <div className="mt-auto flex justify-center pt-8">
            <Button
              variant="fill"
              color="primary"
              size="lg"
              onClick={handleAssign}
              className="w-50 rounded-[10px]"
            >
              해당 프로젝트에 배정
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>

      {/* 배정 완료 확인 */}
      <CtaModal
        open={showComplete}
        variant="warning"
        overlayTone="deep"
        title="배정 완료"
        content="팀원 임의 배정이 완료되었습니다."
        confirmText="확인"
        onOpenChange={() => handleClose()}
        onConfirm={handleClose}
      />
    </Modal.Root>
  )
}
