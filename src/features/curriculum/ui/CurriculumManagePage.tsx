import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import SettingIcon from "@/shared/assets/icon/setting/SettingIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { INITIAL_CURRICULUM_DATA } from "../model/curriculumData"
import { CurriculumCard } from "./CurriculumCard"
import { CurriculumSettingModal } from "./CurriculumSettingModal"
import { PartTabs } from "./PartTabs"

import type { CurriculumItem } from "../model/curriculumData"

export function CurriculumManagePage() {
  const navigate = useNavigate()
  const [selectedPart, setSelectedPart] = useState<string>("PM")
  const [curriculumData, setCurriculumData] = useState(INITIAL_CURRICULUM_DATA)
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false)

  // Default expand card 01 (design-1)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    "design-1": true,
  })

  const currentItems = curriculumData[selectedPart] || []

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleDeleteItem = (id: string) => {
    setCurriculumData((prev) => ({
      ...prev,
      [selectedPart]: (prev[selectedPart] || []).filter(
        (item) => item.id !== id,
      ),
    }))
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

  const handleRestoreItem = (itemToRestore: CurriculumItem, index: number) => {
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
              <CurriculumCard
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
