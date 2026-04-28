/**
 * 프로젝트 팀원 수를 “현재 인원 / 최대 인원” 형태로 보여주는 공용 컴포넌트입니다.
 * 피그마 기준: 'Counter' 컴포넌트
 */
import React from "react"

import { cn } from "../lib/utils"

type MemberCountSize = "xs" | "sm" | "md"

interface MemberCountProps {
  current?: number
  total?: number
  size?: MemberCountSize
  className?: string
}

const sizeStyles: Record<MemberCountSize, { number: string; slash: string }> = {
  xs: {
    number: "min-w-2 text-center text-caption-2-regular",
    slash: "w-1.25 text-right text-caption-2-regular",
  },
  sm: {
    number: "min-w-[0.5625rem] text-center text-body-2-medium",
    slash: "w-[0.3125rem] text-right text-body-2-medium",
  },
  md: {
    number: "min-w-[0.625rem] text-right text-body-1-medium",
    slash: "w-[0.3125rem] text-right text-body-1-medium",
  },
}

const MemberCount: React.FC<MemberCountProps> = ({
  current = 0,
  total = 0,
  size = "md",
  className,
}) => {
  const styles = sizeStyles[size]

  return (
    <div
      className={cn(
        "text-teal-gray-500 inline-flex items-center gap-0.5",
        className,
      )}
    >
      <div className={styles.number}>{current}</div>
      <div className={styles.slash}>/</div>
      <div className={styles.number}>{total}</div>
    </div>
  )
}

export default MemberCount
