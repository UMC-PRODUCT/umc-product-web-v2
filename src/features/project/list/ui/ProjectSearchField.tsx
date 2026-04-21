export function ProjectSearchField() {
  return (
    <div className="bg-teal-gray-100 flex h-11 w-[28.5rem] items-center justify-between rounded-xl px-4">
      <input
        type="text"
        placeholder="프로젝트 명으로 검색하세요."
        aria-label="프로젝트 검색"
        className="text-body-2-medium text-teal-gray-900 placeholder:text-teal-gray-400 w-full bg-transparent outline-none"
      />
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M11.6504 1.90039C16.4829 1.90039 20.4004 5.8179 20.4004 10.6504C20.4004 12.7966 19.6261 14.761 18.3438 16.2832L22.1807 20.1201C22.4736 20.413 22.4736 20.8878 22.1807 21.1807C21.8878 21.4736 21.413 21.4736 21.1201 21.1807L17.2832 17.3438C15.761 18.6261 13.7966 19.4004 11.6504 19.4004C6.8179 19.4004 2.90039 15.4829 2.90039 10.6504C2.90039 5.8179 6.8179 1.90039 11.6504 1.90039ZM11.6504 3.40039C7.64633 3.40039 4.40039 6.64633 4.40039 10.6504C4.40039 14.6545 7.64633 17.9004 11.6504 17.9004C15.6545 17.9004 18.9004 14.6545 18.9004 10.6504C18.9004 6.64633 15.6545 3.40039 11.6504 3.40039Z"
          fill="#9CA3A3"
        />
      </svg>
    </div>
  )
}
