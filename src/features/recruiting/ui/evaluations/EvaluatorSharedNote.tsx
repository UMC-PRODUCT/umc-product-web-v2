import { useState } from "react"

import { CounterLabel } from "@/shared/ui/CounterLabel"

export function EvaluatorSharedNote() {
  const [note, setNote] = useState("")
  const maxLength = 1000

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 relative box-border flex h-68.5 flex-col gap-5 rounded-[12px] border bg-white px-8 pt-7 pb-7.5">
      <div className="flex flex-col gap-1">
        <span className="text-heading-6-semibold text-teal-gray-800">
          공유 메모
        </span>

        <p className="text-body-2-regular text-teal-gray-500">
          교내 운영진과 내용이 공유됩니다.
        </p>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={maxLength}
        placeholder={
          "평가 담당자 배정과 관련된 메모를 남길 수 있습니다.\nex. 윰씨/유엠씨 7/7~12 2시부터 면접 가능"
        }
        className="text-tealgray-900 text-body-1-regular bg-teal-gray-50 placeholder:text-teal-gray-400 shadow-inner-neutral-3 flex-1 resize-none overflow-y-auto rounded-[12px] px-8 pt-6 pb-[67px] outline-none"
      />

      <CounterLabel
        current={note.length}
        total={maxLength}
        size="sm"
        className="text-teal-gray-400 absolute right-16 bottom-15"
      />
    </div>
  )
}
