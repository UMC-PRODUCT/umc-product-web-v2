import { DndContext } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import PlusIcon from "@/shared/assets/icon/plus/PlusIcon"
import { Button } from "@/shared/ui/Button"
import { PageLabel } from "@/shared/ui/page-label/PageLabel"

import { useCurriculumEditor } from "../hooks/useCurriculumEditor"
import { CurriculumCardEditable } from "./CurriculumCardEditable"

interface CurriculumCreatePageProps {
  part?: string
}

export function CurriculumCreatePage({
  part = "PM",
}: CurriculumCreatePageProps) {
  const {
    curriculums,
    sensors,
    closestCenter,
    handleCreateCurriculum,
    handleUpdateCurriculumTitle,
    handleBlurCurriculumTitle,
    handleUpdateWorkbookTitle,
    handleBlurWorkbookTitle,
    handleUpdateMission,
    handleAddMission,
    handleRemoveMission,
    handleAddWorkbook,
    handleDeleteWorkbook,
    handleMoveCurriculumToBottom,
    handleDeleteCurriculum,
    handleDragOver,
    handleDragEnd,
  } = useCurriculumEditor({
    initialCurriculums: [],
    part,
  })

  return (
    <div className="flex w-full max-w-242 flex-col gap-8">
      <div className="relative w-full">
        <PageLabel
          breadcrumb={[
            { id: "settings", label: "설정" },
            { id: "curriculum", label: "커리큘럼" },
            { id: "curriculum-create", label: "커리큘럼 생성" },
          ]}
          title={`${part} 커리큘럼 생성`}
          description="스터디 새 커리큘럼을 만듭니다."
          className="pl-3"
        />

        <Button
          size="s"
          color="primary"
          variant="fill"
          className="absolute right-0 bottom-0 flex cursor-pointer items-center gap-1 rounded-[10px] py-[9px] pr-4 pl-2.5"
          onClick={handleCreateCurriculum}
        >
          <PlusIcon className="size-4 text-white" />
          <span className="text-label-1-medium text-white">새 커리큘럼</span>
        </Button>
      </div>

      {curriculums.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={curriculums.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex w-full flex-col gap-2.5">
              {curriculums.map((item) => (
                <CurriculumCardEditable
                  key={item.id}
                  curriculum={item}
                  onUpdateCurriculumTitle={(title) =>
                    handleUpdateCurriculumTitle(item.id, title)
                  }
                  onBlurCurriculumTitle={(title) =>
                    handleBlurCurriculumTitle(item.id, title)
                  }
                  onUpdateWorkbookTitle={(wbIndex, title) =>
                    handleUpdateWorkbookTitle(item.id, wbIndex, title)
                  }
                  onBlurWorkbookTitle={(wbIndex, title) =>
                    handleBlurWorkbookTitle(item.id, wbIndex, title)
                  }
                  onUpdateMission={(wbIndex, missionIndex, value) =>
                    handleUpdateMission(item.id, wbIndex, missionIndex, value)
                  }
                  onAddWorkbook={() => handleAddWorkbook(item.id)}
                  onDeleteWorkbook={(wbIndex) =>
                    handleDeleteWorkbook(item.id, wbIndex)
                  }
                  onMoveCurriculumToBottom={() =>
                    handleMoveCurriculumToBottom(item.id)
                  }
                  onDeleteCurriculum={() => handleDeleteCurriculum(item.id)}
                  onAddMission={(wbIndex, afterMissionIndex) =>
                    handleAddMission(item.id, wbIndex, afterMissionIndex)
                  }
                  onRemoveMission={(wbIndex, missionIndex) =>
                    handleRemoveMission(item.id, wbIndex, missionIndex)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
