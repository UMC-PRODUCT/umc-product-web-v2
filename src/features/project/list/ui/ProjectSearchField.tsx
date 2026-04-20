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
          d="M11.6504 2C16.4277 2 20.3008 5.87313 20.3008 10.6504C20.3008 12.8048 19.5101 14.7728 18.207 16.2871L22.1104 20.1904C22.3642 20.4443 22.3642 20.8565 22.1104 21.1104C21.8565 21.3642 21.4443 21.3642 21.1904 21.1104L17.2871 17.207C15.7728 18.5101 13.8048 19.3008 11.6504 19.3008C6.87313 19.3008 3 15.4277 3 10.6504C3 5.87313 6.87313 2 11.6504 2ZM11.6504 3.30078C7.5911 3.30078 4.30078 6.5911 4.30078 10.6504C4.30078 14.7097 7.5911 18 11.6504 18C15.7097 18 19 14.7097 19 10.6504C19 6.5911 15.7097 3.30078 11.6504 3.30078Z"
          fill="#9CA3A3"
        />
      </svg>
    </div>
  )
}
