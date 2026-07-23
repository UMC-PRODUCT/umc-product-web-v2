import { useState } from "react"

import { CounterLabel } from "@/shared/ui/CounterLabel"

export function ChapterSharedNote() {
  const [note, setNote] = useState("")
  const maxLength = 1000

  return (
    <div className="border-teal-gray-100 shadow-drop-neutral-3 relative box-border flex h-68.5 flex-col gap-5 rounded-[12px] border bg-white px-8 pt-7 pb-7.5">
      <div className="flex flex-col gap-1">
        <span className="text-heading-6-semibold text-teal-gray-800">
          공유 메모
        </span>

        <p className="text-body-2-regular text-teal-gray-500">
          지부 운영진과 내용이 공유됩니다.
        </p>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={maxLength}
        placeholder={
          "지부 관리 및 소속 학교 배정과 관련된 메모를 남길 수 있습니다."
        }
        className="text-body-1-regular bg-teal-gray-50 placeholder:text-teal-gray-400 text-teal-gray-900 shadow-inner-neutral-3 flex-1 resize-none overflow-y-auto rounded-[12px] px-8 pt-6 pb-[67px] outline-none"
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
