import MoreVerticalIcon from "@/shared/assets/icon/more/MoreVerticalIcon"
import { cn } from "@/shared/lib/utils"
import { Timestamp } from "@/shared/ui/timestamp/Timestamp"

import { isRecruitmentClosed } from "../model/recruitmentPostStatus"
import { RecruitmentStatusChip } from "./RecruitmentStatusChip"

import type { ReactNode } from "react"

import type { RecruitmentPostStatus } from "../model/recruitmentList"

interface RecruitmentPostRowProps {
  title: string
  editable?: boolean
  // status가 있으면 이 값을 기준으로 모집중/임시저장 뷰를 정확히 판단한다.
  // (없으면 하위호환으로 label 유무 + done으로 판단)
  status?: RecruitmentPostStatus
  // 모집중 상태일 때
  startLabel?: string
  endLabel?: string
  /** 서류 접수 마감 시각. 마감 표시는 status 가 아니라 이 값으로 정한다. */
  documentEndAt?: string | null
  done?: boolean
  // 임시저장 상태일 때
  dateLabel?: string
  authorLabel?: string
  rightAction?: ReactNode
  className?: string
}

export function RecruitmentPostRow({
  title,
  editable = false,
  status,
  startLabel,
  endLabel,
  documentEndAt,
  done = false,
  dateLabel,
  authorLabel,
  rightAction,
  className,
}: RecruitmentPostRowProps) {
  const isRecruiting =
    status != null ? status !== "DRAFT" : startLabel != null && endLabel != null
  // 마감 처리를 누르지 않아도 서류 기간이 끝나면 마감이다. status 만 보면 몇 주
  // 전에 끝난 공고가 계속 모집 중으로 보인다.
  const isClosed =
    status != null ? isRecruitmentClosed({ status, documentEndAt }) : done

  return (
    <div
      className={cn(
        "group flex w-full items-center justify-between bg-white px-5 py-4.5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {isRecruiting && (
          <div className="pt-px">
            <RecruitmentStatusChip done={isClosed} />
          </div>
        )}

        <div className="flex flex-col items-start">
          <div className="text-body-1-medium group-hover:text-body-1-semibold text-teal-gray-900 group-hover:text-teal-500">
            {title}
          </div>

          {isRecruiting ? (
            <div className="flex items-start gap-0.5">
              <Timestamp>{startLabel}</Timestamp>
              <Timestamp>~</Timestamp>
              <Timestamp>{endLabel}</Timestamp>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <Timestamp className="text-teal-gray-400">{dateLabel}</Timestamp>
              {/* author가 없는(탈퇴 등) 라운드도 있을 수 있다. 모르는 값을 함부로
                  채워 보여주지 않고 줄 자체를 생략한다. */}
              {authorLabel && (
                <span className="flex items-center gap-1">
                  <Timestamp className="text-teal-gray-400">작성자:</Timestamp>
                  <Timestamp className="text-teal-gray-400">
                    {authorLabel}
                  </Timestamp>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {editable && (rightAction ?? <MoreVerticalIcon />)}
    </div>
  )
}
