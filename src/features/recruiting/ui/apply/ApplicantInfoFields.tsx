import { PART_KEY_TO_TRACK, PARTS } from "../../model/parts"

import type { RecruitingTrack } from "../../api/types"

const TRACK_LABEL: Partial<Record<RecruitingTrack, string>> =
  Object.fromEntries(
    PARTS.map((part) => [PART_KEY_TO_TRACK[part.key], part.label]),
  )

function trackLabel(track: RecruitingTrack) {
  return TRACK_LABEL[track] ?? track
}

export interface ApplicantInfo {
  applicantName: string
  applicantEmail: string
  firstChoice: RecruitingTrack | undefined
  secondChoice: RecruitingTrack | undefined
}

interface ApplicantInfoFieldsProps {
  value: ApplicantInfo
  onChange: (partial: Partial<ApplicantInfo>) => void
  recruitableTracks: RecruitingTrack[]
  secondChoiceEnabled: boolean
  disabled?: boolean
}

// 이름·이메일·지망은 Form 문항이 아니라 지원서 자체의 필드다. 서버가 지망에 따라
// 문항 구조를 다르게 내려주므로 지망은 문항보다 먼저 정해져야 한다.
export function ApplicantInfoFields({
  value,
  onChange,
  recruitableTracks,
  secondChoiceEnabled,
  disabled = false,
}: ApplicantInfoFieldsProps) {
  const secondChoices = recruitableTracks.filter(
    (track) => track !== value.firstChoice,
  )

  return (
    <div className="border-teal-gray-100 flex flex-col gap-6 rounded-[12px] border bg-white px-7 py-7">
      <h3 className="text-heading-6-semibold text-teal-gray-800">
        지원자 정보
      </h3>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="applicant-name"
          className="text-body-2-medium text-teal-gray-700"
        >
          이름
        </label>
        <input
          id="applicant-name"
          value={value.applicantName}
          disabled={disabled}
          onChange={(event) => onChange({ applicantName: event.target.value })}
          placeholder="이름을 입력해 주세요"
          className="border-teal-gray-200 text-body-2-regular text-teal-gray-700 placeholder:text-teal-gray-300 disabled:bg-teal-gray-50 h-11 rounded-[10px] border px-4 outline-none focus:border-teal-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="applicant-email"
          className="text-body-2-medium text-teal-gray-700"
        >
          이메일
        </label>
        <input
          id="applicant-email"
          type="email"
          value={value.applicantEmail}
          disabled={disabled}
          onChange={(event) => onChange({ applicantEmail: event.target.value })}
          placeholder="연락받을 이메일을 입력해 주세요"
          className="border-teal-gray-200 text-body-2-regular text-teal-gray-700 placeholder:text-teal-gray-300 disabled:bg-teal-gray-50 h-11 rounded-[10px] border px-4 outline-none focus:border-teal-500"
        />
        <span className="text-label-1-medium text-teal-gray-400">
          지원 코드와 합격 안내를 이 주소로 보냅니다.
        </span>
      </div>

      <TrackPicker
        label="1지망"
        tracks={recruitableTracks}
        selected={value.firstChoice}
        disabled={disabled}
        onSelect={(track) => {
          // 2지망이 1지망과 같아지면 서버가 거부한다.
          onChange({
            firstChoice: track,
            secondChoice:
              value.secondChoice === track ? undefined : value.secondChoice,
          })
        }}
      />

      {secondChoiceEnabled && (
        <TrackPicker
          label="2지망 (선택)"
          tracks={secondChoices}
          selected={value.secondChoice}
          disabled={disabled}
          allowClear
          onSelect={(track) => onChange({ secondChoice: track })}
          onClear={() => onChange({ secondChoice: undefined })}
        />
      )}
    </div>
  )
}

function TrackPicker({
  label,
  tracks,
  selected,
  disabled,
  allowClear = false,
  onSelect,
  onClear,
}: {
  label: string
  tracks: RecruitingTrack[]
  selected: RecruitingTrack | undefined
  disabled: boolean
  allowClear?: boolean
  onSelect: (track: RecruitingTrack) => void
  onClear?: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-2-medium text-teal-gray-700">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {tracks.map((track) => {
          const isSelected = selected === track
          return (
            <button
              key={track}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => {
                if (isSelected && allowClear) {
                  onClear?.()
                  return
                }
                onSelect(track)
              }}
              className={
                isSelected
                  ? "text-label-1-medium h-10 cursor-pointer rounded-[10px] border border-teal-500 bg-teal-50 px-4 text-teal-700"
                  : "text-label-1-medium text-teal-gray-600 border-teal-gray-200 hover:bg-teal-gray-50 h-10 cursor-pointer rounded-[10px] border bg-white px-4"
              }
            >
              {trackLabel(track)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
