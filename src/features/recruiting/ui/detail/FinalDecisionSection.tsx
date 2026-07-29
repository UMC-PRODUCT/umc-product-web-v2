import { useState } from "react"

import { cn } from "@/shared/lib/utils"
import { PART_TAG_LABEL } from "@/shared/model/domain"
import { CtaModal } from "@/shared/ui/modal/CtaModal"

import { useFinalDecision } from "../../hooks/useEvaluationMutations"
import { toPartTags } from "../../model/applicantMapper"
import {
  buildFinalDecisionBody,
  toAcceptableTracks,
} from "../../model/evaluationRules"
import { EvaluationResultToggle } from "./EvaluationResultToggle"

import type {
  RecruitingApplicationSummary,
  RecruitingTrack,
} from "../../api/types"
import type { EvaluationResult } from "../../model/applicantListTypes"

interface FinalDecisionSectionProps {
  label: string
  application: RecruitingApplicationSummary
  currentResult: EvaluationResult | null
  canDecide: boolean
}

function trackLabel(track: RecruitingTrack): string {
  const [tag] = toPartTags(track, null)
  return tag ? PART_TAG_LABEL[tag] : track
}

export function FinalDecisionSection({
  label,
  application,
  currentResult,
  canDecide,
}: FinalDecisionSectionProps) {
  const decideFinal = useFinalDecision(String(application.applicationId))
  const tracks = toAcceptableTracks(application)
  const [pending, setPending] = useState<EvaluationResult | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<RecruitingTrack | null>(
    null,
  )

  const openConfirm = (next: EvaluationResult) => {
    setPending(next)
    setSelectedTrack(next === "pass" ? (tracks[0] ?? null) : null)
  }

  const closeConfirm = () => {
    setPending(null)
    setSelectedTrack(null)
  }

  const confirm = async () => {
    if (!pending) return
    const body = buildFinalDecisionBody(
      pending === "pass" ? "PASS" : "FAIL",
      selectedTrack,
    )
    if (!body) return
    await decideFinal.mutateAsync(body)
    closeConfirm()
  }

  const needsTrackChoice = pending === "pass" && tracks.length > 1

  return (
    <>
      <div className="flex items-center justify-center gap-4 pt-2">
        <span className="text-heading-7-semibold text-teal-gray-800">
          {label}
        </span>
        <EvaluationResultToggle
          value={currentResult}
          onChange={openConfirm}
          disabled={!canDecide}
          variant="strong"
          failLabel="최종 불합격"
          passLabel="최종 합격"
        />
      </div>

      <CtaModal
        open={pending != null}
        variant={pending === "pass" ? "success" : "warning"}
        title={pending === "pass" ? "최종 합격 처리" : "최종 불합격 처리"}
        confirmText="확인"
        cancelText="취소"
        confirmLoading={decideFinal.isPending}
        onOpenChange={(open) => {
          if (!open) closeConfirm()
        }}
        onCancel={closeConfirm}
        onConfirm={confirm}
        content={
          <div className="flex flex-col gap-4">
            <p>
              {application.applicantName} 지원자를{" "}
              {pending === "pass" ? "최종 합격" : "최종 불합격"} 처리합니다.
            </p>
            {needsTrackChoice && (
              <div className="flex flex-col gap-2">
                <span className="text-body-2-medium text-teal-gray-700">
                  합격 파트를 선택해주세요.
                </span>
                <div className="flex gap-2">
                  {tracks.map((track) => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => setSelectedTrack(track)}
                      className={cn(
                        "text-body-2-medium rounded-[8px] border px-3 py-2",
                        selectedTrack === track
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-teal-gray-200 text-teal-gray-600",
                      )}
                    >
                      {trackLabel(track)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    </>
  )
}
