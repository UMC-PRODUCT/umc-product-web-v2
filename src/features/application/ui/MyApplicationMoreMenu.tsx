import { useMutation, useQuery } from "@tanstack/react-query"
import { Popover } from "radix-ui"
import { useMemo, useState } from "react"

import { useToastStore } from "@/components/toast/useToastStore"
import { useMe } from "@/features/auth/hooks/useMe"
import {
  cancelApplication,
  getActiveMatchingRound,
  getProjectDetail,
  type MyProjectApplicationResponse,
} from "@/features/project/list/api/matchingProject"
import { MyApplicationModal } from "@/features/project/list/ui/apply-modal/MyApplicationModal"
import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { DropdownItem } from "@/shared/ui/dropdown/DropdownItem"
import { Modal } from "@/shared/ui/Modal"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import type { MatchingProject } from "@/features/project/list/model/matchingProject"

const PART_LABEL: Record<string, string> = {
  PLAN: "기획",
  DESIGN: "Design",
  WEB: "Web",
  IOS: "iOS",
  ANDROID: "Android",
  SPRINGBOOT: "SpringBoot",
  NODEJS: "Node.js",
}

function toModalData(item: MyProjectApplicationResponse): MatchingProject {
  const owner = item.project.productOwner
  const namePart =
    owner.nickname && owner.name
      ? `${owner.nickname}/${owner.name}`
      : (owner.name ?? "")
  return {
    id: String(item.projectId),
    branch: "",
    school: owner.schoolName ?? "",
    title: item.project.name,
    description: "",
    authorSchoolLine: [namePart, owner.schoolName].filter(Boolean).join(" · "),
    coverImage: item.project.thumbnailImageUrl
      ? { src: item.project.thumbnailImageUrl }
      : null,
    recruitRows: item.project.partQuotas.map((q) => ({
      part: PART_LABEL[q.part] ?? q.part,
      current: q.currentCount,
      total: q.quota,
    })),
  }
}

interface MyApplicationMoreMenuProps {
  item: MyProjectApplicationResponse
  onCancelled?: () => void
}

export function MyApplicationMoreMenu({
  item,
  onCancelled,
}: MyApplicationMoreMenuProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const addToast = useToastStore((s) => s.addToast)

  const { data: me } = useMe()
  const myChapterId = useMemo(() => {
    const records = me?.challengerRecords
    if (!records?.length) return null
    const latest = [...records].sort(
      (a, b) => Number(b.gisuId) - Number(a.gisuId),
    )[0]
    return latest?.chapterId != null ? Number(latest.chapterId) : null
  }, [me])

  const { data: activeMatchingRound } = useQuery({
    queryKey: ["activeMatchingRound", myChapterId],
    queryFn: () => getActiveMatchingRound(myChapterId!),
    enabled: myChapterId != null,
    staleTime: 60 * 1000,
  })

  const isRoundOpen =
    activeMatchingRound != null &&
    item.matchingRound.id != null &&
    Number(item.matchingRound.id) === Number(activeMatchingRound.id)

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelApplication(Number(item.projectId), Number(item.applicationId)),
    onSuccess: () => {
      setCancelOpen(false)
      addToast({
        message: "지원이 취소되었습니다.",
        color: "primary",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
      onCancelled?.()
    },
    onError: () => {
      addToast({
        message: "지원 취소에 실패했습니다. 다시 시도해주세요.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    },
  })

  const handlePlanViewClick = async () => {
    setPopoverOpen(false)
    const newWindow = window.open(
      "about:blank",
      "_blank",
      "noopener,noreferrer",
    )
    try {
      const detail = await getProjectDetail(Number(item.projectId))
      if (detail.externalLink) {
        if (newWindow) newWindow.location.href = detail.externalLink
      } else {
        if (newWindow) newWindow.close()
        addToast({
          message: "등록된 기획안 링크가 없습니다.",
          color: "red",
          variant: "deep",
          type: "default",
          duration: 3000,
        })
      }
    } catch {
      if (newWindow) newWindow.close()
      addToast({
        message: "기획 보기를 불러오는 데 실패했습니다.",
        color: "red",
        variant: "deep",
        type: "default",
        duration: 3000,
      })
    }
  }

  return (
    <>
      <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Popover.Trigger asChild>
          <MoreVerticalIcon />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="end"
            sideOffset={10}
            avoidCollisions={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="shadow-drop-neutral-1 border-teal-gray-50 z-[1100] flex w-[9.5rem] flex-col items-start gap-1 rounded-lg border bg-white px-0.5 pt-2.5 pb-0.5"
          >
            <span className="text-label-3-semibold text-teal-gray-400 px-4">
              바로가기
            </span>
            <div className="flex w-full flex-col">
              <DropdownItem
                label="내 지원서 보기"
                onClick={() => {
                  setPopoverOpen(false)
                  setFormOpen(true)
                }}
              />
              <DropdownItem
                label="기획 보기"
                onClick={() => void handlePlanViewClick()}
              />
              <DropdownItem
                label="지원 취소"
                onClick={() => {
                  setPopoverOpen(false)
                  setCancelOpen(true)
                }}
                className="text-error-500"
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* 내 지원서 모달 */}
      <Modal.Root open={formOpen} onOpenChange={setFormOpen}>
        <Modal.Portal>
          <Modal.Overlay tone="deep" />
          <Modal.Content>
            <MyApplicationModal
              data={toModalData(item)}
              projectId={Number(item.projectId)}
              applicationId={Number(item.applicationId)}
              isRoundOpen={isRoundOpen}
              onClose={() => setFormOpen(false)}
              onCancelled={() => {
                setFormOpen(false)
                onCancelled?.()
              }}
            />
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      {/* 지원 취소 확인 모달 */}
      <CtaModal
        open={cancelOpen}
        title="프로젝트 지원 취소"
        content={
          <>
            {item.project.name} 지원을 취소하시겠습니까?
            <br />
            취소한 지원은 되돌릴 수 없으며, 완전히 삭제됩니다.
            <br />
            현재 차수 내에서만 프로젝트에 다시 지원할 수 있습니다.
          </>
        }
        cancelText="돌아가기"
        confirmText="지원 취소"
        confirmLoading={cancelMutation.isPending}
        variant="error"
        onOpenChange={setCancelOpen}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
      />
    </>
  )
}
