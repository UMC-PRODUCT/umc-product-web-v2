import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import {
  createCurriculum,
  createWeeklyCurriculum,
  deleteCurriculum,
  getCurriculumOverview,
} from "@/entities/curriculum"
import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import SettingIcon from "@/shared/assets/icon/setting/SettingIcon"
import { useActiveGisuId } from "@/shared/hooks/useActiveGisu"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { INITIAL_CURRICULUM_DATA } from "../model/curriculumData"
import {
  mapOverviewToCurriculumItem,
  mapPartToApiEnum,
} from "../model/curriculumMapper"
import { CurriculumCardReadonly } from "./CurriculumCardReadonly"
import { CurriculumSettingModal } from "./CurriculumSettingModal"
import { PartTabs } from "./PartTabs"

import type { CurriculumItem } from "../model/curriculumData"

export function CurriculumManagePage() {
  const navigate = useNavigate()
  const [selectedPart, setSelectedPart] = useState<string>("PM")
  const [curriculumData, setCurriculumData] = useState(INITIAL_CURRICULUM_DATA)
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false)
  const { data: activeGisuId } = useActiveGisuId()
  const gisuId = activeGisuId ?? 10

  // Default expand card 01 (design-1)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "design-1": true,
  })

  useEffect(() => {
    let isSubscribed = true
    async function loadCurriculum() {
      if (!gisuId) return
      try {
        const apiPart = mapPartToApiEnum(selectedPart)
        const overview = await getCurriculumOverview({ gisuId, part: apiPart })
        if (isSubscribed && overview && overview.curriculumId) {
          const item = mapOverviewToCurriculumItem(overview, 0)
          setCurriculumData((prev) => ({
            ...prev,
            [selectedPart]: [item],
          }))
        }
      } catch {
        // Fallback to initial local mock data if api has no entry
      }
    }
    loadCurriculum()
    return () => {
      isSubscribed = false
    }
  }, [gisuId, selectedPart])

  const currentItems = curriculumData[selectedPart] || []

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleDeleteItem = async (id: string) => {
    setCurriculumData((prev) => ({
      ...prev,
      [selectedPart]: (prev[selectedPart] || []).filter(
        (item) => item.id !== id,
      ),
    }))

    const numericId = Number(id)
    if (!Number.isNaN(numericId) && numericId > 0) {
      try {
        await deleteCurriculum(numericId)
      } catch {
        // Handled silently or toast
      }
    }
  }

  const handleReorderItems = (fromIndex: number, toIndex: number) => {
    setCurriculumData((prev) => {
      const list = [...(prev[selectedPart] || [])]
      const [moved] = list.splice(fromIndex, 1)
      if (!moved) return prev
      list.splice(toIndex, 0, moved)
      const renumbered = list.map((item, idx) => ({
        ...item,
        number: String(idx + 1).padStart(2, "0"),
      }))
      return {
        ...prev,
        [selectedPart]: renumbered,
      }
    })
  }

  const handleRestoreItem = async (
    itemToRestore: CurriculumItem,
    index: number,
  ) => {
    setCurriculumData((prev) => {
      const list = [...(prev[selectedPart] || [])]
      list.splice(index, 0, itemToRestore)
      const renumbered = list.map((item, idx) => ({
        ...item,
        number: String(idx + 1).padStart(2, "0"),
      }))
      return {
        ...prev,
        [selectedPart]: renumbered,
      }
    })

    try {
      const apiPart = mapPartToApiEnum(selectedPart)
      const newCurriculumId = await createCurriculum({
        gisuId,
        part: apiPart,
        title: itemToRestore.title || "복원된 커리큘럼",
      })

      if (newCurriculumId) {
        setCurriculumData((prev) => {
          const list = prev[selectedPart] || []
          const updated = list.map((c) =>
            c.id === itemToRestore.id
              ? { ...c, id: String(newCurriculumId) }
              : c,
          )
          return {
            ...prev,
            [selectedPart]: updated,
          }
        })

        if (itemToRestore.workbooks && itemToRestore.workbooks.length > 0) {
          for (const wb of itemToRestore.workbooks) {
            const now = new Date()
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            await createWeeklyCurriculum({
              curriculumId: newCurriculumId,
              weekNo: wb.number,
              title: wb.title,
              startsAt: now.toISOString(),
              endsAt: nextWeek.toISOString(),
            })
          }
        }
      }
    } catch {
      // Ignore restore API error fallback to local state
    }
  }

  return (
    <div className="flex w-full max-w-242 flex-col gap-8">
      <PageLabel
        breadcrumb={[
          { id: "settings", label: "설정" },
          { id: "curriculum", label: "커리큘럼" },
        ]}
        title="커리큘럼"
        description="파트와 트랙별 스터디 커리큘럼을 정합니다."
        className="pl-3"
      />

      <div className="flex w-full flex-col gap-4">
        <PartTabs value={selectedPart} onValueChange={setSelectedPart} />

        <div className="flex w-full items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingModalOpen(true)}
              className="border-teal-gray-400/15 box-border flex cursor-pointer items-center gap-1 rounded-[10px] border bg-white py-[9px] pr-3.5 pl-2.5"
            >
              <SettingIcon className="text-teal-gray-700 size-4" />
              <span className="text-label-1-medium text-teal-gray-700">
                편집
              </span>
            </button>

            <Button
              size="s"
              color="primary"
              variant="fill"
              className="flex cursor-pointer items-center gap-1 rounded-[10px] py-[9px] pr-4 pl-2.5"
              onClick={() =>
                navigate({
                  to: "/manage/curriculum/create",
                  search: { part: selectedPart },
                })
              }
            >
              <PlusIcon className="size-4 text-white" />
              <span className="text-label-1-medium text-white">
                새 커리큘럼
              </span>
            </Button>
          </div>
        </div>

        {currentItems.length > 0 ? (
          <div className="flex w-full flex-col gap-2.5">
            {currentItems.map((item) => (
              <CurriculumCardReadonly
                key={item.id}
                curriculum={item}
                isExpanded={!!expandedIds[item.id]}
                onToggleExpand={() => toggleExpand(item.id)}
                onEdit={() =>
                  navigate({
                    to: "/manage/curriculum/edit",
                    search: { part: selectedPart, focusId: item.id },
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex h-75 w-full items-center justify-center">
            <p className="text-body-2-medium text-teal-gray-400">
              현재 등록된 커리큘럼이 없습니다
            </p>
          </div>
        )}
      </div>

      <CurriculumSettingModal
        open={isSettingModalOpen}
        onOpenChange={setIsSettingModalOpen}
        items={currentItems}
        onDeleteItem={handleDeleteItem}
        onReorderItems={handleReorderItems}
        onRestoreItem={handleRestoreItem}
      />
    </div>
  )
}
