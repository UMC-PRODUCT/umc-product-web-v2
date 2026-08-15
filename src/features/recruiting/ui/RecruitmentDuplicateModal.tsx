import { useEffect, useMemo, useState } from "react"

import CloseThinIcon from "@/shared/assets/icon/close/CloseThinIcon"
import ResetIcon from "@/shared/assets/icon/reset/ResetIcon"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/Button"
import { CheckboxList } from "@/shared/ui/input/checkbox/CheckboxList"
import { Modal } from "@/shared/ui/Modal"

import { useRecruitingSeasonQuotas } from "../hooks/useRecruitingSeasonQuotas"
import { isSeasonTrackCompatible } from "../model/recruitmentList"

import type { Chapter } from "@/entities/organization/model/chapters"

import type { RecruitingTrack } from "../api/types"
import type { DuplicateTargetSeason } from "../model/recruitmentList"

// SUPER_ADMIN/HQ_LEAD/HQ_ADMIN → "central": 전 지부를 넘나들며 학교를 고른다.
// CHAPTER_ADMIN → "chapterAdmin": 본인 지부 하나로 고정, 학교는 기본 전체 선택.
// SCHOOL_ADMIN/SCHOOL_STAFF는 이 모달을 아예 띄우지 않고 즉시 복제한다.
type DuplicateModalRole = "central" | "chapterAdmin"

interface RecruitmentDuplicateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: DuplicateModalRole
  ownChapter?: Chapter
  // 복제 대상 후보. 학교 목록이 아니라 "EDIT 권한이 있는 시즌" 목록이다 — 시즌이
  // 없거나 권한이 없는 학교는 애초에 여기 없어서 선택지에 안 뜬다.
  candidateSeasons: DuplicateTargetSeason[]
  // 원본 라운드의 트랙 구성. 복제(clone) API는 트랙을 새로 지정할 방법이 없고
  // 원본의 recruitableTracks를 그대로 복사해 대상 시즌에 넣는다 — 대상 시즌이
  // 그 트랙을 정원 0 초과로 모집하고 있지 않으면 백엔드가 무조건 거부한다
  // (RECRUITING-0110). 그래서 이 화면에서 미리 걸러주는 게 유일한 대응이다.
  sourceRecruitableTracks?: RecruitingTrack[]
  onCancel: () => void
  onConfirm: (targetSeasonIds: string[]) => void
}

export function RecruitmentDuplicateModal({
  open,
  onOpenChange,
  role,
  ownChapter,
  candidateSeasons,
  sourceRecruitableTracks = [],
  onCancel,
  onConfirm,
}: RecruitmentDuplicateModalProps) {
  const chapters = useMemo(
    () => [...new Set(candidateSeasons.map((season) => season.chapter))],
    [candidateSeasons],
  )
  const [activeChapter, setActiveChapter] = useState<Chapter | undefined>(
    chapters[0],
  )
  // 시즌 하나 = 학교 하나(이번 기수 기준)라 seasonId로 선택 상태를 관리해도
  // 학교 단위 선택과 동일하다.
  const [selectedSeasonIds, setSelectedSeasonIds] = useState<Set<string>>(
    new Set(),
  )

  const currentSeasons = useMemo(
    () =>
      activeChapter
        ? candidateSeasons.filter((season) => season.chapter === activeChapter)
        : [],
    [activeChapter, candidateSeasons],
  )

  const { seasonConfigsMap } = useRecruitingSeasonQuotas(
    currentSeasons.map((season) => season.seasonId),
  )

  const isSeasonSelectable = (seasonId: string) =>
    isSeasonTrackCompatible(
      seasonConfigsMap.get(seasonId),
      sourceRecruitableTracks,
    )

  useEffect(() => {
    setSelectedSeasonIds((prev) => {
      let changed = false
      const next = new Set(prev)
      for (const seasonId of prev) {
        if (seasonConfigsMap.has(seasonId) && !isSeasonSelectable(seasonId)) {
          next.delete(seasonId)
          changed = true
        }
      }
      return changed ? next : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonConfigsMap, sourceRecruitableTracks])

  // 모달을 다시 열 때마다 role에 맞는 기본 선택 상태로 되돌린다.
  // chapterAdmin은 본인 지부 학교 전체가 기본 선택, central은 빈 선택으로 시작.
  useEffect(() => {
    if (!open) return
    setActiveChapter(chapters[0])
    setSelectedSeasonIds(
      role === "chapterAdmin" && ownChapter
        ? new Set(
            candidateSeasons
              .filter((season) => season.chapter === ownChapter)
              .map((season) => season.seasonId),
          )
        : new Set(),
    )
  }, [open, role, ownChapter, chapters, candidateSeasons])

  const selectedList = useMemo(
    () => [...selectedSeasonIds],
    [selectedSeasonIds],
  )
  const hasSelection = selectedList.length > 0

  const toggleSeason = (seasonId: string, checked: boolean) => {
    setSelectedSeasonIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(seasonId)
      else next.delete(seasonId)
      return next
    })
  }

  const removeSeason = (seasonId: string) => {
    setSelectedSeasonIds((prev) => {
      const next = new Set(prev)
      next.delete(seasonId)
      return next
    })
  }

  const schoolLabel = (seasonId: string) =>
    candidateSeasons.find((season) => season.seasonId === seasonId)?.school ??
    seasonId

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) onCancel()
      }}
    >
      <Modal.Portal>
        <Modal.Overlay tone="light" />
        <Modal.Content className="shadow-drop-neutral-1 flex max-h-[calc(100vh-4rem)] w-[46.75rem] max-w-[calc(100vw-2rem)] flex-col rounded-[0.625rem] border border-neutral-200 bg-white focus:outline-none">
          <div className="flex flex-col items-start gap-4 px-8 pt-8">
            <div className="flex flex-col items-start gap-2 px-1">
              <Modal.Title className="text-teal-gray-900 text-[1.625rem] leading-[130%] font-semibold">
                모집 공고 복제하기
              </Modal.Title>
              <Modal.Description className="text-teal-gray-500 w-[27.5rem] max-w-full leading-[145%]">
                선택한 학교의 공유 보관함에 추가됩니다.
              </Modal.Description>
            </div>

            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col items-start gap-1.5 py-2 pr-4">
                {chapters.map((chapter) => {
                  const active = chapter === activeChapter
                  return (
                    <button
                      key={chapter}
                      type="button"
                      disabled={role === "chapterAdmin"}
                      onClick={() => setActiveChapter(chapter)}
                      className={cn(
                        "flex h-11 w-[8.875rem] items-center gap-2.5 rounded-xl px-4 text-lg leading-[140%]",
                        active
                          ? "bg-teal-50 font-semibold text-teal-700"
                          : "text-teal-gray-500 font-medium",
                        role === "chapterAdmin" && "cursor-default",
                      )}
                    >
                      {chapter}
                    </button>
                  )
                })}
              </div>

              <div className="border-teal-gray-200 bg-teal-gray-50 flex max-h-100 w-[30.625rem] max-w-full items-start gap-2.5 overflow-y-auto border-l p-6">
                <div className="flex flex-col items-start gap-4">
                  {currentSeasons.length === 0 ? (
                    <p className="text-body-2-regular text-teal-gray-400">
                      복제할 수 있는 학교가 없습니다.
                    </p>
                  ) : (
                    currentSeasons.map((season) => {
                      // 조회 전(hasConfig=false)에는 아직 알 수 없으니 일단
                      // 선택 가능하게 두고, 끝나는 대로 위 useEffect가 걸러낸다.
                      const hasConfig = seasonConfigsMap.has(season.seasonId)
                      const incompatible =
                        hasConfig && !isSeasonSelectable(season.seasonId)
                      return (
                        <div
                          key={season.seasonId}
                          className="flex flex-col items-start gap-0.5"
                        >
                          <CheckboxList
                            checked={selectedSeasonIds.has(season.seasonId)}
                            onChange={(checked) =>
                              toggleSeason(season.seasonId, checked)
                            }
                            disabled={incompatible}
                            className={incompatible ? "opacity-50" : undefined}
                          >
                            {season.school}
                          </CheckboxList>
                          {incompatible && (
                            <span className="text-label-2-regular pl-2 text-red-500">
                              이 학교는 해당 트랙을 모집하지 않아 복제할 수
                              없어요.
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-teal-gray-200 flex flex-col items-start gap-2.5 border-t bg-white py-5 pr-8 pl-[2.375rem]">
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectedSeasonIds(new Set())}
                className="flex items-center gap-2.5"
              >
                <span
                  className={cn(
                    "leading-[140%] text-teal-600",
                    hasSelection ? "font-semibold" : "font-medium",
                  )}
                >
                  선택 {selectedList.length}
                </span>
                <ResetIcon className="text-teal-gray-300 h-4 w-4" />
              </button>
              <div className="bg-teal-gray-100 h-[1.1875rem] w-px shrink-0" />
              <div className="flex flex-1 items-center gap-1 overflow-x-auto">
                {selectedList.map((seasonId) => (
                  <button
                    key={seasonId}
                    type="button"
                    onClick={() => removeSeason(seasonId)}
                    className="text-teal-gray-600 flex h-7 shrink-0 items-center gap-1 px-1 leading-[140%] font-medium"
                  >
                    {schoolLabel(seasonId)}
                    <CloseThinIcon className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-8 pt-0 pb-8">
            <Button
              type="button"
              variant="weak"
              color="neutral"
              size="s"
              className="h-11 min-w-16 rounded-[0.625rem]"
              onClick={onCancel}
            >
              돌아가기
            </Button>
            <Button
              type="button"
              variant="fill"
              color="primary"
              size="s"
              className="h-11 min-w-19 rounded-[0.625rem]"
              disabled={!hasSelection}
              onClick={() => onConfirm(selectedList)}
            >
              복제하기
            </Button>
          </div>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  )
}
